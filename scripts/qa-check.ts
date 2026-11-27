import fs from 'node:fs';
import path from 'node:path';
import { QaReportSchema } from '../schemas';
import { getFactoryDir, recordStageStatus } from './lib/state';

const PASS_SCORE_THRESHOLD = 85;

function main(): void {
  const args = process.argv.slice(2);
  const slug = args.find((a) => !a.startsWith('--'));
  const iterFlagIdx = args.indexOf('--iteration');
  const requestedIter =
    iterFlagIdx !== -1 && args[iterFlagIdx + 1] ? Number(args[iterFlagIdx + 1]) : undefined;

  if (!slug) {
    console.error('Usage: pnpm app:qa-check <app-slug> [--iteration N]');
    process.exit(1);
  }

  const rootDir = process.cwd();
  const appDir = path.join(rootDir, 'apps', slug);
  const qaDir = path.join(getFactoryDir(appDir), 'qa');

  if (!fs.existsSync(qaDir)) {
    console.error(`No QA directory found at ${path.relative(rootDir, qaDir)}`);
    process.exit(1);
  }

  let reportFile: string;
  if (requestedIter) {
    reportFile = path.join(qaDir, `iteration-${String(requestedIter).padStart(2, '0')}.json`);
  } else {
    const files = fs
      .readdirSync(qaDir)
      .filter((f) => /^iteration-\d+\.json$/.test(f))
      .sort();
    if (files.length === 0) {
      console.error(`No iteration-XX.json QA reports found in ${path.relative(rootDir, qaDir)}`);
      process.exit(1);
    }
    reportFile = path.join(qaDir, files[files.length - 1]);
  }

  if (!fs.existsSync(reportFile)) {
    console.error(`QA report not found: ${path.relative(rootDir, reportFile)}`);
    process.exit(1);
  }

  const parsed = QaReportSchema.safeParse(JSON.parse(fs.readFileSync(reportFile, 'utf8')));
  if (!parsed.success) {
    console.error(`Invalid QA report schema in ${path.basename(reportFile)}:`);
    console.error(parsed.error.toString());
    process.exit(1);
  }

  const report = parsed.data;
  const hardGateFailures: string[] = [];

  if (report.score < PASS_SCORE_THRESHOLD) {
    hardGateFailures.push(`Visual score ${report.score}/100 is below threshold (${PASS_SCORE_THRESHOLD}).`);
  }
  if (report.criticalIssues.length > 0) {
    hardGateFailures.push(`${report.criticalIssues.length} critical issue(s) must be resolved.`);
  }
  if (report.runtimeChecks) {
    if (!report.runtimeChecks.typescriptPassed) hardGateFailures.push('TypeScript check failed.');
    if (!report.runtimeChecks.webBundlePassed) hardGateFailures.push('Expo Web bundle failed.');
    if (report.runtimeChecks.consoleErrors > 0) {
      hardGateFailures.push(`${report.runtimeChecks.consoleErrors} console/runtime error(s) detected.`);
    }
    if (report.runtimeChecks.horizontalOverflowDetected) {
      hardGateFailures.push('Horizontal overflow detected on mobile viewport.');
    }
  }

  console.log(`Visual QA Report (${path.basename(reportFile)}) — Score: ${report.score}/100`);

  if (hardGateFailures.length > 0) {
    recordStageStatus(appDir, slug, 'visual_qa', 'failed', {
      artifactPath: path.relative(rootDir, reportFile),
      lastQaScore: report.score,
      error: hardGateFailures.join(' | '),
      incrementIteration: true,
    });
    console.error('\nQA Gate FAILED:');
    for (const f of hardGateFailures) console.error(`  ✗ ${f}`);
    if (report.repairInstructions.length > 0) {
      console.error('\nTargeted Repair Instructions:');
      for (const r of report.repairInstructions) console.error(`  -> ${r}`);
    }
    process.exit(1);
  }

  recordStageStatus(appDir, slug, 'visual_qa', 'passed', {
    artifactPath: path.relative(rootDir, reportFile),
    lastQaScore: report.score,
  });
  console.log('✓ All Visual & Technical QA hard gates passed.');
}

main();
