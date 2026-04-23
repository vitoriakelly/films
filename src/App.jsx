import { Moon, Sun } from 'lucide-react'
import { Route, Routes } from 'react-router-dom'
import { FavoritesProvider } from './contexts/FavoritesContext'
import { LanguageProvider } from './contexts/LanguageContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { useLanguage } from './hooks/useLanguage'
import { useTheme } from './hooks/useTheme'
import { HomePage } from './pages/HomePage'
import { MovieDetailsPage } from './pages/MovieDetailsPage'

const languageOptions = [
  { code: 'pt', flag: '🇧🇷', label: 'PT' },
  { code: 'en', flag: '🇺🇸', label: 'EN' },
  { code: 'es', flag: '🇪🇸', label: 'ES' },
]

const AppShell = () => {
  const { language, setLanguage, t } = useLanguage()
  const { isLight, toggleTheme } = useTheme()

  return (
    <div className={`min-h-screen ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
      <header className="mx-auto flex w-full max-w-7xl items-center justify-end gap-2 px-4 pt-5 md:px-8">
        <div
          className={`inline-flex items-center gap-1 rounded-full border p-1 ${
            isLight ? 'border-slate-300 bg-white' : 'border-slate-700 bg-slate-900/70'
          }`}
        >
          {languageOptions.map((option) => (
            <button
              key={option.code}
              type="button"
              onClick={() => setLanguage(option.code)}
              className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold transition ${
                language === option.code
                  ? 'bg-cyan-500 text-slate-950'
                  : isLight
                    ? 'text-slate-700 hover:bg-slate-100'
                    : 'text-slate-200 hover:bg-slate-800'
              }`}
            >
              <span>{option.flag}</span>
              <span>{option.label}</span>
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={toggleTheme}
          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold transition ${
            isLight
              ? 'border-slate-300 bg-white text-slate-700 hover:border-indigo-400'
              : 'border-slate-700 bg-slate-900/70 text-slate-100 hover:border-cyan-400'
          }`}
        >
          {isLight ? <Moon size={16} /> : <Sun size={16} />}
          {isLight ? t('darkMode') : t('lightMode')}
        </button>
      </header>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/filme/:id" element={<MovieDetailsPage />} />
      </Routes>
    </div>
  )
}

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <FavoritesProvider>
          <AppShell />
        </FavoritesProvider>
      </LanguageProvider>
    </ThemeProvider>
  )
}

export default App
