import { useEffect, useState } from 'react'
import type { Quiz } from '../types/quiz'
import { useLoadedQuiz } from '../lib/useLoadedQuiz'
import { useGameController } from '../lib/useGameController'
import { useQuizStore, type QuizListEntry } from '../stores/quizStore'
import { perQuestionReset } from '../stores/gameStore'
import { GameStageView } from '../components/GameStageView'
import { Scoreboard } from '../components/scoreboard/Scoreboard'
import { HostControls } from '../components/host/HostControls'
import { toggleFullscreen } from '../lib/fullscreen'
import { getRoomRounds } from '../lib/gameLogic'

export function HostPage() {
  const { quiz, loading, error } = useLoadedQuiz()
  const quizList = useQuizStore((s) => s.quizList)
  const selectQuiz = useQuizStore((s) => s.selectQuiz)
  const controller = useGameController(quiz)
  const { game, round, advance, advanceLabel, backToBoard, backToRules } = controller

  const [showSetup, setShowSetup] = useState(false)
  const needsSetup = !quiz || game.quizId !== quiz.id || showSetup

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (needsSetup) return
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.code === 'Space') {
        e.preventDefault()
        advance()
      } else if (e.code === 'Escape') {
        e.preventDefault()
        backToBoard()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [needsSetup, advance, backToBoard])

  if (loading) return <Centered text="Загрузка квиза…" />
  if (error) return <Centered text={`Ошибка: ${error}`} />
  if (!quiz) return <Centered text="Квиз не найден. Проверь /public/quizzes/index.json" />

  if (needsSetup) {
    return (
      <TeamSetupForm
        quiz={quiz}
        quizList={quizList}
        onSelectQuiz={selectQuiz}
        onCancel={game.quizId === quiz.id ? () => setShowSetup(false) : undefined}
        onStart={(roomId, names) => {
          game.startGame(quiz.id, roomId, names, quiz.defaultTimerSeconds)
          setShowSetup(false)
        }}
      />
    )
  }

  const room = quiz.rooms.find((r) => r.id === game.roomId)
  const canGoBack = round && round.type !== 'casino' && ['choose', 'question', 'answer'].includes(game.currentScreen)
  const activeTeamId =
    game.currentScreen === 'question' && game.activeTeamIndex !== null ? game.teams[game.activeTeamIndex]?.id : null

  return (
    <div className="h-screen w-screen flex flex-col font-quiz bg-[#0c0a22] text-white">
      <div className="flex items-center gap-3 px-4 pt-2">
        <span className="font-spooky text-xl text-quiz-primary">Пульт ведущего</span>
        {room && <span className="chip border-quiz-accent/50 text-quiz-accent">Комната: {room.title}</span>}
        <div className="flex-1">
          <Scoreboard teams={game.teams} interactive onAdjust={game.adjustScore} activeTeamId={activeTeamId} />
        </div>
      </div>

      <div className="flex-1 flex min-h-0 gap-3 px-3">
        <div className="flex-1 min-w-0 rounded-2xl overflow-hidden border border-white/10 flex">
          <GameStageView
            quiz={quiz}
            game={game}
            playSounds={false}
            interactiveBoard
            onSelectQuestion={controller.openQuestion}
            onTimerEnd={game.stopTimer}
          />
        </div>
        <aside className="w-[380px] shrink-0 overflow-y-auto">
          <HostControls quiz={quiz} controller={controller} />
        </aside>
      </div>

      <div className="flex flex-wrap items-center gap-3 p-3">
        <button className="btn-primary text-lg" onClick={advance}>
          {advanceLabel} <span className="opacity-60 text-sm">(Space)</span>
        </button>
        <button className="btn-secondary" onClick={backToBoard} disabled={!canGoBack}>
          К доске (Esc)
        </button>
        <button
          className="btn-secondary"
          onClick={backToRules}
          disabled={!round || !['board', 'casino-bets'].includes(game.currentScreen)}
        >
          К правилам
        </button>

        <div className="flex items-center gap-2 border-l border-white/15 pl-3">
          <button className="btn-secondary" onClick={() => game.startTimer()}>
            ▶ Таймер {game.timerDuration}с
          </button>
          <button className="btn-secondary" onClick={() => game.stopTimer()} title="Пауза">
            ⏸
          </button>
          <button className="btn-secondary" onClick={() => game.resetTimer()} title="Сброс">
            ⟲
          </button>
        </div>

        <RoundJump quiz={quiz} roomId={game.roomId} currentRoundId={game.currentRoundId} onJump={(id) => {
          game.update({ ...perQuestionReset, bets: {}, activeTeamIndex: null })
          game.setScreen('rules', { roundId: id, questionId: null })
        }} />

        <button className="btn-secondary ml-auto" onClick={toggleFullscreen}>
          Полный экран
        </button>
        <button className="btn-secondary" onClick={() => setShowSetup(true)}>
          Новая игра
        </button>
      </div>
    </div>
  )
}

/** Быстрый переход на любой раунд — на случай, если что-то пошло не по плану. */
function RoundJump({
  quiz,
  roomId,
  currentRoundId,
  onJump,
}: {
  quiz: Quiz
  roomId: string | null
  currentRoundId: string | null
  onJump: (roundId: string) => void
}) {
  const rounds = getRoomRounds(quiz, roomId)
  return (
    <select
      className="bg-white/10 rounded-xl px-3 py-2 text-sm border border-white/10"
      value={currentRoundId ?? ''}
      onChange={(e) => e.target.value && onJump(e.target.value)}
    >
      <option value="">Перейти к раунду…</option>
      {rounds.map((r) => (
        <option key={r.id} value={r.id}>
          {r.title}
        </option>
      ))}
    </select>
  )
}

function TeamSetupForm({
  quiz,
  quizList,
  onSelectQuiz,
  onStart,
  onCancel,
}: {
  quiz: Quiz
  quizList: QuizListEntry[]
  onSelectQuiz: (file: string) => void
  onStart: (roomId: string | null, teamNames: string[]) => void
  onCancel?: () => void
}) {
  const [names, setNames] = useState(['Команда 1', 'Команда 2', 'Команда 3'])
  const [roomId, setRoomId] = useState<string | null>(quiz.rooms[0]?.id ?? null)

  return (
    <div
      className="h-screen w-screen flex items-center justify-center font-quiz text-white bg-cover bg-center overflow-y-auto"
      style={{ backgroundImage: 'linear-gradient(rgba(12,10,34,.7), rgba(12,10,34,.92)), url(/media/bg-forest.jpg)' }}
    >
      <div className="glass rounded-3xl flex flex-col gap-6 w-full max-w-xl p-8 my-8">
        <h1 className="stage-title text-4xl text-center">{quiz.title}</h1>

        {quizList.length > 1 && (
          <label className="flex flex-col gap-1 text-sm">
            Квиз
            <select
              className="input"
              value={quizList.find((q) => q.id === quiz.id)?.file}
              onChange={(e) => onSelectQuiz(e.target.value)}
            >
              {quizList.map((q) => (
                <option key={q.file} value={q.file}>
                  {q.title}
                </option>
              ))}
            </select>
          </label>
        )}

        {quiz.rooms.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="text-sm opacity-70">Комната</span>
            <div className="grid grid-cols-2 gap-3">
              {quiz.rooms.map((room) => (
                <button
                  key={room.id}
                  type="button"
                  onClick={() => setRoomId(room.id)}
                  className={`rounded-2xl border-2 px-4 py-4 text-left transition ${
                    roomId === room.id
                      ? 'border-quiz-primary bg-quiz-primary/15 shadow-[0_0_24px_-6px_var(--quiz-primary-color)]'
                      : 'border-white/10 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="font-spooky text-3xl text-quiz-primary">{room.title}</div>
                  {room.subtitle && <div className="text-sm opacity-70">{room.subtitle}</div>}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <span className="text-sm opacity-70">Команды (порядок = очерёдность ответов в Раунде 1)</span>
          {names.map((name, i) => (
            <div key={i} className="flex gap-2">
              <input
                className="input flex-1"
                value={name}
                onChange={(e) => setNames((prev) => prev.map((n, idx) => (idx === i ? e.target.value : n)))}
              />
              {names.length > 1 && (
                <button className="btn-secondary" onClick={() => setNames((prev) => prev.filter((_, idx) => idx !== i))}>
                  ✕
                </button>
              )}
            </div>
          ))}
          <button className="btn-secondary" onClick={() => setNames((prev) => [...prev, `Команда ${prev.length + 1}`])}>
            + команда
          </button>
        </div>

        <div className="flex gap-3">
          {onCancel && (
            <button className="btn-secondary" onClick={onCancel}>
              Вернуться к игре
            </button>
          )}
          <button
            className="btn-primary flex-1 text-lg"
            onClick={() => onStart(roomId, names.map((n) => n.trim()).filter(Boolean))}
            disabled={names.every((n) => !n.trim()) || (quiz.rooms.length > 0 && !roomId)}
          >
            Начать игру
          </button>
        </div>
      </div>
    </div>
  )
}

function Centered({ text }: { text: string }) {
  return <div className="h-screen w-screen flex items-center justify-center text-2xl text-center px-12">{text}</div>
}
