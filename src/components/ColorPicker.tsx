import { THEME_PRESETS, type ThemeColorName } from '../services/theme'

interface ColorPickerProps {
  value: ThemeColorName
  onChange: (name: ThemeColorName) => void
}

export default function ColorPicker({ value, onChange }: ColorPickerProps) {
  const names = Object.keys(THEME_PRESETS) as ThemeColorName[]

  return (
    <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
      {names.map((name) => {
        const preset = THEME_PRESETS[name]
        const isActive = name === value
        return (
          <button
            key={name}
            onClick={() => onChange(name)}
            className={`
              flex flex-col items-center gap-2 p-3 rounded-xl
              transition-all duration-200
              ${isActive ? 'ring-2 ring-offset-2 dark:ring-offset-gray-800 scale-105' : 'hover:scale-105'}
            `}
            style={{ '--ring-color': preset.shades[500] } as React.CSSProperties}
            title={preset.label}
          >
            <div
              className="w-8 h-8 rounded-full shadow-sm transition-transform duration-200"
              style={{ backgroundColor: preset.shades[500] }}
            />
            <span
              className={`text-xs font-medium transition-colors duration-200 ${
                isActive ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              {preset.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
