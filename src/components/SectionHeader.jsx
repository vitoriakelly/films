import { useTheme } from '../hooks/useTheme'

export const SectionHeader = ({ title, description }) => {
  const { isLight } = useTheme()

  return (
    <div className="mb-5 flex items-end justify-between gap-3">
      <div>
        <h2 className={`text-2xl font-bold md:text-3xl ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
          {title}
        </h2>
        <p className={`text-sm md:text-base ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>{description}</p>
      </div>
    </div>
  )
}
