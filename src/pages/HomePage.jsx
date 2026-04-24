import { motion } from 'framer-motion'
import { Film, Heart, Search, Sparkles } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { MovieCarousel } from '../components/MovieCarousel'
import { MovieCard } from '../components/MovieCard'
import { MovieSkeleton } from '../components/MovieSkeleton'
import { SectionHeader } from '../components/SectionHeader'
import { useFavorites } from '../hooks/useFavorites'
import { useLanguage } from '../hooks/useLanguage'
import { useTheme } from '../hooks/useTheme'
import { useDebounce } from '../hooks/useDebounce'
import { tmdbService } from '../services/tmdb'

const MoviesCarousel = ({ movies }) => (
  <MovieCarousel>
    {movies.map((movie) => (
      <MovieCard key={movie.id} movie={movie} />
    ))}
  </MovieCarousel>
)

const InfiniteGrid = ({ movies }) => (
  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
    {movies.map((movie) => (
      <MovieCard key={movie.id} movie={movie} layout="grid" />
    ))}
  </div>
)

const GENRE_TRANSLATIONS = {
  pt: {
    Action: 'Acao',
    Adventure: 'Aventura',
    Animation: 'Animacao',
    Anime: 'Anime',
    Children: 'Infantil',
    Comedy: 'Comedia',
    Crime: 'Crime',
    Drama: 'Drama',
    Family: 'Familia',
    Fantasy: 'Fantasia',
    Food: 'Culinaria',
    History: 'Historia',
    Horror: 'Terror',
    Legal: 'Juridico',
    Medical: 'Medico',
    Music: 'Musica',
    Mystery: 'Misterio',
    Nature: 'Natureza',
    Romance: 'Romance',
    ScienceFiction: 'Ficcao cientifica',
    Sports: 'Esportes',
    Supernatural: 'Sobrenatural',
    Thriller: 'Suspense',
    Travel: 'Viagem',
    War: 'Guerra',
    Western: 'Faroeste',
  },
  es: {
    Action: 'Accion',
    Adventure: 'Aventura',
    Animation: 'Animacion',
    Anime: 'Anime',
    Children: 'Infantil',
    Comedy: 'Comedia',
    Crime: 'Crimen',
    Drama: 'Drama',
    Family: 'Familia',
    Fantasy: 'Fantasia',
    Food: 'Cocina',
    History: 'Historia',
    Horror: 'Terror',
    Legal: 'Legal',
    Medical: 'Medico',
    Music: 'Musica',
    Mystery: 'Misterio',
    Nature: 'Naturaleza',
    Romance: 'Romance',
    ScienceFiction: 'Ciencia ficcion',
    Sports: 'Deportes',
    Supernatural: 'Sobrenatural',
    Thriller: 'Suspenso',
    Travel: 'Viajes',
    War: 'Guerra',
    Western: 'Oeste',
  },
}

const normalizeGenreKey = (name) => String(name ?? '').replaceAll(/\s|-/g, '')

export const HomePage = () => {
  const { favorites } = useFavorites()
  const { t, language } = useLanguage()
  const { isLight } = useTheme()
  const [trending, setTrending] = useState([])
  const [upcoming, setUpcoming] = useState([])
  const [popular, setPopular] = useState([])
  const [popularPage, setPopularPage] = useState(1)
  const [hasMorePopular, setHasMorePopular] = useState(true)
  const [isLoadingPopular, setIsLoadingPopular] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSearching, setIsSearching] = useState(false)
  const [selectedGenre, setSelectedGenre] = useState('all')
  const [error, setError] = useState('')
  const debouncedSearch = useDebounce(searchValue)
  const loadMoreRef = useRef(null)
  const hasSearch = debouncedSearch.trim().length >= 2

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setIsLoading(true)
        setError('')
        const [trendingResponse, upcomingResponse] = await Promise.all([
          tmdbService.trending(),
          tmdbService.upcoming(),
        ])
        setTrending(trendingResponse.results ?? [])
        setUpcoming(upcomingResponse.results ?? [])
        const popularResponse = await tmdbService.popular(1)
        setPopular(popularResponse.results ?? [])
        setPopularPage(1)
        setHasMorePopular((popularResponse.page ?? 1) < (popularResponse.total_pages ?? 1))
      } catch (err) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    loadHomeData()
  }, [])

  useEffect(() => {
    const searchMovies = async () => {
      if (debouncedSearch.trim().length < 2) {
        setSearchResults([])
        return
      }

      try {
        setIsSearching(true)
        const response = await tmdbService.searchMovies(debouncedSearch.trim())
        setSearchResults(response.results ?? [])
      } catch (err) {
        setError(err.message)
      } finally {
        setIsSearching(false)
      }
    }

    searchMovies()
  }, [debouncedSearch])

  useEffect(() => {
    const loadMore = async () => {
      if (!hasMorePopular || isLoading || isLoadingPopular || hasSearch) return
      try {
        setIsLoadingPopular(true)
        const nextPage = popularPage + 1
        const response = await tmdbService.popular(nextPage)
        const nextMovies = response.results ?? []
        setPopular((current) => [...current, ...nextMovies.filter((movie) => !current.some((item) => item.id === movie.id))])
        setPopularPage(nextPage)
        setHasMorePopular((response.page ?? nextPage) < (response.total_pages ?? nextPage))
      } catch (err) {
        setError(err.message)
      } finally {
        setIsLoadingPopular(false)
      }
    }

    if (!loadMoreRef.current) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadMore()
        }
      },
      { rootMargin: '250px' },
    )

    observer.observe(loadMoreRef.current)
    return () => observer.disconnect()
  }, [hasMorePopular, hasSearch, isLoading, isLoadingPopular, popularPage])

  const knownMovies = useMemo(() => {
    const map = new Map()
    ;[...trending, ...upcoming, ...popular, ...searchResults].forEach((movie) => {
      map.set(movie.id, movie)
    })
    return map
  }, [popular, searchResults, trending, upcoming])

  const favoriteMovies = useMemo(
    () => favorites.map((id) => knownMovies.get(id)).filter(Boolean),
    [favorites, knownMovies],
  )
  const genreCandidates = useMemo(
    () => [...trending, ...upcoming, ...popular],
    [popular, trending, upcoming],
  )
  const topGenres = useMemo(() => {
    const counts = new Map()
    genreCandidates.forEach((movie) => {
      ;(movie.genres ?? []).forEach((genre) => {
        if (!genre?.name) return
        counts.set(genre.name, (counts.get(genre.name) ?? 0) + 1)
      })
    })

    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([genre]) => genre)
  }, [genreCandidates])
  const genreMovies = useMemo(() => {
    if (selectedGenre === 'all') return popular
    return genreCandidates.filter((movie) =>
      (movie.genres ?? []).some((genre) => genre.name === selectedGenre),
    )
  }, [genreCandidates, popular, selectedGenre])
  const genreLabel = (genreName) => {
    if (language === 'en') return genreName
    const byLanguage = GENRE_TRANSLATIONS[language] ?? {}
    return byLanguage[normalizeGenreKey(genreName)] ?? genreName
  }
  const selectedGenreLabel =
    selectedGenre === 'all' ? t('allGenres') : genreLabel(selectedGenre)

  const wrapperClass = isLight ? 'text-slate-900' : 'text-slate-100'
  const panelClass = isLight
    ? 'border-slate-300 bg-white/85 shadow-indigo-100/50'
    : 'border-slate-700/80 bg-slate-900/60'
  const inputClass = isLight
    ? 'border-slate-300 bg-white text-slate-900 placeholder:text-slate-500'
    : 'border-slate-600 bg-slate-950/70 text-slate-100 placeholder:text-slate-500'

  return (
    <main className={`mx-auto max-w-7xl px-4 pb-12 pt-7 md:px-8 ${wrapperClass}`}>
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className={`mb-8 rounded-3xl border p-6 backdrop-blur md:p-8 ${panelClass}`}
      >
        <div className="mb-6 flex items-center gap-2 text-cyan-300">
          <Film size={18} />
          <span className="text-xs font-semibold uppercase tracking-[0.2em]">{t('appName')}</span>
        </div>
        <h1 className={`mb-3 text-3xl font-black leading-tight md:text-5xl ${isLight ? 'text-slate-900' : 'text-slate-50'}`}>
          {t('discoverTitle')}
        </h1>
        <p className={`max-w-3xl text-sm md:text-base ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
          {t('discoverDescription')}
        </p>

        <label className={`mt-6 flex items-center gap-2 rounded-2xl border px-4 py-3 shadow-inner ${inputClass}`}>
          <Search size={18} className="text-cyan-300" />
          <input
            type="text"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder={t('searchPlaceholder')}
            className="w-full border-none bg-transparent outline-none"
          />
        </label>

        <div className={`mt-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm ${isLight ? 'bg-rose-100 text-rose-700' : 'bg-rose-500/15 text-rose-200'}`}>
          <Heart size={16} />
          {t('favoritesCount', { count: favorites.length })}
        </div>
      </motion.section>

      {error ? (
        <p className="mb-6 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-red-200">{error}</p>
      ) : null}

      {isLoading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <MovieSkeleton key={index} />
          ))}
        </div>
      ) : null}
      {!isLoading ? null : <p className="sr-only">{t('loadingMovies')}</p>}

      {hasSearch ? (
        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <SectionHeader
            title={t('searchResults')}
            description={isSearching ? t('searching') : t('foundResults', { count: searchResults.length })}
          />
          <MoviesCarousel movies={searchResults} />
        </motion.section>
      ) : null}

      {!hasSearch && !isLoading ? (
        <>
          <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
            <SectionHeader
              title={t('genresMenuTitle')}
              description={t('genresMenuDescription')}
            />
            <div className="mb-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedGenre('all')}
                className={`rounded-full border px-3 py-1 text-sm font-semibold transition ${
                  selectedGenre === 'all'
                    ? 'border-cyan-400 bg-cyan-500/20 text-cyan-200'
                    : isLight
                      ? 'border-slate-300 bg-white text-slate-700 hover:border-cyan-400'
                      : 'border-slate-700 bg-slate-900/70 text-slate-200 hover:border-cyan-400'
                }`}
              >
                {t('allGenres')}
              </button>
              {topGenres.map((genreName) => (
                <button
                  key={genreName}
                  type="button"
                  onClick={() => setSelectedGenre(genreName)}
                  className={`rounded-full border px-3 py-1 text-sm font-semibold transition ${
                    selectedGenre === genreName
                      ? 'border-cyan-400 bg-cyan-500/20 text-cyan-200'
                      : isLight
                        ? 'border-slate-300 bg-white text-slate-700 hover:border-cyan-400'
                        : 'border-slate-700 bg-slate-900/70 text-slate-200 hover:border-cyan-400'
                  }`}
                >
                  {genreLabel(genreName)}
                </button>
              ))}
            </div>
            <SectionHeader
              title={
                selectedGenre === 'all'
                  ? t('genreSectionTitleAll')
                  : t('genreSectionTitle', { genre: selectedGenreLabel })
              }
              description={t('genreMoviesCount', { count: genreMovies.length })}
            />
            <InfiniteGrid movies={genreMovies} />
          </motion.section>

          {favoriteMovies.length > 0 ? (
            <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
              <SectionHeader
                title={t('myFavorites')}
                description={t('myFavoritesDesc')}
              />
              <MoviesCarousel movies={favoriteMovies} />
            </motion.section>
          ) : null}

          <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
            <SectionHeader
              title={t('trendingWeek')}
              description={t('trendingWeekDesc')}
            />
            <MoviesCarousel movies={trending} />
          </motion.section>

          <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
            <SectionHeader
              title={t('upcoming')}
              description={t('upcomingDesc')}
            />
            <MoviesCarousel movies={upcoming} />
          </motion.section>

          <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <SectionHeader
              title={t('infiniteCatalog')}
              description={t('infiniteCatalogDesc')}
            />
            <div className={`mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm ${isLight ? 'bg-indigo-100 text-indigo-700' : 'bg-indigo-500/20 text-indigo-200'}`}>
              <Sparkles size={15} />
              {t('infiniteEnabled')}
            </div>
            <InfiniteGrid movies={popular} />
            {isLoadingPopular ? (
              <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <MovieSkeleton key={index} />
                ))}
              </div>
            ) : null}
            <div ref={loadMoreRef} className="h-10" />
          </motion.section>
        </>
      ) : null}
    </main>
  )
}
