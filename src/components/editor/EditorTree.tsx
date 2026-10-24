import type { ReactNode } from 'react'
import type { Quiz } from '../../types/quiz'
import type { Selection } from '../../types/editor'
import * as M from '../../lib/quizMutations'

type Props = {
  quiz: Quiz
  selection: Selection
  onSelect: (s: Selection) => void
  mutate: (fn: (quiz: Quiz) => Quiz) => void
}

export function EditorTree({ quiz, selection, onSelect, mutate }: Props) {
  return (
    <div className="flex flex-col gap-1 text-sm">
      <TreeButton active={selection.kind === 'quiz'} onClick={() => onSelect({ kind: 'quiz' })}>
        ⚙ Настройки квиза
      </TreeButton>

      {quiz.rounds.map((round, ri) => {
        const isFlat = round.type === 'warmup' || round.type === 'final'
        const category = round.categories[0]

        return (
          <div key={round.id} className="mt-2">
            <Row
              active={selection.kind === 'round' && selection.roundId === round.id}
              onClick={() => onSelect({ kind: 'round', roundId: round.id })}
              onUp={() => mutate((q) => M.moveRound(q, round.id, -1))}
              onDown={() => mutate((q) => M.moveRound(q, round.id, 1))}
              onRemove={() => {
                if (confirm(`Удалить раунд «${round.title}»?`)) mutate((q) => M.removeRound(q, round.id))
              }}
              disableUp={ri === 0}
              disableDown={ri === quiz.rounds.length - 1}
            >
              📂 {round.title}
            </Row>

            {isFlat && category && (
              <div className="ml-5 flex flex-col gap-0.5 mt-1">
                {category.questions.map((q, qi) => (
                  <Row
                    key={q.id}
                    small
                    active={selection.kind === 'question' && selection.questionId === q.id}
                    onClick={() =>
                      onSelect({ kind: 'question', roundId: round.id, categoryId: category.id, questionId: q.id })
                    }
                    onUp={() => mutate((quiz2) => M.moveQuestion(quiz2, round.id, category.id, q.id, -1))}
                    onDown={() => mutate((quiz2) => M.moveQuestion(quiz2, round.id, category.id, q.id, 1))}
                    onRemove={() => mutate((quiz2) => M.removeQuestion(quiz2, round.id, category.id, q.id))}
                    disableUp={qi === 0}
                    disableDown={qi === category.questions.length - 1}
                  >
                    {q.price}. {q.text.slice(0, 28) || '(пусто)'}
                  </Row>
                ))}
                <button
                  type="button"
                  className="text-xs opacity-60 hover:opacity-100 text-left py-1"
                  onClick={() =>
                    mutate((quiz2) => M.addQuestion(quiz2, round.id, category.id, category.questions.length + 1))
                  }
                >
                  + вопрос
                </button>
              </div>
            )}

            {!isFlat && (
              <div className="ml-5 flex flex-col gap-1 mt-1">
                {round.categories.map((cat, ci) => (
                  <div key={cat.id}>
                    <Row
                      small
                      active={selection.kind === 'category' && selection.categoryId === cat.id}
                      onClick={() => onSelect({ kind: 'category', roundId: round.id, categoryId: cat.id })}
                      onUp={() => mutate((q) => M.moveCategory(q, round.id, cat.id, -1))}
                      onDown={() => mutate((q) => M.moveCategory(q, round.id, cat.id, 1))}
                      onRemove={() => {
                        if (confirm(`Удалить категорию «${cat.title}»?`)) mutate((q) => M.removeCategory(q, round.id, cat.id))
                      }}
                      disableUp={ci === 0}
                      disableDown={ci === round.categories.length - 1}
                    >
                      🗂 {cat.title}
                    </Row>
                    <div className="ml-5 flex flex-col gap-0.5">
                      {cat.questions.map((q, qi) => (
                        <Row
                          key={q.id}
                          small
                          active={selection.kind === 'question' && selection.questionId === q.id}
                          onClick={() =>
                            onSelect({ kind: 'question', roundId: round.id, categoryId: cat.id, questionId: q.id })
                          }
                          onUp={() => mutate((quiz2) => M.moveQuestion(quiz2, round.id, cat.id, q.id, -1))}
                          onDown={() => mutate((quiz2) => M.moveQuestion(quiz2, round.id, cat.id, q.id, 1))}
                          onRemove={() => mutate((quiz2) => M.removeQuestion(quiz2, round.id, cat.id, q.id))}
                          disableUp={qi === 0}
                          disableDown={qi === cat.questions.length - 1}
                        >
                          {q.price}: {q.text.slice(0, 24) || '(пусто)'}
                        </Row>
                      ))}
                      <button
                        type="button"
                        className="text-xs opacity-60 hover:opacity-100 text-left py-1"
                        onClick={() => {
                          const nextPrice =
                            (round.priceScale ?? []).find((p) => !cat.questions.some((q) => q.price === p)) ??
                            cat.questions.length + 1
                          mutate((quiz2) => M.addQuestion(quiz2, round.id, cat.id, nextPrice))
                        }}
                      >
                        + вопрос
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  className="text-xs opacity-60 hover:opacity-100 text-left py-1"
                  onClick={() => mutate((q) => M.addCategory(q, round.id))}
                >
                  + категория
                </button>
              </div>
            )}
          </div>
        )
      })}

      <button type="button" className="btn-secondary text-sm mt-3" onClick={() => mutate((q) => M.addRound(q))}>
        + раунд
      </button>
    </div>
  )
}

function TreeButton({ children, active, onClick }: { children: ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      className={`text-left rounded px-2 py-1.5 font-semibold ${active ? 'bg-quiz-primary/30' : 'hover:bg-white/5'}`}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

function Row({
  children,
  active,
  small,
  onClick,
  onUp,
  onDown,
  onRemove,
  disableUp,
  disableDown,
}: {
  children: ReactNode
  active: boolean
  small?: boolean
  onClick: () => void
  onUp: () => void
  onDown: () => void
  onRemove: () => void
  disableUp: boolean
  disableDown: boolean
}) {
  return (
    <div
      className={`flex items-center gap-1 rounded px-2 py-1 cursor-pointer group ${
        active ? 'bg-quiz-primary/30' : 'hover:bg-white/5'
      } ${small ? 'text-xs' : 'text-sm font-semibold'}`}
      onClick={onClick}
    >
      <span className="flex-1 truncate">{children}</span>
      <button
        type="button"
        className="opacity-0 group-hover:opacity-60 hover:!opacity-100 disabled:!opacity-0"
        disabled={disableUp}
        onClick={(e) => {
          e.stopPropagation()
          onUp()
        }}
      >
        ↑
      </button>
      <button
        type="button"
        className="opacity-0 group-hover:opacity-60 hover:!opacity-100 disabled:!opacity-0"
        disabled={disableDown}
        onClick={(e) => {
          e.stopPropagation()
          onDown()
        }}
      >
        ↓
      </button>
      <button
        type="button"
        className="opacity-0 group-hover:opacity-60 hover:!opacity-100 text-red-400"
        onClick={(e) => {
          e.stopPropagation()
          onRemove()
        }}
      >
        ✕
      </button>
    </div>
  )
}
