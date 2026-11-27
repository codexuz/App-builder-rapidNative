/** Uzbekistan mobile numbers: `+998` followed by 9 national digits. */
export const UZ_COUNTRY_CODE = '+998';
const NATIONAL_NUMBER_LENGTH = 9;

export function digitsOnly(input: string): string {
  const digits = input.replace(/\D/g, '');
  const stripped = digits.startsWith('998') && digits.length > NATIONAL_NUMBER_LENGTH
    ? digits.slice(3)
    : digits;
  return stripped.slice(0, NATIONAL_NUMBER_LENGTH);
}

export function formatNationalNumber(digits: string): string {
  const parts = [digits.slice(0, 2), digits.slice(2, 5), digits.slice(5, 7), digits.slice(7, 9)];
  return parts.filter(Boolean).join(' ');
}

export function isCompleteNationalNumber(digits: string): boolean {
  return digits.length === NATIONAL_NUMBER_LENGTH;
}

export function toE164(digits: string): string {
  return `${UZ_COUNTRY_CODE}${digits}`;
}
