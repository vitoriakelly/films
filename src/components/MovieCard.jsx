import { CalendarDays, Heart, Star } from 'lucide-react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useFavorites } from '../hooks/useFavorites'
import { useLanguage } from '../hooks/useLanguage'
import { useTheme } from '../hooks/useTheme'
import { imageUrl } from '../services/tmdb'

export const MovieCard = ({ movie, layout = 'carousel' }) => {
  const { isFavorite, toggleFavorite } = useFavorites()
  const { t } = useLanguage()
  const { isLight } = useTheme()
  const year = movie.release_date ? new Date(movie.release_date).getFullYear() : '---'
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'
  const favorite = isFavorite(movie.id)
  const containerClasses = isLight
    ? 'border-slate-300 bg-white/85 shadow-indigo-100/80 hover:border-indigo-400/60'
    : 'border-slate-700/70 bg-slate-900/60 shadow-cyan-950/20 hover:border-cyan-400/50'
  const titleClasses = isLight ? 'text-slate-900' : 'text-slate-100'
  const metaClasses = isLight ? 'text-slate-700' : 'text-slate-300'
  const widthClasses = layout === 'grid' ? 'w-full' : 'w-[250px] shrink-0'

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.26 }}
    >
      <Link
        to={`/filme/${movie.id}`}
        className={`group relative block ${widthClasses} snap-start overflow-hidden rounded-2xl border shadow-lg transition duration-300 ${containerClasses}`}
      >
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault()
            toggleFavorite(movie.id)
          }}
          className={`absolute right-3 top-3 z-10 rounded-full p-2 backdrop-blur transition ${
            favorite
              ? 'bg-rose-500 text-white'
              : isLight
                ? 'bg-white/90 text-slate-700 hover:text-rose-500'
                : 'bg-slate-950/70 text-slate-200 hover:text-rose-400'
          }`}
          aria-label={favorite ? t('removeFavorite') : t('addFavorite')}
        >
          <Heart size={16} fill={favorite ? 'currentColor' : 'none'} />
        </button>
        <img
          src={imageUrl(movie.poster_path)}
          alt={t('posterOf', { title: movie.title })}
          className="h-[360px] w-full object-cover transition duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="space-y-3 p-4">
          <h3 className={`line-clamp-1 text-lg font-semibold ${titleClasses}`}>{movie.title}</h3>
          <div className={`flex items-center justify-between text-sm ${metaClasses}`}>
            <p className="flex items-center gap-1.5">
              <CalendarDays size={16} />
              {year}
            </p>
            <p className="flex items-center gap-1.5 text-amber-300">
              <Star size={16} fill="currentColor" />
              {rating}
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
