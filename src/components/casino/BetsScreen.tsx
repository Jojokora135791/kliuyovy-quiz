import type { Round } from '../../types/quiz'
import type { GameState } from '../../stores/gameStore'
import type { QuestionLocation } from '../../lib/gameLogic'

/** Финал: ставки перед вопросом. Тема известна, сам вопрос — ещё нет. Суммы на табло не видны. */
export function BetsScreen({ round, location, game }: { round: Round; location: QuestionLocation; game: GameState }) {
  const position = round.categories.findIndex((c) => c.title === location.categoryTitle) + 1
  return (
    <div className="flex flex-col items-center justify-center w-full h-full gap-8 px-12 text-center">
      <div className="eyebrow">
        🎰 Вопрос {position} из {round.categories.length}
      </div>
      <h2 className="stage-title text-5xl md:text-7xl leading-tight">{location.categoryTitle}</h2>
      <p className="text-2xl md:text-3xl font-bold">Делайте ваши ставки</p>
      <p className="text-xl md:text-2xl opacity-80 max-w-3xl">
        Ставьте сколько угодно баллов — до того, как увидите вопрос. Верно — ставка прибавится к счёту, неверно —
        вычтется.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        {game.teams.map((t) => {
          const placed = t.id in game.bets
          return (
            <div
              key={t.id}
              className={`glass rounded-2xl px-5 py-3 text-xl font-bold ${placed ? 'border-quiz-primary/60' : 'opacity-60'}`}
            >
              {t.name} {placed ? <span className="text-trick">✓ ставка принята</span> : <span>…</span>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
