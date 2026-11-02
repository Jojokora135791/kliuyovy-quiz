import type { Team } from '../../types/quiz'

type Props = {
  teams: Team[]
  onAdjust?: (teamId: string, delta: number) => void
  interactive?: boolean
  activeTeamId?: string | null
}

export function Scoreboard({ teams, onAdjust, interactive = false, activeTeamId }: Props) {
  if (teams.length === 0) return null
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 py-3 px-4">
      {teams.map((team) => {
        const active = team.id === activeTeamId
        return (
          <div
            key={team.id}
            className={`glass flex items-center gap-3 rounded-full px-4 py-2 transition ${
              active ? 'border-quiz-primary shadow-[0_0_24px_-6px_var(--quiz-primary-color)] scale-105' : ''
            }`}
          >
            {interactive && (
              <button
                className="text-lg font-bold w-7 h-7 rounded-full bg-red-500/60 hover:bg-red-500 text-white"
                onClick={() => onAdjust?.(team.id, -1)}
              >
                −
              </button>
            )}
            <span className="font-semibold text-base md:text-lg">{team.name}</span>
            <span className="font-black text-xl md:text-2xl text-quiz-primary tabular-nums">{team.score}</span>
            {interactive && (
              <button
                className="text-lg font-bold w-7 h-7 rounded-full bg-green-500/60 hover:bg-green-500 text-white"
                onClick={() => onAdjust?.(team.id, 1)}
              >
                +
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}
