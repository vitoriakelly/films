import { createContext, useState } from 'react'

const FavoritesContext = createContext(null)
const STORAGE_KEY = 'films-explorer-favorites'

const getInitialFavorites = () => {
  try {
    const rawValue = localStorage.getItem(STORAGE_KEY)
    return rawValue ? JSON.parse(rawValue) : []
  } catch {
    return []
  }
}

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState(getInitialFavorites)

  const persistFavorites = (nextFavorites) => {
    setFavorites(nextFavorites)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextFavorites))
  }

  const isFavorite = (movieId) => favorites.includes(movieId)

  const toggleFavorite = (movieId) => {
    if (isFavorite(movieId)) {
      persistFavorites(favorites.filter((id) => id !== movieId))
      return
    }
    persistFavorites([...favorites, movieId])
  }

  const value = { favorites, isFavorite, toggleFavorite }

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
}

export { FavoritesContext }
