/**
 * Russian pluralization helper.
 * @param {number} n - The number
 * @param {string[]} forms - [one, few, many] e.g. ['день', 'дня', 'дней']
 * @returns {string} The correct form
 */
export function pluralRu(n, forms) {
  const [one, few, many] = forms
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return one
  if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) return few
  return many
}
