import type { Quiz } from '../../types/quiz'
import { Field } from './Field'

type Props = {
  quiz: Quiz
  onChange: (patch: Partial<Quiz>) => void
  onThemeChange: (patch: Partial<Quiz['theme']>) => void
  onSoundsChange: (patch: Partial<Quiz['sounds']>) => void
}

export function QuizSettingsForm({ quiz, onChange, onThemeChange, onSoundsChange }: Props) {
  return (
    <div className="flex flex-col gap-4 max-w-xl">
      <h2 className="text-lg font-bold">Настройки квиза</h2>

      <Field label="Название квиза">
        <input className="input" value={quiz.title} onChange={(e) => onChange({ title: e.target.value })} />
      </Field>

      <Field label="Таймер по умолчанию (сек)">
        <input
          type="number"
          className="input w-28"
          value={quiz.defaultTimerSeconds}
          onChange={(e) => onChange({ defaultTimerSeconds: Number(e.target.value) || 0 })}
        />
      </Field>

      <h3 className="font-semibold mt-2">Оформление</h3>
      <Field label="Фон квиза (URL картинки или CSS-цвет/градиент)">
        <input
          className="input"
          placeholder="/media/bg.jpg или linear-gradient(...)"
          value={quiz.theme.background ?? ''}
          onChange={(e) => onThemeChange({ background: e.target.value || undefined })}
        />
      </Field>
      <Field label="Шрифт (CSS font-family)">
        <input
          className="input"
          value={quiz.theme.fontFamily ?? ''}
          onChange={(e) => onThemeChange({ fontFamily: e.target.value || undefined })}
        />
      </Field>
      <div className="flex gap-6">
        <Field label="Основной цвет">
          <input
            type="color"
            value={quiz.theme.primaryColor ?? '#ff8c1a'}
            onChange={(e) => onThemeChange({ primaryColor: e.target.value })}
          />
        </Field>
        <Field label="Акцентный цвет">
          <input
            type="color"
            value={quiz.theme.accentColor ?? '#9b30ff'}
            onChange={(e) => onThemeChange({ accentColor: e.target.value })}
          />
        </Field>
      </div>

      <h3 className="font-semibold mt-2">Звуки (URL или /media/файл)</h3>
      <Field label="Открытие вопроса">
        <input
          className="input"
          value={quiz.sounds.open ?? ''}
          onChange={(e) => onSoundsChange({ open: e.target.value || undefined })}
        />
      </Field>
      <Field label="Показ ответа">
        <input
          className="input"
          value={quiz.sounds.reveal ?? ''}
          onChange={(e) => onSoundsChange({ reveal: e.target.value || undefined })}
        />
      </Field>
      <Field label="Конец таймера">
        <input
          className="input"
          value={quiz.sounds.timerEnd ?? ''}
          onChange={(e) => onSoundsChange({ timerEnd: e.target.value || undefined })}
        />
      </Field>
    </div>
  )
}
