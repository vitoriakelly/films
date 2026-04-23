import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useRef } from 'react'

const SCROLL_STEP = 900

export const MovieCarousel = ({ children }) => {
  const containerRef = useRef(null)

  const slide = (direction) => {
    if (!containerRef.current) return
    containerRef.current.scrollBy({
      left: direction === 'left' ? -SCROLL_STEP : SCROLL_STEP,
      behavior: 'smooth',
    })
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => slide('left')}
        className="absolute -left-2 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-slate-700 bg-slate-900/90 p-2 text-slate-100 shadow-lg transition hover:border-cyan-400 lg:block"
        aria-label="Rolar para a esquerda"
      >
        <ChevronLeft size={18} />
      </button>

      <div
        ref={containerRef}
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>

      <button
        type="button"
        onClick={() => slide('right')}
        className="absolute -right-2 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-slate-700 bg-slate-900/90 p-2 text-slate-100 shadow-lg transition hover:border-cyan-400 lg:block"
        aria-label="Rolar para a direita"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  )
}
