import type { Category } from '../../types/quiz'
import { Field } from './Field'

type Props = {
  category: Category
  onChange: (patch: Partial<Category>) => void
}

export function CategoryForm({ category, onChange }: Props) {
  return (
    <div className="flex flex-col gap-4 max-w-xl">
      <h2 className="text-lg font-bold">Категория</h2>
      <Field label="Название категории">
        <input className="input" value={category.title} onChange={(e) => onChange({ title: e.target.value })} />
      </Field>
      <p className="text-sm opacity-60">Вопросы этой категории редактируются и добавляются в дереве слева.</p>
    </div>
  )
}
