import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

const CURRENCIES = [
  { code: 'USD', symbol: '$',  name: 'US Dollar' },
  { code: 'EUR', symbol: '€',  name: 'Euro' },
  { code: 'GBP', symbol: '£',  name: 'British Pound' },
  { code: 'KHR', symbol: '៛', name: 'Cambodian Riel' },
  { code: 'THB', symbol: '฿',  name: 'Thai Baht' },
  { code: 'JPY', symbol: '¥',  name: 'Japanese Yen' },
  { code: 'CNY', symbol: '¥',  name: 'Chinese Yuan' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
]

const FONTS = [
  { name: 'Noto Sans',       value: '"Noto Sans", sans-serif' },
  { name: 'Noto Sans Khmer', value: '"Noto Sans Khmer", sans-serif' },
  { name: 'Battambang',      value: '"Battambang", cursive' },
  { name: 'Siemreap',        value: '"Siemreap", cursive' },
  { name: 'Nokora',          value: '"Nokora", sans-serif' },
  { name: 'Moul',            value: '"Moul", cursive' },
  { name: 'Angkor',          value: '"Angkor", cursive' },
  { name: 'Koulen',          value: '"Koulen", cursive' },
  { name: 'Taprom',          value: '"Taprom", cursive' },
  { name: 'Bayon',           value: '"Bayon", sans-serif' },
  { name: 'Inter',           value: '"Inter", sans-serif' },
  { name: 'Roboto',          value: '"Roboto", sans-serif' },
  { name: 'Open Sans',       value: '"Open Sans", sans-serif' },
  { name: 'Lato',            value: '"Lato", sans-serif' },
  { name: 'Poppins',         value: '"Poppins", sans-serif' },
  { name: 'Montserrat',      value: '"Montserrat", sans-serif' },
  { name: 'Source Sans 3',   value: '"Source Sans 3", sans-serif' },
  { name: 'Georgia',         value: 'Georgia, serif' },
  { name: 'Times New Roman', value: '"Times New Roman", serif' },
]

const DOCUMENT_TYPES = ['Custom']

/**
 * Pinia store for application settings (company, currency, fonts, etc.)
 */
export const useSettingsStore = defineStore('settings', () => {
  // State
  const company = ref('My Company')
  const documentType = ref('Custom')
  const currency = ref('USD')
  const globalFont = ref('"Noto Sans", sans-serif')
  const globalFontSize = ref(13)

  const language = ref(localStorage.getItem('invoice_builder_lang') || 'en')
  const theme = ref(localStorage.getItem('invoice_builder_theme') || 'dark')
  const currencies = ref(CURRENCIES)
  const fonts = ref(FONTS)
  const documentTypes = ref(DOCUMENT_TYPES)

  const globalFormat = ref({
    currencySymbol: '$',
    decimals: 2,
    separator: true,
    dateFormat: 'DD/MM/YYYY'
  })

  // Update currency symbol when currency changes
  watch(currency, (newCode) => {
    const cur = CURRENCIES.find(c => c.code === newCode)
    if (cur) {
      globalFormat.value.currencySymbol = cur.symbol
    }
  }, { immediate: true })

  // Actions

  // Sets the application language
   
  function setLanguage(lang) {
    language.value = lang
    localStorage.setItem('invoice_builder_lang', lang)
  }

  // Sets the currency code
   
  function setCurrency(code) { currency.value = code }

  function toggleTheme() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
    localStorage.setItem('invoice_builder_theme', theme.value)
  }

  // Sets the document type
 
  function setDocumentType(type) { documentType.value = type }


  // Sets the global font
  
  function setGlobalFont(font) { globalFont.value = font }

  // Sets the global font size
 
  function setGlobalFontSize(size) { globalFontSize.value = size }

  // Sets the company name
 
  function setCompany(name) { company.value = name }

  
  // Returns the current currency object
   
  function currentCurrency() {
    return CURRENCIES.find(c => c.code === currency.value) ?? CURRENCIES[0]
  }

  return {
    // State
    company,
    documentType,
    currency,
    globalFont,
    globalFontSize,
    language,
    theme,
    currencies,
    fonts,
    documentTypes,
    globalFormat,
    // Actions
    setCurrency,
    setDocumentType,
    setGlobalFont,
    setGlobalFontSize,
    setCompany,
    setLanguage,
    toggleTheme,
    currentCurrency,
  }
})