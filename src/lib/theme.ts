import type { CSSProperties } from 'react'
import type { Theme } from '../types/quiz'

export function applyQuizTheme(theme: Theme) {
  const root = document.documentElement.style
  root.setProperty('--quiz-primary-color', theme.primaryColor ?? '#ff8a3d')
  root.setProperty('--quiz-accent-color', theme.accentColor ?? '#a77bff')
  root.setProperty('--quiz-font-family', theme.fontFamily ?? "'Rubik', system-ui, sans-serif")
}

function isImageUrl(value: string) {
  return /^(https?:)?\/\//.test(value) || value.startsWith('/media/') || /\.(jpe?g|png|webp|gif|avif)$/i.test(value)
}

/** Фон уровня квиз → комната → раунд → вопрос, нижний уровень переопределяет верхний. */
export function resolveBackground(sources: Array<string | undefined>): string | undefined {
  for (let i = sources.length - 1; i >= 0; i--) {
    if (sources[i]) return sources[i]
  }
  return undefined
}

export function backgroundStyle(value?: string): CSSProperties {
  if (!value) return {}
  if (isImageUrl(value)) {
    return { backgroundImage: `url(${value})`, backgroundSize: 'cover', backgroundPosition: 'center' }
  }
  return { background: value }
}
