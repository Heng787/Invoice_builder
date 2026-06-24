/**
 * Simple formula engine for block formulas
 * Supports: +, -, *, /, parentheses, variable references
 */

/**
 * Evaluate a formula string with a data context
 * e.g. evaluate('qty * price', { qty: 5, price: 20 }) → 100
 */
export function evaluate(formula, context = {}) {
  if (!formula || typeof formula !== 'string') return null

  try {
    // Replace variable names with their values
    let expression = formula
    for (const [key, value] of Object.entries(context)) {
      const safeKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      expression = expression.replace(new RegExp(`\\b${safeKey}\\b`, 'g'), String(value))
    }

    // Evaluate the sanitized expression (only allow safe math characters)
    if (!/^[\d\s+\-*/().%,]+$/.test(expression)) {
      console.warn('[formulaEngine] Unsafe expression blocked:', expression)
      return null
    }

    // eslint-disable-next-line no-new-func
    const result = Function(`"use strict"; return (${expression})`)()
    return typeof result === 'number' ? result : null
  } catch (err) {
    console.warn('[formulaEngine] Evaluation error:', err.message)
    return null
  }
}

/**
 * Calculate invoice totals from line items
 */
export function calcTotals(items = [], taxRate = 0, discountValue = 0, discountType = 'fixed') {
  const subtotal = items.reduce((sum, item) => {
    const qty = parseFloat(item.qty) || 0
    const price = parseFloat(item.unit_price) || 0
    const itemDiscount = parseFloat(item.discount) || 0
    return sum + (qty * price - itemDiscount)
  }, 0)

  const discount = discountType === 'percent'
    ? subtotal * (discountValue / 100)
    : parseFloat(discountValue) || 0

  const taxable = subtotal - discount
  const tax = taxable * (parseFloat(taxRate) / 100)
  const total = taxable + tax

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    discount: Math.round(discount * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    total: Math.round(total * 100) / 100,
  }
}

/**
 * Convert a number to words (English)
 */
export function numberToWords(amount, currency = 'USD') {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen']
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']

  function toWords(n) {
    if (n === 0) return ''
    if (n < 20) return ones[n]
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '')
    if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + toWords(n % 100) : '')
    if (n < 1000000) return toWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + toWords(n % 1000) : '')
    return toWords(Math.floor(n / 1000000)) + ' Million' + (n % 1000000 ? ' ' + toWords(n % 1000000) : '')
  }

  const int = Math.floor(amount)
  const dec = Math.round((amount - int) * 100)
  const words = int === 0 ? 'Zero' : toWords(int)
  const centsLabel = currency === 'USD' ? 'Cents' : 'Satang'
  const dollarLabel = currency === 'USD' ? 'Dollars' : currency

  return dec > 0
    ? `${words} ${dollarLabel} and ${toWords(dec)} ${centsLabel} Only`
    : `${words} ${dollarLabel} Only`
}
