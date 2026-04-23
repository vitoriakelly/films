import { useContext } from 'react'
import { FavoritesContext } from '../contexts/FavoritesContext'

export const useFavorites = () => {
  const context = useContext(FavoritesContext)
  if (!context) throw new Error('useFavorites deve ser usado dentro de FavoritesProvider')
  return context
}
