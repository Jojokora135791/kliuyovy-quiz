import type { Round } from '../../types/quiz'
import { getOrderedQuestions } from '../../lib/gameLogic'

type BoardProps = {
  round: Round
  playedQuestionIds: string[]
  onSelect?: (questionId: string) => void
  interactive?: boolean
}

export function Board({ round, playedQuestionIds, onSelect, interactive = false }: BoardProps) {
  if (round.type === 'warmup') {
    const questions = getOrderedQuestions(round)
    return (
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-4 p-10 w-full max-w-6xl mx-auto">
        {questions.map((q) => {
          const played = playedQuestionIds.includes(q.id)
          return (
            <button
              key={q.id}
              disabled={played || !interactive}
              onClick={() => onSelect?.(q.id)}
              className={`aspect-square rounded-xl text-3xl font-bold flex items-center justify-center border-2 border-quiz-accent transition-all ${
                played
                  ? 'opacity-20 cursor-default'
                  : `bg-quiz-primary/20 ${interactive ? 'hover:bg-quiz-primary/40 cursor-pointer' : ''}`
              }`}
            >
              {q.price}
            </button>
          )
        })}
      </div>
    )
  }

  const priceScale = round.priceScale ?? []
  return (
    <div
      className="grid gap-3 p-8 w-full max-w-7xl mx-auto"
      style={{ gridTemplateColumns: `repeat(${round.categories.length}, minmax(0, 1fr))` }}
    >
      {round.categories.map((category) => (
        <div key={category.id} className="flex flex-col gap-3">
          <div className="text-center font-bold text-base md:text-xl uppercase tracking-wide py-3 px-2 bg-quiz-accent/30 rounded-lg min-h-[4.5rem] flex items-center justify-center">
            {category.title}
          </div>
          {priceScale.map((price) => {
            const question = category.questions.find((q) => q.price === price)
            const played = question ? playedQuestionIds.includes(question.id) : true
            return (
              <button
                key={price}
                disabled={!question || played || !interactive}
                onClick={() => question && onSelect?.(question.id)}
                className={`rounded-lg py-4 text-2xl md:text-3xl font-bold border-2 border-quiz-accent/60 transition-all ${
                  played
                    ? 'opacity-20 cursor-default'
                    : `bg-quiz-primary/20 ${interactive ? 'hover:bg-quiz-primary/40 cursor-pointer' : ''}`
                }`}
              >
                {question ? price : ''}
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
}
