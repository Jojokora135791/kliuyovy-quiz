import type { Question, RoundType } from '../../types/quiz'
import { Field } from './Field'
import { MediaField } from './MediaField'

type Props = {
  question: Question
  roundType: RoundType
  onChange: (patch: Partial<Question>) => void
}

export function QuestionForm({ question, roundType, onChange }: Props) {
  const isMusic = roundType === 'music'

  return (
    <div className="flex flex-col gap-4 max-w-xl">
      <h2 className="text-lg font-bold">{isMusic ? 'Трек' : 'Вопрос'}</h2>

      {roundType === 'trickOrTreat' && (
        <Field label="Номинал (вес вопроса, 1–5) — умножается в зависимости от «Сладость/Гадость»">
          <input
            type="number"
            min={1}
            className="input w-28"
            value={question.price ?? ''}
            onChange={(e) => onChange({ price: e.target.value ? Number(e.target.value) : undefined })}
          />
        </Field>
      )}

      <Field label={isMusic ? 'Подпись на экране (необязательно)' : 'Текст вопроса'}>
        <textarea className="input min-h-[5rem]" value={question.text} onChange={(e) => onChange({ text: e.target.value })} />
      </Field>

      <MediaField
        label={isMusic ? 'Трек (аудио / YouTube)' : 'Медиа вопроса'}
        media={question.media}
        onChange={(media) => onChange({ media })}
      />

      {isMusic && (
        <Field label="Кто загадал (имя друга)">
          <input
            className="input"
            value={question.author ?? ''}
            onChange={(e) => onChange({ author: e.target.value || undefined })}
          />
        </Field>
      )}

      <Field label={isMusic ? 'Исполнитель — название' : 'Текст ответа'}>
        <textarea
          className="input min-h-[4rem]"
          value={question.answerText ?? ''}
          onChange={(e) => onChange({ answerText: e.target.value || undefined })}
        />
      </Field>

      <MediaField label="Медиа ответа" media={question.answerMedia} onChange={(answerMedia) => onChange({ answerMedia })} />

      <Field label="Свой фон вопроса (необязательно)">
        <input
          className="input"
          value={question.background ?? ''}
          onChange={(e) => onChange({ background: e.target.value || undefined })}
        />
      </Field>

      <Field label="Свой звук вопроса (необязательно, URL или /media/файл)">
        <input className="input" value={question.sound ?? ''} onChange={(e) => onChange({ sound: e.target.value || undefined })} />
      </Field>
    </div>
  )
}
