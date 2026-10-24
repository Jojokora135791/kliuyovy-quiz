const audioCache = new Map<string, HTMLAudioElement>()

export function playSound(url?: string) {
  if (!url) return
  let audio = audioCache.get(url)
  if (!audio) {
    audio = new Audio(url)
    audioCache.set(url, audio)
  }
  audio.currentTime = 0
  void audio.play().catch(() => {
    // автоплей заблокирован браузером до первого клика пользователя — ок, просто тихо
  })
}
