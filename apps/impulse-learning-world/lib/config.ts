import Constants from 'expo-constants';

interface StudentBrandExtra {
  apiBase?: string;
  center?: string;
  appName?: string;
  color?: string;
  audience?: string;
  ageRange?: string;
}

const brandExtra =
  (Constants.expoConfig?.extra?.studentBrand as StudentBrandExtra | undefined) ?? {};

function stripTrailingSlashes(url: string): string {
  return url.replace(/\/+$/, '');
}

export const AppConfig = {
  apiBase: stripTrailingSlashes(
    process.env.EXPO_PUBLIC_API_URL ||
      brandExtra.apiBase ||
      'https://api.neezam.uz/api/v1'
  ),
  apiOrigin: stripTrailingSlashes(
    (
      process.env.EXPO_PUBLIC_API_URL ||
      brandExtra.apiBase ||
      'https://api.neezam.uz/api/v1'
    ).replace(/\/api\/v1\/?$/, '')
  ),
  centerSlug: process.env.EXPO_PUBLIC_CENTER || brandExtra.center || 'impulse',
  appName: process.env.EXPO_PUBLIC_APP_NAME || brandExtra.appName || 'Impulse Kids',
  brandColor: process.env.EXPO_PUBLIC_BRAND_COLOR || brandExtra.color || '#1055F8',
  clientHeader: 'student-app',
  ageRange: brandExtra.ageRange || '5-13',
  applicationId: 'kids.impulse.uz',
} as const;
