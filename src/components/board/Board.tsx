import type { Round } from '../../types/quiz'
import { questionNominal } from '../../lib/gameLogic'

type BoardProps = {
  round: Round
  playedQuestionIds: string[]
  onSelect?: (questionId: string) => void
  interactive?: boolean
}

/** Клетка доски. Размер одинаковый всегда — сыгранная просто гаснет, а не сжимается. */
function Cell({
  label,
  played,
  interactive,
  onClick,
  className = '',
}: {
  label: string | number
  played: boolean
  interactive: boolean
  onClick?: () => void
  className?: string
}) {
  return (
    <button
      disabled={played || !interactive}
      onClick={onClick}
      className={`w-full h-full min-h-0 rounded-2xl font-black flex items-center justify-center border-2 transition-colors ${
        played
          ? 'border-white/5 bg-black/35 text-transparent cursor-default'
          : `glass border-quiz-primary/50 text-quiz-primary ${
              interactive ? 'hover:bg-quiz-primary/25 hover:border-quiz-primary cursor-pointer' : ''
            }`
      } ${className}`}
    >
      {label}
    </button>
  )
}

export function Board({ round, playedQuestionIds, onSelect, interactive = false }: BoardProps) {
  // Раунд 1: одна категория — сплошная сетка пронумерованных треков
  if (round.type === 'music') {
    const category = round.categories[0]
    const questions = round.categories.flatMap((c) => c.questions)
    return (
      <div className="flex flex-col w-full h-full items-center justify-center gap-6 p-10">
        <h2 className="stage-title text-4xl md:text-5xl text-center">{category?.title ?? round.title}</h2>
        <div className="grid grid-cols-5 auto-rows-[minmax(0,7rem)] gap-4 w-full max-w-5xl">
          {questions.map((q, i) => {
            const played = playedQuestionIds.includes(q.id)
            return (
              <Cell
                key={q.id}
                label={i + 1}
                played={played}
                interactive={interactive}
                onClick={() => onSelect?.(q.id)}
                className="text-4xl"
              />
            )
          })}
        </div>
      </div>
    )
  }

  // Раунды 2.x: темы — строками, вопросы по порядку — по горизонтали (как в «Своей игре»).
  // Колонка = порядковый номер вопроса в теме, на клетке — его номинал.
  const columns = Math.max(0, ...round.categories.map((c) => c.questions.length))

  return (
    <div className="flex w-full h-full items-center justify-center p-6 md:p-10">
      <div
        className="grid gap-3 w-full max-w-7xl h-full max-h-[44rem]"
        style={{
          gridTemplateColumns: `minmax(0, 2.4fr) repeat(${columns}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${round.categories.length}, minmax(0, 1fr))`,
        }}
      >
        {round.categories.map((category) => (
          <div key={category.id} className="contents">
            <div className="glass rounded-2xl border-quiz-accent/40 px-4 flex items-center min-h-0 overflow-hidden">
              <span className="font-bold uppercase tracking-wide leading-tight text-[clamp(0.8rem,1.5vw,1.35rem)] line-clamp-2">
                {category.title}
              </span>
            </div>
            {Array.from({ length: columns }, (_, i) => {
              const question = category.questions[i]
              const played = question ? playedQuestionIds.includes(question.id) : true
              return (
                <Cell
                  key={i}
                  label={question ? questionNominal(question, i) : ''}
                  played={played}
                  interactive={interactive}
                  onClick={() => question && onSelect?.(question.id)}
                  className="text-[clamp(1.5rem,3vw,3rem)]"
                />
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
