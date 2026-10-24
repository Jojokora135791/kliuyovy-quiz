import type { Media, MediaType } from '../../types/quiz'

type Props = {
  label: string
  media?: Media
  onChange: (media: Media | undefined) => void
}

const MEDIA_TYPES: { value: MediaType; label: string }[] = [
  { value: 'image', label: 'Картинка' },
  { value: 'audio', label: 'Аудио' },
  { value: 'video', label: 'Видео' },
  { value: 'youtube', label: 'YouTube' },
]

export function MediaField({ label, media, onChange }: Props) {
  if (!media) {
    return (
      <button type="button" className="btn-secondary text-sm self-start" onClick={() => onChange({ type: 'image', url: '' })}>
        + {label}
      </button>
    )
  }

  return (
    <div className="flex flex-col gap-2 border border-white/10 rounded-lg p-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold opacity-70">{label}</span>
        <button type="button" className="text-xs text-red-400 hover:text-red-300" onClick={() => onChange(undefined)}>
          Убрать
        </button>
      </div>
      <div className="flex gap-2">
        <select
          className="bg-white/10 rounded px-2 py-1 text-sm"
          value={media.type}
          onChange={(e) => onChange({ ...media, type: e.target.value as MediaType })}
        >
          {MEDIA_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <input
          className="flex-1 bg-white/10 rounded px-2 py-1 text-sm"
          placeholder={
            media.type === 'youtube' ? 'https://youtu.be/...' : 'URL или /media/файл (положи файл в /public/media)'
          }
          value={media.url}
          onChange={(e) => onChange({ ...media, url: e.target.value })}
        />
      </div>
      {media.type === 'youtube' && (
        <div className="flex gap-3 text-sm">
          <label className="flex items-center gap-1">
            start(с)
            <input
              type="number"
              className="w-20 bg-white/10 rounded px-2 py-1"
              value={media.youtubeStart ?? ''}
              onChange={(e) => onChange({ ...media, youtubeStart: e.target.value ? Number(e.target.value) : undefined })}
            />
          </label>
          <label className="flex items-center gap-1">
            end(с)
            <input
              type="number"
              className="w-20 bg-white/10 rounded px-2 py-1"
              value={media.youtubeEnd ?? ''}
              onChange={(e) => onChange({ ...media, youtubeEnd: e.target.value ? Number(e.target.value) : undefined })}
            />
          </label>
        </div>
      )}
    </div>
  )
}
