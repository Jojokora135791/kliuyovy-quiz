import type { Team } from '../../types/quiz'

type Props = {
  teams: Team[]
  onAdjust?: (teamId: string, delta: number) => void
  interactive?: boolean
}

export function Scoreboard({ teams, onAdjust, interactive = false }: Props) {
  if (teams.length === 0) return null
  return (
    <div className="flex flex-wrap items-center justify-center gap-4 py-3 px-4 bg-black/30 backdrop-blur-sm">
      {teams.map((team) => (
        <div
          key={team.id}
          className="flex items-center gap-3 rounded-full border border-quiz-accent/50 bg-quiz-primary/10 px-4 py-2"
        >
          {interactive && (
            <button
              className="text-lg font-bold w-7 h-7 rounded-full bg-red-500/70 hover:bg-red-500 text-white"
              onClick={() => onAdjust?.(team.id, -1)}
            >
              −
            </button>
          )}
          <span className="font-semibold text-base md:text-lg">{team.name}</span>
          <span className="font-black text-xl md:text-2xl text-quiz-primary">{team.score}</span>
          {interactive && (
            <button
              className="text-lg font-bold w-7 h-7 rounded-full bg-green-500/70 hover:bg-green-500 text-white"
              onClick={() => onAdjust?.(team.id, 1)}
            >
              +
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
