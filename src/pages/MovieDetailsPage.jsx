import { ArrowLeft, CalendarDays, Clock3, ExternalLink, Heart, Star } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useFavorites } from '../hooks/useFavorites'
import { useLanguage } from '../hooks/useLanguage'
import { useTheme } from '../hooks/useTheme'
import { backdropUrl, imageUrl, tmdbService } from '../services/tmdb'

const localeByLanguage = { pt: 'pt-BR', en: 'en-US', es: 'es-ES' }
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

const movieFacts = (movie, locale, t) => {
  const releaseDate = movie.release_date
    ? new Date(movie.release_date).toLocaleDateString(locale)
    : t('noDate')
  const runtime = movie.runtime ? `${movie.runtime} min` : '---'
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'

  return { releaseDate, runtime, rating }
}

export const MovieDetailsPage = () => {
  const { isFavorite, toggleFavorite } = useFavorites()
  const { language, t } = useLanguage()
  const { isLight } = useTheme()
  const { id } = useParams()
  const [movie, setMovie] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadMovie = async () => {
      try {
        setLoading(true)
        setError('')
        const response = await tmdbService.movieDetails(id, language)
        setMovie(response)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadMovie()
  }, [id, language])

  if (loading) {
    return <p className="mx-auto max-w-6xl px-4 py-10 text-slate-200">{t('loadingDetails')}</p>
  }

  if (error) {
    return (
      <p className="mx-auto mt-8 max-w-6xl rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-red-100">
        {error}
      </p>
    )
  }

  if (!movie) return null

  const facts = movieFacts(movie, localeByLanguage[language] ?? 'pt-BR', t)
  const cast = movie.credits?.cast?.slice(0, 10) ?? []
  const favorite = isFavorite(movie.id)
  const genreLabel = (genreName) => {
    if (language === 'en') return genreName
    const byLanguage = GENRE_TRANSLATIONS[language] ?? {}
    return byLanguage[normalizeGenreKey(genreName)] ?? genreName
  }
  const textClass = isLight ? 'text-slate-900' : 'text-slate-100'
  const cardClass = isLight ? 'border-slate-300 bg-white/90' : 'border-slate-700/70 bg-slate-900/70'

  return (
    <main className={`mx-auto max-w-6xl px-4 pb-12 pt-6 md:px-8 ${textClass}`}>
      <Link
        to="/"
        className={`mb-5 inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition hover:border-cyan-400 ${
          isLight ? 'border-slate-300 bg-white text-slate-700' : 'border-slate-700 bg-slate-900/70 text-slate-200'
        }`}
      >
        <ArrowLeft size={16} />
        {t('back')}
      </Link>

      <section className={`overflow-hidden rounded-3xl border ${cardClass}`}>
        {movie.backdrop_path ? (
          <div className="relative h-52 md:h-72">
            <img
              src={backdropUrl(movie.backdrop_path)}
              alt={movie.title}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/65 to-transparent" />
          </div>
        ) : null}

        <div className="grid gap-6 p-5 md:grid-cols-[260px_1fr] md:p-7">
          <img
            src={imageUrl(movie.poster_path)}
            alt={t('posterOf', { title: movie.title })}
            className="w-full rounded-2xl border border-slate-700 object-cover md:h-[390px]"
          />

          <div>
            <h1 className={`text-3xl font-black md:text-4xl ${isLight ? 'text-slate-900' : 'text-slate-50'}`}>
              {movie.title}
            </h1>
            <p className={`mt-2 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>{movie.tagline}</p>

            <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-200">
              <span className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 ${isLight ? 'bg-slate-200 text-slate-800' : 'bg-slate-800'}`}>
                <CalendarDays size={16} />
                {facts.releaseDate}
              </span>
              <span className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 ${isLight ? 'bg-slate-200 text-slate-800' : 'bg-slate-800'}`}>
                <Clock3 size={16} />
                {facts.runtime}
              </span>
              <span className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-amber-300 ${isLight ? 'bg-amber-100' : 'bg-slate-800'}`}>
                <Star size={16} fill="currentColor" />
                {facts.rating}
              </span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {movie.genres?.map((genre) => (
                <span
                  key={genre.id}
                  className="rounded-full border border-cyan-400/50 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-200"
                >
                  {genreLabel(genre.name)}
                </span>
              ))}
            </div>

            <p className={`mt-5 leading-relaxed ${isLight ? 'text-slate-700' : 'text-slate-200'}`}>
              {movie.overview || t('noOverview')}
            </p>
            {language === 'en' ? null : (
              <p className={`mt-2 text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                {t('overviewAutoTranslated')}
              </p>
            )}

            <div className="mt-5 flex flex-wrap gap-3">
              {movie.url ? (
                <a
                  href={movie.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
                >
                  <ExternalLink size={18} />
                  {t('seeOnTvmaze')}
                </a>
              ) : null}
              <button
                type="button"
                onClick={() => toggleFavorite(movie.id)}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  favorite
                    ? 'bg-rose-500 text-white hover:bg-rose-400'
                    : isLight
                      ? 'bg-slate-200 text-slate-800 hover:bg-slate-300'
                      : 'bg-slate-800 text-slate-100 hover:bg-slate-700'
                }`}
              >
                <Heart size={17} fill={favorite ? 'currentColor' : 'none'} />
                {favorite ? t('removeFavorite') : t('saveFavorite')}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <h2 className={`mb-4 text-2xl font-bold ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
          {t('mainCast')}
        </h2>
        {cast.length === 0 ? (
          <p className={isLight ? 'text-slate-700' : 'text-slate-300'}>{t('castUnavailable')}</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {cast.map((actor, index) => (
              <article
                key={`${actor.id}-${index}`}
                className={`rounded-xl border p-4 ${isLight ? 'border-slate-300 bg-white' : 'border-slate-700 bg-slate-900/70'}`}
              >
                <p className={`font-semibold ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>{actor.name}</p>
                <p className={`text-sm ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  {t('asCharacter', { character: actor.character || t('characterUnavailable') })}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
