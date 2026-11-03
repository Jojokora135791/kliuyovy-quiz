import type { Team } from '../../types/quiz'

const MEDALS = ['🥇', '🥈', '🥉']

export function EndScreen({ teams }: { teams: Team[] }) {
  const sorted = [...teams].sort((a, b) => b.score - a.score)
  return (
    <div className="flex flex-col items-center justify-center w-full h-full gap-8 px-16 text-center">
      <div className="eyebrow">🎃 Итоги 🍂</div>
      <h2 className="stage-title text-6xl md:text-8xl">Игра окончена</h2>
      <div className="flex flex-col gap-3 w-full max-w-2xl">
        {sorted.map((team, i) => (
          <div
            key={team.id}
            className={`glass rounded-2xl px-6 py-4 flex items-center gap-4 text-2xl md:text-3xl font-bold ${
              i === 0 ? 'border-quiz-primary text-quiz-primary text-3xl md:text-5xl shadow-[0_0_40px_-8px_var(--quiz-primary-color)]' : ''
            }`}
          >
            <span className="w-12">{MEDALS[i] ?? `${i + 1}.`}</span>
            <span className="flex-1 text-left">{team.name}</span>
            <span className="font-black">{team.score}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
