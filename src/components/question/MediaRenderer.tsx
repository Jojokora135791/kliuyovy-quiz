import YouTube from 'react-youtube'
import type { Media } from '../../types/quiz'

function extractYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([a-zA-Z0-9_-]{6,})/)
  return match ? match[1] : null
}

export function MediaRenderer({ media }: { media: Media }) {
  switch (media.type) {
    case 'image':
      return <img src={media.url} alt="" className="max-h-[48vh] max-w-full rounded-xl object-contain mx-auto" />
    case 'audio':
      return <audio src={media.url} controls autoPlay className="w-full max-w-xl mx-auto" />
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
    default:
      return null
  }
}
