const IFRAME_API_URL = 'https://open.spotify.com/embed/iframe-api/v1'

export type SpotifyController = {
  resume: () => void
  pause: () => void
  destroy: () => void
  addListener: (event: 'ready', handler: () => void) => void
}

type SpotifyIFrameApi = {
  createController: (
    element: HTMLElement,
    options: { uri: string; width?: number | string; height?: number | string },
    callback: (controller: SpotifyController) => void,
  ) => void
}

declare global {
  interface Window {
    onSpotifyIframeApiReady?: (api: SpotifyIFrameApi) => void
  }
}

/** Ссылка на плейлист из Spotify (или spotify:playlist:…) → URI для плеера. */
export function parseSpotifyPlaylistUri(url?: string): string | null {
  const id = url?.trim().match(/^(?:https?:\/\/open\.spotify\.com\/(?:[a-z-]+\/)?playlist\/|spotify:playlist:)([a-zA-Z0-9]+)/)?.[1]
  return id ? `spotify:playlist:${id}` : null
}

let apiPromise: Promise<SpotifyIFrameApi> | null = null

/** Скрипт Spotify вызывает колбэк только один раз, поэтому результат кэшируем. */
export function loadSpotifyApi(): Promise<SpotifyIFrameApi> {
  apiPromise ??= new Promise((resolve, reject) => {
    window.onSpotifyIframeApiReady = resolve
    const script = document.createElement('script')
    script.src = IFRAME_API_URL
    script.async = true
    script.onerror = () => {
      apiPromise = null
      script.remove()
      reject(new Error('Не удалось загрузить плеер Spotify'))
    }
    document.body.appendChild(script)
  })
  return apiPromise
}
