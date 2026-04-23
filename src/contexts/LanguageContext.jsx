import { useState } from 'react'
import { LanguageContext } from './LanguageContextValue'
import { translations } from '../i18n/translations'

const STORAGE_KEY = 'films-explorer-language'
const SUPPORTED_LANGUAGES = ['pt', 'en', 'es']

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    return SUPPORTED_LANGUAGES.includes(stored) ? stored : 'pt'
  })

  const setAppLanguage = (nextLanguage) => {
    if (!SUPPORTED_LANGUAGES.includes(nextLanguage)) return
    setLanguage(nextLanguage)
    localStorage.setItem(STORAGE_KEY, nextLanguage)
  }

  const t = (key, params = {}) => {
    const template = translations[language]?.[key] ?? translations.pt[key] ?? key
    return Object.entries(params).reduce(
      (acc, [paramKey, value]) => acc.replaceAll(`{{${paramKey}}}`, String(value)),
      template,
    )
  }

  const value = { language, setLanguage: setAppLanguage, t }

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}
