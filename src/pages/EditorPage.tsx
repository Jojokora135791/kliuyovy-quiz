import { useEffect, useState } from 'react'
import type { Quiz } from '../types/quiz'
import type { Selection } from '../types/editor'
import { useQuizStore } from '../stores/quizStore'
import { loadJSON, saveJSON } from '../lib/persist'
import { applyQuizTheme, backgroundStyle } from '../lib/theme'
import * as M from '../lib/quizMutations'
import { EditorTree } from '../components/editor/EditorTree'
import { QuizSettingsForm } from '../components/editor/QuizSettingsForm'
import { RoundForm } from '../components/editor/RoundForm'
import { CategoryForm } from '../components/editor/CategoryForm'
import { QuestionForm } from '../components/editor/QuestionForm'
import { RulesScreen } from '../components/rules/RulesScreen'
import { QuestionScreen } from '../components/question/QuestionScreen'
import { AnswerScreen } from '../components/answer/AnswerScreen'

export function EditorPage() {
  const quizList = useQuizStore((s) => s.quizList)
  const sourceQuiz = useQuizStore((s) => s.quiz)
  const loading = useQuizStore((s) => s.loading)
  const error = useQuizStore((s) => s.error)
  const loadQuizList = useQuizStore((s) => s.loadQuizList)
  const selectQuiz = useQuizStore((s) => s.selectQuiz)

  const [draft, setDraft] = useState<Quiz | null>(null)
  const [selection, setSelection] = useState<Selection>({ kind: 'quiz' })
  const [previewTab, setPreviewTab] = useState<'question' | 'answer'>('question')

  useEffect(() => {
    loadQuizList()
  }, [loadQuizList])

  useEffect(() => {
    if (!sourceQuiz) return
    const savedDraft = loadJSON<Quiz>(`editor-draft:${sourceQuiz.id}`)
    setDraft(savedDraft ?? sourceQuiz)
    setSelection({ kind: 'quiz' })
    // перезагружаем черновик только при смене исходного квиза, не при каждом локальном изменении
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceQuiz?.id])

  useEffect(() => {
    if (draft) saveJSON(`editor-draft:${draft.id}`, draft)
  }, [draft])

  useEffect(() => {
    if (draft) applyQuizTheme(draft.theme)
  }, [draft?.theme])

  function mutate(fn: (quiz: Quiz) => Quiz) {
    setDraft((prev) => (prev ? fn(prev) : prev))
  }

  function handleExport() {
    if (!draft) return
    const blob = new Blob([JSON.stringify(draft, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${draft.id || 'quiz'}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleImportFile(file: File) {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as Quiz
        setDraft(parsed)
        setSelection({ kind: 'quiz' })
      } catch {
        alert('Не удалось прочитать JSON — проверь формат файла.')
      }
    }
    reader.readAsText(file)
  }

  if (loading && !draft) return <Centered text="Загрузка квиза…" />
  if (error) return <Centered text={`Ошибка: ${error}`} />
  if (!draft) return <Centered text="Квиз не найден. Проверь /public/quizzes/index.json" />

  const round = 'roundId' in selection ? draft.rounds.find((r) => r.id === selection.roundId) : undefined
  const category =
    round && 'categoryId' in selection ? round.categories.find((c) => c.id === selection.categoryId) : undefined
  const question =
    category && selection.kind === 'question' ? category.questions.find((q) => q.id === selection.questionId) : undefined

  return (
    <div className="h-screen w-screen flex flex-col font-quiz bg-black/95 text-white">
      <div className="flex flex-wrap items-center gap-3 p-3 border-b border-white/10">
        <h1 className="font-heading text-lg font-bold mr-2">Редактор квиза</h1>
        {quizList.length > 1 && (
          <select
            className="input w-auto"
            value={quizList.find((q) => q.id === draft.id)?.file}
            onChange={(e) => selectQuiz(e.target.value)}
          >
            {quizList.map((q) => (
              <option key={q.file} value={q.file}>
                {q.title}
              </option>
            ))}
          </select>
        )}
        <button className="btn-secondary" onClick={handleExport}>
          Экспорт JSON
        </button>
        <label className="btn-secondary cursor-pointer">
          Импорт JSON
          <input
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleImportFile(file)
              e.target.value = ''
            }}
          />
        </label>
        <a className="btn-secondary ml-auto" href="/host" target="_blank" rel="noreferrer">
          Открыть /host ↗
        </a>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-72 shrink-0 border-r border-white/10 p-3 overflow-y-auto">
          <EditorTree quiz={draft} selection={selection} onSelect={setSelection} mutate={mutate} />
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
          {selection.kind === 'quiz' && (
            <QuizSettingsForm
              quiz={draft}
              onChange={(patch) => mutate((q) => M.updateQuiz(q, patch))}
              onThemeChange={(patch) => mutate((q) => M.updateTheme(q, patch))}
              onSoundsChange={(patch) => mutate((q) => M.updateSounds(q, patch))}
            />
          )}
          {selection.kind === 'round' && round && (
            <RoundForm
              round={round}
              onChange={(patch) => mutate((q) => M.mapRound(q, round.id, (r) => ({ ...r, ...patch })))}
            />
          )}
          {selection.kind === 'category' && round && category && (
            <CategoryForm
              category={category}
              onChange={(patch) => mutate((q) => M.mapCategory(q, round.id, category.id, (c) => ({ ...c, ...patch })))}
            />
          )}
          {selection.kind === 'question' && round && category && question && (
            <QuestionForm
              question={question}
              roundType={round.type}
              onChange={(patch) =>
                mutate((q) => M.mapQuestion(q, round.id, category.id, question.id, (qq) => ({ ...qq, ...patch })))
              }
            />
          )}
        </div>

        <div className="w-[420px] shrink-0 border-l border-white/10 p-4 overflow-y-auto flex flex-col gap-3">
          <h2 className="text-sm font-bold opacity-60 uppercase tracking-wide">Предпросмотр</h2>
          <div
            className="aspect-video rounded-xl overflow-hidden border border-white/10 relative bg-black/40"
            style={backgroundStyle(round?.background ?? draft.theme.background)}
          >
            {selection.kind === 'round' && round && (
              <div className="absolute inset-0">
                <RulesScreen round={round} />
              </div>
            )}
            {selection.kind === 'question' && round && question && (
              <div className="absolute inset-0">
                {previewTab === 'question' ? (
                  <QuestionScreen round={round} question={question} playSounds={false} timerRunning={false} timerEndsAt={null} />
                ) : (
                  <AnswerScreen round={round} question={question} playSounds={false} />
                )}
              </div>
            )}
            {selection.kind !== 'round' && selection.kind !== 'question' && (
              <div className="absolute inset-0 flex items-center justify-center text-sm opacity-50 px-6 text-center">
                Выбери раунд или вопрос слева, чтобы увидеть предпросмотр
              </div>
            )}
          </div>
          {selection.kind === 'question' && (
            <div className="flex gap-2">
              <button
                className={`btn-secondary text-sm ${previewTab === 'question' ? 'ring-2 ring-quiz-primary' : ''}`}
                onClick={() => setPreviewTab('question')}
              >
                Вопрос
              </button>
              <button
                className={`btn-secondary text-sm ${previewTab === 'answer' ? 'ring-2 ring-quiz-primary' : ''}`}
                onClick={() => setPreviewTab('answer')}
              >
                Ответ
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Centered({ text }: { text: string }) {
  return <div className="h-screen w-screen flex items-center justify-center text-xl text-center px-12 font-quiz">{text}</div>
}
