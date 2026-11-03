/** Показывается вместо Spotify/YouTube-плеера на зрительском экране — играет, но не палит название/исполнителя. */
export function SecretMediaPlaceholder() {
  return (
    <div className="glass rounded-2xl px-10 py-8 flex flex-col items-center gap-3 mx-auto">
      <div className="text-5xl animate-pulse">🎵</div>
      <div className="text-lg opacity-70">Трек играет у ведущего…</div>
    </div>
  )
}
