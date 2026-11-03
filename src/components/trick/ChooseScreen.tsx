import type { Round } from '../../types/quiz'
import type { GameState } from '../../stores/gameStore'
import { nominalLabel, questionNominal, type QuestionLocation } from '../../lib/gameLogic'
import { TrickScoringTable } from '../rules/RulesScreen'

/** Перед каждым вопросом раунда 2.x: команды выбирают «Сладость» или «Гадость». */
export function ChooseScreen({ round, location, game }: { round: Round; location: QuestionLocation; game: GameState }) {
  const nominal = questionNominal(location.question, location.index)
  return (
    <div className="flex flex-col items-center justify-center w-full h-full gap-8 px-12 text-center">
      <div className="eyebrow">
        {location.categoryTitle} · номинал {nominalLabel(nominal)}
      </div>
      <h2 className="stage-title text-6xl md:text-8xl">Сладость или гадость?</h2>
      <TrickScoringTable round={round} nominal={nominal} compact />
      <div className="flex flex-wrap justify-center gap-3">
        {game.teams.map((t) => {
          const choice = game.choices[t.id]
          return (
            <div
              key={t.id}
              className={`glass rounded-2xl px-5 py-3 text-xl font-bold ${choice ? 'border-quiz-primary/60' : 'opacity-60'}`}
            >
              {t.name}{' '}
              {choice === 'sweet' ? (
                <span className="text-sweet">🍬</span>
              ) : choice === 'trick' ? (
                <span className="text-trick">💀</span>
              ) : (
                <span className="opacity-60">…думает</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
