import type { Question, RoundType } from '../../types/quiz'
import { Field } from './Field'
import { MediaField } from './MediaField'

type Props = {
  question: Question
  roundType: RoundType
  onChange: (patch: Partial<Question>) => void
}

export function QuestionForm({ question, roundType, onChange }: Props) {
  const isChoice = roundType === 'choice'
  const isSequential = roundType === 'warmup' || roundType === 'final'

  return (
    <div className="flex flex-col gap-4 max-w-xl">
      <h2 className="text-lg font-bold">Вопрос</h2>

      <Field label={isSequential ? 'Номер / очки' : 'Цена'}>
        <input
          type="number"
          className="input w-28"
          value={question.price}
          onChange={(e) => onChange({ price: Number(e.target.value) || 0 })}
        />
      </Field>

      <Field label="Текст вопроса">
        <textarea
          className="input min-h-[5rem]"
          value={question.text}
          onChange={(e) => onChange({ text: e.target.value })}
        />
      </Field>

      <MediaField label="Медиа вопроса" media={question.media} onChange={(media) => onChange({ media })} />

      {isChoice ? (
        <OptionsEditor question={question} onChange={onChange} />
      ) : (
        <Field label="Текст ответа">
          <textarea
            className="input min-h-[4rem]"
            value={question.answerText ?? ''}
            onChange={(e) => onChange({ answerText: e.target.value || undefined })}
          />
        </Field>
      )}

      <MediaField
        label="Медиа ответа"
        media={question.answerMedia}
        onChange={(answerMedia) => onChange({ answerMedia })}
      />

      <Field label="Свой фон вопроса (необязательно)">
        <input
          className="input"
          value={question.background ?? ''}
          onChange={(e) => onChange({ background: e.target.value || undefined })}
        />
      </Field>

      <Field label="Свой звук вопроса (необязательно, URL или /media/файл)">
        <input
          className="input"
          value={question.sound ?? ''}
          onChange={(e) => onChange({ sound: e.target.value || undefined })}
        />
      </Field>
    </div>
  )
}

function OptionsEditor({ question, onChange }: { question: Question; onChange: (patch: Partial<Question>) => void }) {
  const options = question.options ?? ['', '']

  function setOption(index: number, value: string) {
    const next = [...options]
    next[index] = value
    onChange({ options: next })
  }

  function addOption() {
    if (options.length >= 5) return
    onChange({ options: [...options, ''] })
  }

  function removeOption(index: number) {
    const next = options.filter((_, i) => i !== index)
    const correct = question.correctOptionIndex
    const correctOptionIndex =
      correct === index ? undefined : correct !== undefined && correct > index ? correct - 1 : correct
    onChange({ options: next, correctOptionIndex })
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm opacity-70">Варианты ответа (отметь правильный)</span>
      {options.map((opt, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            type="radio"
            name="correct-option"
            checked={question.correctOptionIndex === i}
            onChange={() => onChange({ correctOptionIndex: i })}
          />
          <input className="input flex-1" value={opt} onChange={(e) => setOption(i, e.target.value)} />
          {options.length > 2 && (
            <button type="button" className="text-red-400 text-sm" onClick={() => removeOption(i)}>
              ✕
            </button>
          )}
        </div>
      ))}
      {options.length < 5 && (
        <button type="button" className="btn-secondary text-sm self-start" onClick={addOption}>
          + вариант
        </button>
      )}
    </div>
  )
}
