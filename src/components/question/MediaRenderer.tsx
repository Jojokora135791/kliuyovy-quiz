import YouTube from 'react-youtube'
import type { Media } from '../../types/quiz'

function extractYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([a-zA-Z0-9_-]{6,})/)
  return match ? match[1] : null
}

/** Превращает обычную ссылку на трек (Spotify/Яндекс.Музыка) в адрес их официального embed-плеера. */
function toEmbedUrl(url: string): string {
  const spotify = url.match(/open\.spotify\.com\/(?:embed\/)?track\/([a-zA-Z0-9]+)/)
  if (spotify) return `https://open.spotify.com/embed/track/${spotify[1]}?utm_source=generator`

  const yandex = url.match(/music\.yandex\.ru\/album\/(\d+)\/track\/(\d+)/)
  if (yandex) return `https://music.yandex.ru/iframe/#track/${yandex[2]}/${yandex[1]}`

  return url
}

export function MediaRenderer({ media }: { media: Media }) {
  if (!media.url) return null
  switch (media.type) {
    case 'image':
      return (
        <img
          key={media.url}
          src={media.url}
          alt=""
          className="max-h-[52vh] max-w-full rounded-xl object-contain mx-auto shadow-2xl"
          // файл ещё не подложили — не показываем битую иконку на табло
          onError={(e) => (e.currentTarget.style.display = 'none')}
        />
      )
    case 'audio':
      return <audio src={media.url} controls autoPlay className="w-full max-w-xl mx-auto rounded-full" />
    case 'video':
      return <video src={media.url} controls autoPlay className="max-h-[52vh] max-w-full rounded-xl mx-auto" />
    case 'youtube': {
      const videoId = extractYouTubeId(media.url)
      if (!videoId) return <p className="text-red-400">Некорректная YouTube-ссылка</p>
      return (
        <div className="mx-auto w-full max-w-3xl">
          <YouTube
            videoId={videoId}
            opts={{
              width: '100%',
              height: '390',
              playerVars: {
                autoplay: 1,
                start: media.youtubeStart,
                end: media.youtubeEnd,
              },
            }}
          />
        </div>
      )
    }
    case 'embed': {
      const isYandex = media.url.includes('yandex')
      const src = toEmbedUrl(media.url)
      return (
        <div className="mx-auto w-full max-w-xl">
          <iframe
            key={src}
            src={src}
            width="100%"
            height={isYandex ? 200 : 152}
            style={{ border: 0 }}
            allow="autoplay; encrypted-media; clipboard-write; fullscreen; picture-in-picture"
            loading="lazy"
            className="rounded-xl"
          />
        </div>
      )
    }
    default:
      return null
  }
}
