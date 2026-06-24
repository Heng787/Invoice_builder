import { SAMPLE_DATA } from '../constants/variableFields.js'

/**
 * Resolve template variables in a string
 * e.g. "Invoice #{{invoice.number}}" → "Invoice #INV-2024-0001"
 */
export function resolveVariables(template, data = SAMPLE_DATA, previewMode = false) {
  if (!template || typeof template !== 'string') return template

  return template.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
    const trimmed = path.trim()
    const value = getNestedValue(data, trimmed)
    if (value === undefined || value === null) {
      return previewMode ? `[${trimmed}]` : match
    }
    return String(value)
  })
}

/**
 * Get a nested value from an object using dot notation
 * e.g. getNestedValue(data, 'invoice.total') → 1045.00
 */
export function getNestedValue(obj, path) {
  return path.split('.').reduce((acc, key) => {
    if (acc === null || acc === undefined) return undefined
    return acc[key]
  }, obj)
}

/**
 * Format a value based on its type and format string
 */
export function formatValue(value, type, format = {}) {
  if (value === null || value === undefined) return ''

  switch (type) {
    case 'date':
      return formatDate(value, format.dateFormat)
    case 'number':
      return formatNumber(value, format)
    case 'currency':
      return formatCurrency(value, format)
    default:
      return String(value)
  }
}

function formatDate(value, dateFormat = 'DD/MM/YYYY') {
  try {
    const d = new Date(value)
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    return dateFormat
      .replace('DD', day)
      .replace('MM', month)
      .replace('YYYY', year)
  } catch {
    return String(value)
  }
}

function formatNumber(value, { decimals = 2, separator = ',' } = {}) {
  const num = parseFloat(value)
  if (isNaN(num)) return String(value)
  return num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

function formatCurrency(value, { currency = 'USD', locale = 'en-US' } = {}) {
  const num = parseFloat(value)
  if (isNaN(num)) return String(value)
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(num)
}
