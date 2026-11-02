import type { Room } from '../../types/quiz'

export function IntroScreen({ title, room }: { title: string; room: Room | null }) {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full gap-6 px-16 text-center">
      <div className="eyebrow">🎃 Добро пожаловать 🍂</div>
      <h1 className="stage-title text-6xl md:text-8xl leading-tight">{title}</h1>
      {room && (
        <div className="glass rounded-3xl px-10 py-5 mt-4">
          <div className="text-sm uppercase tracking-[0.3em] opacity-70">Комната</div>
          <div className="font-spooky text-5xl md:text-6xl text-quiz-accent">{room.title}</div>
          {room.subtitle && <div className="mt-1 text-lg opacity-80">{room.subtitle}</div>}
        </div>
      )}
    </div>
  )
}
