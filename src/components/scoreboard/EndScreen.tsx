import type { Team } from '../../types/quiz'

export function EndScreen({ teams }: { teams: Team[] }) {
  const sorted = [...teams].sort((a, b) => b.score - a.score)
  return (
    <div className="flex flex-col items-center justify-center h-full gap-8 px-16 text-center">
      <h2 className="font-heading text-5xl md:text-7xl font-black uppercase tracking-wide text-quiz-primary">
        Игра окончена
      </h2>
      <div className="flex flex-col gap-3 text-2xl md:text-3xl font-semibold">
        {sorted.map((team, i) => (
          <div key={team.id} className={i === 0 ? 'text-quiz-accent text-4xl md:text-5xl' : ''}>
            {i + 1}. {team.name} — {team.score}
          </div>
        ))}
      </div>
    </div>
  )
}
