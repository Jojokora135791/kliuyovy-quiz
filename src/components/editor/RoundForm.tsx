import type { Room, Round, RoundType, TrickScoring } from '../../types/quiz'
import { DEFAULT_TRICK_SCORING, ROUND_TYPE_LABELS } from '../../lib/gameLogic'
import { Field } from './Field'

type Props = {
  round: Round
  rooms: Room[]
  onChange: (patch: Partial<Round>) => void
}

const ROUND_TYPES: { value: RoundType; hint: string }[] = [
  { value: 'music', hint: 'Раунд 1: треки по очереди, +1 за автора, +1 за трек' },
  { value: 'trickOrTreat', hint: 'Раунды 2.x: темы × вопросы, выбор сладость/гадость перед каждым' },
  { value: 'casino', hint: 'Раунд 3: убираем темы, ставки, один вопрос (1 вопрос на тему)' },
]

const SCORING_FIELDS: { key: keyof TrickScoring; label: string }[] = [
  { key: 'sweetCorrect', label: '🍬 верно' },
  { key: 'sweetWrong', label: '🍬 неверно' },
  { key: 'sweetEmpty', label: '🍬 пусто' },
  { key: 'trickCorrect', label: '💀 верно' },
  { key: 'trickWrong', label: '💀 неверно' },
  { key: 'trickEmpty', label: '💀 пусто' },
]

export function RoundForm({ round, rooms, onChange }: Props) {
  const scoring = round.scoring ?? DEFAULT_TRICK_SCORING

  return (
    <div className="flex flex-col gap-4 max-w-xl">
      <h2 className="text-lg font-bold">Раунд</h2>

      <Field label="Название раунда">
        <input className="input" value={round.title} onChange={(e) => onChange({ title: e.target.value })} />
      </Field>

      <Field label="Механика раунда">
        <select className="input" value={round.type} onChange={(e) => onChange({ type: e.target.value as RoundType })}>
          {ROUND_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {ROUND_TYPE_LABELS[t.value]}
            </option>
          ))}
        </select>
        <span className="text-xs opacity-60">{ROUND_TYPES.find((t) => t.value === round.type)?.hint}</span>
      </Field>

      <Field label="Комната">
        <select
          className="input"
          value={round.roomId ?? ''}
          onChange={(e) => onChange({ roomId: e.target.value || undefined })}
        >
          <option value="">Все комнаты (общий раунд)</option>
          {rooms.map((r) => (
            <option key={r.id} value={r.id}>
              Только «{r.title}»
            </option>
          ))}
        </select>
      </Field>

      <Field label="Таймер раунда, сек (пусто — как в настройках квиза)">
        <input
          type="number"
          className="input w-28"
          value={round.timerSeconds ?? ''}
          onChange={(e) => onChange({ timerSeconds: e.target.value ? Number(e.target.value) : undefined })}
        />
      </Field>

      {round.type === 'trickOrTreat' && (
        <div className="flex flex-col gap-2">
          <span className="text-sm opacity-70">Множители номинала «Сладость или гадость» (итог = множитель × номинал)</span>
          <div className="grid grid-cols-3 gap-2">
            {SCORING_FIELDS.map((f) => (
              <label key={f.key} className="flex items-center gap-2 text-sm">
                <span className="w-20">{f.label}</span>
                <input
                  type="number"
                  className="input !w-16"
                  value={scoring[f.key]}
                  onChange={(e) => onChange({ scoring: { ...scoring, [f.key]: Number(e.target.value) || 0 } })}
                />
              </label>
            ))}
          </div>
        </div>
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
