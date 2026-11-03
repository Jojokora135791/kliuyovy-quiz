import type { Round } from '../types/quiz'
import type { GameState } from '../stores/gameStore'
import { formatDelta } from '../lib/gameLogic'

const RESULT_LABEL = { correct: '✓ верно', wrong: '✗ мимо', empty: '— пусто' } as const

/** Полоса под вопросом/ответом: кто отвечает (Р1), выбор сладость/гадость (Р2), ставки (Р3) и начисленные баллы. */
export function TeamStrip({ round, game }: { round: Round; game: GameState }) {
  const isAnswer = game.currentScreen === 'answer'

  if (round.type === 'music') {
    const active = game.activeTeamIndex !== null ? game.teams[game.activeTeamIndex] : null
    return (
      <div className="flex justify-center pb-4">
        <div className="glass rounded-2xl px-6 py-3 text-xl md:text-2xl font-bold">
          {active ? (
            <>
              Отвечает: <span className="text-quiz-primary">{active.name}</span>
            </>
          ) : (
            <span className="opacity-70">Никто не угадал</span>
          )}
          {Object.entries(game.lastDeltas).map(([id, d]) => (
            <span key={id} className="ml-4 text-trick">
              {game.teams.find((t) => t.id === id)?.name} {formatDelta(d)}
            </span>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap justify-center gap-3 px-6 pb-4">
      {game.teams.map((team) => {
        const choice = game.choices[team.id] ?? 'sweet'
        const result = game.results[team.id]
        const delta = game.lastDeltas[team.id]
        return (
          <div key={team.id} className="glass rounded-2xl px-4 py-2 flex items-center gap-3 text-lg">
            <span className="font-bold">{team.name}</span>
            {round.type === 'trickOrTreat' && (
              <span className={`font-bold ${choice === 'trick' ? 'text-trick' : 'text-sweet'}`}>
                {choice === 'trick' ? '💀 Гадость' : '🍬 Сладость'}
              </span>
            )}
            {round.type === 'casino' && isAnswer && game.scored && (
              <span className="font-bold text-quiz-accent">ставка {game.bets[team.id] ?? 0}</span>
            )}
            {isAnswer && game.scored && result && <span className="opacity-80">{RESULT_LABEL[result]}</span>}
            {isAnswer && game.scored && delta !== undefined && (
              <span
                className={`font-black text-2xl ${delta > 0 ? 'text-trick' : delta < 0 ? 'text-red-400' : 'opacity-60'}`}
              >
                {formatDelta(delta)}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}
