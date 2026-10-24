import type { CSSProperties } from 'react'
import type { Theme } from '../types/quiz'

export function applyQuizTheme(theme: Theme) {
  const root = document.documentElement.style
  root.setProperty('--quiz-bg-color', '#140019')
  root.setProperty('--quiz-primary-color', theme.primaryColor ?? '#ff7a1a')
  root.setProperty('--quiz-accent-color', theme.accentColor ?? '#8e2de2')
  root.setProperty('--quiz-font-family', theme.fontFamily ?? "'Press Start 2P', system-ui, sans-serif")
}

function isImageUrl(value: string) {
  return /^(https?:)?\/\//.test(value) || value.startsWith('/media/')
}

/** Фон уровня квиз → раунд → вопрос, нижний уровень переопределяет верхний. */
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
