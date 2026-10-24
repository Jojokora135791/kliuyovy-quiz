import type { Round, RoundType } from '../../types/quiz'
import { Field } from './Field'

type Props = {
  round: Round
  onChange: (patch: Partial<Round>) => void
}

const ROUND_TYPES: { value: RoundType; label: string }[] = [
  { value: 'jeopardy', label: 'Своя игра (категории × цены)' },
  { value: 'warmup', label: 'Разминка (пронумерованная сетка)' },
  { value: 'choice', label: 'Выбор варианта' },
  { value: 'final', label: 'Финал (без доски)' },
]

export function RoundForm({ round, onChange }: Props) {
  const priceScaleText = (round.priceScale ?? []).join(', ')

  return (
    <div className="flex flex-col gap-4 max-w-xl">
      <h2 className="text-lg font-bold">Раунд</h2>

      <Field label="Название раунда">
        <input className="input" value={round.title} onChange={(e) => onChange({ title: e.target.value })} />
      </Field>

      <Field label="Тип раунда">
        <select className="input" value={round.type} onChange={(e) => onChange({ type: e.target.value as RoundType })}>
          {ROUND_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </Field>

      {(round.type === 'jeopardy' || round.type === 'choice') && (
        <Field label="Шкала цен (через запятую, напр. 1, 2, 3, 4, 5)">
          <input
            className="input"
            value={priceScaleText}
            onChange={(e) =>
              onChange({
                priceScale: e.target.value
                  .split(',')
                  .map((v) => Number(v.trim()))
                  .filter((n) => !Number.isNaN(n)),
              })
            }
          />
        </Field>
      )}

      <Field label="Текст правил (отдельный слайд перед раундом)">
        <textarea
          className="input min-h-[6rem]"
          value={round.rulesText ?? ''}
          onChange={(e) => onChange({ rulesText: e.target.value || undefined })}
        />
      </Field>

      <Field label="Свой фон раунда (необязательно, переопределяет фон квиза)">
        <input
          className="input"
          placeholder="/media/bg.jpg или linear-gradient(...)"
          value={round.background ?? ''}
          onChange={(e) => onChange({ background: e.target.value || undefined })}
        />
      </Field>
    </div>
  )
}
