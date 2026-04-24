const API_BASE_URL = 'https://api.tvmaze.com'
const TRANSLATE_BASE_URL = 'https://api.mymemory.translated.net/get'
const overviewTranslationCache = new Map()

const request = async (endpoint, params = {}) => {
  const searchParams = new URLSearchParams(params)
  const query = searchParams.toString()
  const response = await fetch(`${API_BASE_URL}${endpoint}${query ? `?${query}` : ''}`)

  if (!response.ok) {
    throw new Error('Erro ao buscar dados da API da TVMaze.')
  }

  return response.json()
}

const normalizeGenres = (genres = []) => genres.map((genre, index) => ({ id: `${genre}-${index}`, name: genre }))

const normalizeShow = (show) => ({
  id: show.id,
  title: show.name,
  release_date: show.premiered,
  vote_average: show.rating?.average ?? 0,
  poster_path: show.image?.medium ?? '',
  backdrop_path: show.image?.original ?? '',
  overview: show.summary?.replace(/<[^>]*>/g, '') ?? 'Sinopse indisponível.',
  runtime: show.runtime ?? 0,
  genres: normalizeGenres(show.genres),
  tagline: show.network?.name ?? show.webChannel?.name ?? '',
  url: show.officialSite || show.url || '',
})

const getNextDate = (daysFromToday = 1) => {
  const date = new Date()
  date.setDate(date.getDate() + daysFromToday)
  return date.toISOString().slice(0, 10)
}

const MAX_TRANSLATE_QUERY_LENGTH = 450

const splitTextForTranslation = (text, maxLength = MAX_TRANSLATE_QUERY_LENGTH) => {
  const source = String(text ?? '').trim()
  if (!source) return []
  if (source.length <= maxLength) return [source]

  const parts = []
  let current = ''
  const sentences = source.split(/(?<=[.!?])\s+/)

  sentences.forEach((sentence) => {
    if (sentence.length > maxLength) {
      if (current) {
        parts.push(current)
        current = ''
      }
      let start = 0
      while (start < sentence.length) {
        parts.push(sentence.slice(start, start + maxLength))
        start += maxLength
      }
      return
    }

    const candidate = current ? `${current} ${sentence}` : sentence
    if (candidate.length <= maxLength) {
      current = candidate
      return
    }

    if (current) parts.push(current)
    current = sentence
  })

  if (current) parts.push(current)
  return parts
}

const translateChunk = async (chunk, target) => {
  const params = new URLSearchParams({ q: chunk, langpair: `en|${target}` })
  const response = await fetch(`${TRANSLATE_BASE_URL}?${params.toString()}`)
  if (!response.ok) return chunk
  const translated = await response.json()
  const textResult = translated?.responseData?.translatedText?.trim()
  return textResult || chunk
}

const translateText = async (text, language) => {
  const sourceText = String(text ?? '').trim()
  if (!sourceText || language === 'en') return sourceText

  const targetByLanguage = { pt: 'pt', es: 'es' }
  const target = targetByLanguage[language]
  if (!target) return sourceText
  const cacheKey = `${language}::${sourceText}`
  if (overviewTranslationCache.has(cacheKey)) {
    return overviewTranslationCache.get(cacheKey)
  }

  const chunks = splitTextForTranslation(sourceText)
  if (chunks.length === 0) return sourceText

  const translatedChunks = await Promise.all(
    chunks.map((chunk) => translateChunk(chunk, target)),
  )
  const result = translatedChunks.join(' ').trim() || sourceText
  overviewTranslationCache.set(cacheKey, result)
  return result
}

export const tmdbService = {
  trending: async (page = 1) => {
    const response = await request('/shows', { page: Math.max(page - 1, 0) })
    const results = (response ?? [])
      .map(normalizeShow)
      .sort((a, b) => b.vote_average - a.vote_average)
      .slice(0, 20)
    return { results, page }
  },
  upcoming: async () => {
    const response = await request('/schedule', { country: 'US', date: getNextDate(1) })
    const uniqueShows = new Map()
    ;(response ?? []).forEach((entry) => {
      if (!uniqueShows.has(entry.show.id)) {
        uniqueShows.set(entry.show.id, normalizeShow(entry.show))
      }
    })
    return { results: Array.from(uniqueShows.values()).slice(0, 20), page: 1, total_pages: 1 }
  },
  popular: async (page = 1) => {
    const apiPage = Math.max(page - 1, 0)
    const response = await request('/shows', { page: apiPage })
    const results = (response ?? []).map(normalizeShow)
    return { results, page, total_pages: 250 }
  },
  searchMovies: async (query) => {
    const response = await request('/search/shows', { q: query })
    return { results: (response ?? []).map((item) => normalizeShow(item.show)) }
  },
  movieDetails: async (id, language = 'en') => {
    const [showResponse, castResponse] = await Promise.all([
      request(`/shows/${id}`),
      request(`/shows/${id}/cast`),
    ])

    const normalized = normalizeShow(showResponse)
    let translatedOverview = normalized.overview
    try {
      translatedOverview = await translateText(normalized.overview, language)
    } catch {
      translatedOverview = normalized.overview
    }
    const cast = (castResponse ?? []).map((item, index) => ({
      id: item.person?.id ?? index,
      name: item.person?.name ?? 'Nome indisponível',
      character: item.character?.name ?? 'Personagem não informado',
    }))

    return {
      ...normalized,
      overview: translatedOverview,
      credits: { cast },
      videos: { results: [] },
    }
  },
}

export const imageUrl = (path) =>
  path && path.startsWith('http')
    ? path
    : 'https://placehold.co/500x750/0f172a/f8fafc?text=Sem+Imagem'

export const backdropUrl = (path) => (path && path.startsWith('http') ? path : '')
