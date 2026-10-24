import { useEffect, useState } from 'react'
import { useLoadedQuiz } from '../lib/useLoadedQuiz'
import { useGameController } from '../lib/useGameController'
import { useQuizStore } from '../stores/quizStore'
import { GameStageView } from '../components/GameStageView'
import { Scoreboard } from '../components/scoreboard/Scoreboard'
import { findQuestionLocation, isRoundComplete } from '../lib/gameLogic'

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {})
  } else {
    document.exitFullscreen().catch(() => {})
  }
}

export function HostPage() {
  const { quiz, loading, error } = useLoadedQuiz()
  const quizList = useQuizStore((s) => s.quizList)
  const selectQuiz = useQuizStore((s) => s.selectQuiz)
  const { game, openQuestion, showAnswer, backToBoard, advance } = useGameController(quiz)

  const [showSetup, setShowSetup] = useState(false)
  const needsSetup = !quiz || game.quizId !== quiz.id || showSetup

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (needsSetup) return
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
        onStart={(names) => {
          game.startGame(quiz.id, names, quiz.defaultTimerSeconds)
          setShowSetup(false)
        }}
      />
    )
  }

  const round = quiz.rounds.find((r) => r.id === game.currentRoundId) ?? null
  const location = game.currentQuestionId ? findQuestionLocation(quiz, game.currentQuestionId) : null
  const boardReady = round && game.currentScreen === 'board' && isRoundComplete(round, game.playedQuestionIds)

  return (
    <div className="h-screen w-screen flex flex-col font-quiz bg-black/95 text-white">
      <Scoreboard teams={game.teams} interactive onAdjust={game.adjustScore} />

      <div className="flex-1 overflow-hidden border-y-4 border-quiz-accent/40">
        <GameStageView
          quiz={quiz}
          game={game}
          playSounds={false}
          interactiveBoard={game.currentScreen === 'board'}
          onSelectQuestion={openQuestion}
          onTimerEnd={game.stopTimer}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3 p-4 bg-black/60">
        <button className="btn-primary" onClick={advance}>
          {boardReady ? 'Следующий раунд (Space)' : 'Дальше (Space)'}
        </button>
        <button className="btn-secondary" onClick={backToBoard} disabled={round?.type === 'final'}>
          Назад к доске (Esc)
        </button>

        {game.currentScreen === 'question' && (
          <button className="btn-secondary" onClick={showAnswer}>
            Показать ответ
          </button>
        )}

        <TimerControls
          timerDuration={game.timerDuration}
          startTimer={game.startTimer}
          stopTimer={game.stopTimer}
          resetTimer={game.resetTimer}
        />

        {location && (game.currentScreen === 'question' || game.currentScreen === 'answer') && (
          <QuickAward teams={game.teams} price={location.question.price} onAdjust={game.adjustScore} />
        )}

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

function TimerControls({
  timerDuration,
  startTimer,
  stopTimer,
  resetTimer,
}: {
  timerDuration: number
  startTimer: (seconds?: number) => void
  stopTimer: () => void
  resetTimer: (seconds?: number) => void
}) {
  return (
    <div className="flex items-center gap-2 border-l border-white/20 pl-3">
      <button className="btn-secondary" onClick={() => startTimer()}>
        ▶ Таймер {timerDuration}с
      </button>
      <button className="btn-secondary" onClick={() => stopTimer()}>
        ⏸
      </button>
      <button className="btn-secondary" onClick={() => resetTimer()}>
        ⟲
      </button>
    </div>
  )
}

function QuickAward({
  teams,
  price,
  onAdjust,
}: {
  teams: { id: string; name: string }[]
  price: number
  onAdjust: (teamId: string, delta: number) => void
}) {
  return (
    <div className="flex items-center gap-2 border-l border-white/20 pl-3">
      <span className="text-sm opacity-70">За {price}:</span>
      {teams.map((t) => (
        <span key={t.id} className="flex items-center gap-1">
          <button className="btn-secondary !px-2" onClick={() => onAdjust(t.id, price)}>
            +{t.name}
          </button>
          <button className="btn-secondary !px-2" onClick={() => onAdjust(t.id, -price)}>
            −{t.name}
          </button>
        </span>
      ))}
    </div>
  )
}

function TeamSetupForm({
  quiz,
  quizList,
  onSelectQuiz,
  onStart,
}: {
  quiz: { id: string; title: string }
  quizList: { id: string; title: string; file: string }[]
  onSelectQuiz: (file: string) => void
  onStart: (teamNames: string[]) => void
}) {
  const [names, setNames] = useState(['Команда 1', 'Команда 2'])

  return (
    <div className="h-screen w-screen flex items-center justify-center font-quiz bg-black/95 text-white">
      <div className="flex flex-col gap-6 w-full max-w-md p-8">
        <h1 className="text-2xl font-black text-center">{quiz.title}</h1>

        {quizList.length > 1 && (
          <label className="flex flex-col gap-1 text-sm">
            Квиз
            <select
              className="bg-white/10 rounded px-3 py-2"
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

        <div className="flex flex-col gap-2">
          {names.map((name, i) => (
            <div key={i} className="flex gap-2">
              <input
                className="flex-1 bg-white/10 rounded px-3 py-2"
                value={name}
                onChange={(e) =>
                  setNames((prev) => prev.map((n, idx) => (idx === i ? e.target.value : n)))
                }
              />
              {names.length > 1 && (
                <button
                  className="btn-secondary"
                  onClick={() => setNames((prev) => prev.filter((_, idx) => idx !== i))}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button
            className="btn-secondary"
            onClick={() => setNames((prev) => [...prev, `Команда ${prev.length + 1}`])}
          >
            + команда
          </button>
        </div>

        <button
          className="btn-primary"
          onClick={() => onStart(names.map((n) => n.trim()).filter(Boolean))}
          disabled={names.every((n) => !n.trim())}
        >
          Начать игру
        </button>
      </div>
    </div>
  )
}

function Centered({ text }: { text: string }) {
  return <div className="h-screen w-screen flex items-center justify-center text-2xl text-center px-12">{text}</div>
}
