import { useEffect, useRef, useState } from 'react'
import { loadSpotifyApi, parseSpotifyPlaylistUri, type SpotifyController } from '../../lib/spotify'

type Props = {
  playlistUrl?: string
  /** Сейчас идёт выбор вопроса: музыка должна играть */
  active: boolean
}

/**
 * Плейлист Spotify в паузах выбора вопроса. Живёт на пульте, а не на табло: браузер
 * разрешает старт звука только после действия пользователя на странице, а ведущий
 * нажимает Space и кликает именно здесь.
 */
export function BackgroundMusic({ playlistUrl, active }: Props) {
  const uri = parseSpotifyPlaylistUri(playlistUrl)
  const containerRef = useRef<HTMLDivElement>(null)
  const controllerRef = useRef<SpotifyController | null>(null)
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)
  const [enabled, setEnabled] = useState(true)

  useEffect(() => {
    const container = containerRef.current
    if (!uri || !container) return
    let cancelled = false
    setFailed(false)
    loadSpotifyApi()
      .then((api) => {
        if (cancelled) return
        // Spotify заменяет элемент на iframe, поэтому он создаётся вне дерева React
        const element = document.createElement('div')
        container.appendChild(element)
        api.createController(element, { uri, width: '100%', height: 80 }, (controller) => {
          if (cancelled) {
            controller.destroy()
            return
          }
          controllerRef.current = controller
          controller.addListener('ready', () => {
            if (!cancelled) setReady(true)
          })
        })
      })
      .catch(() => {
        if (!cancelled) setFailed(true)
      })
    return () => {
      cancelled = true
      controllerRef.current?.destroy()
      controllerRef.current = null
      container.replaceChildren()
      setReady(false)
    }
  }, [uri])

  const shouldPlay = active && enabled
  useEffect(() => {
    if (!ready) return
    if (shouldPlay) controllerRef.current?.resume()
    else controllerRef.current?.pause()
  }, [ready, shouldPlay])

  if (!uri) return null

  return (
    <div className="glass rounded-2xl p-3 flex flex-col gap-2 shrink-0">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs uppercase tracking-widest opacity-60 font-bold">Музыка на выборе вопроса</span>
        <button
          className={`chip ${enabled ? 'border-quiz-primary text-quiz-primary' : 'chip-off'}`}
          onClick={(e) => {
            setEnabled((v) => !v)
            // иначе следующий Space повторно нажмёт эту кнопку вместо «Дальше»
            e.currentTarget.blur()
          }}
        >
          {enabled ? 'Вкл' : 'Выкл'}
        </button>
      </div>
      {failed && <div className="text-sm text-red-400">Не удалось загрузить плеер Spotify</div>}
      <div ref={containerRef} className="min-h-[80px]" />
    </div>
  )
}
