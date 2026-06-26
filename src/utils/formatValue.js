export function formatValue(value, format) {
  if (!format || format.type === 'general')
    return String(value ?? '')

  if (format.type === 'number') {
    const num = parseFloat(value)
    if (isNaN(num)) return value
    return num.toLocaleString('en-US', {
      minimumFractionDigits: format.decimals ?? 2,
      maximumFractionDigits: format.decimals ?? 2,
      useGrouping: format.separator ?? true
    })
  }

  if (format.type === 'currency') {
    const num = parseFloat(value)
    if (isNaN(num)) return value
    const formatted = num.toLocaleString('en-US', {
      minimumFractionDigits: format.decimals ?? 2,
      maximumFractionDigits: format.decimals ?? 2,
      useGrouping: format.separator ?? true
    })
    return `${format.symbol ?? '$'}${formatted}`
  }

  if (format.type === 'accounting') {
    const num = parseFloat(value)
    if (isNaN(num)) return value
    if (num < 0) {
      const abs = Math.abs(num).toLocaleString('en-US', {
        minimumFractionDigits: format.decimals ?? 2,
        maximumFractionDigits: format.decimals ?? 2
      })
      return `(${format.symbol ?? '$'}${abs})`
    }
    const pos = num.toLocaleString('en-US', {
      minimumFractionDigits: format.decimals ?? 2,
      maximumFractionDigits: format.decimals ?? 2
    })
    return `${format.symbol ?? '$'}${pos}`
  }

  if (format.type === 'percentage') {
    const num = parseFloat(value)
    if (isNaN(num)) return value
    const factor = format.isDecimal ? 100 : 1
    return (num * factor).toFixed(format.decimals ?? 2) + '%'
  }

  if (format.type === 'date') {
    if (!value) return value
    const d = new Date(value)
    if (isNaN(d)) return value
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth()+1).padStart(2,'0')
    const year = d.getFullYear()
    const fmt = format.dateFormat ?? 'DD/MM/YYYY'
    return fmt
      .replace('DD', day)
      .replace('MM', month)
      .replace('YYYY', year)
  }

  if (format.type === 'text') return String(value ?? '')

  return String(value ?? '')
}
