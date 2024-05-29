// export all utils
/**
 * Format a number as a currency string.
 * @param amount - The amount to format.
 * @param currency - The currency code (e.g., 'USD', 'EUR'). Defaults to 'USD'.
 * @returns The formatted currency string.
 */
export function formatMoney (amount: number, currency: string = 'RWF'): string {
  return amount.toLocaleString('en-US', { style: 'currency', currency });
}
/**
 * Format a date string into a more readable format.
 * @param dateString - The date string to format.
 * @returns The formatted date string.
 */
export function formatDate (dateString: Date): string {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', options);
}
