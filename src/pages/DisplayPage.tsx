import { useLoadedQuiz } from '../lib/useLoadedQuiz'
import { useGameStore } from '../stores/gameStore'
import { GameStageView } from '../components/GameStageView'
import { Scoreboard } from '../components/scoreboard/Scoreboard'

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {})
  } else {
    document.exitFullscreen().catch(() => {})
  }
}

/**
 * Табло — только для чтения: ни одно действие здесь не должно писать в gameStore.
 * Иначе локальный стейт этой вкладки может по каналу перезаписать более свежее
 * состояние у ведущего устаревшими данными (единственный источник правды — /host).
 */
export function DisplayPage() {
  const { quiz, loading, error } = useLoadedQuiz()
  const game = useGameStore()

  if (loading) return <CenteredMessage text="Загрузка квиза…" />
  if (error) return <CenteredMessage text={`Ошибка: ${error}`} />
  if (!quiz) return <CenteredMessage text="Квиз не найден. Проверь /public/quizzes/index.json" />
  if (!game.quizId || game.quizId !== quiz.id) {
    return <CenteredMessage text="Ждём, пока ведущий запустит игру на странице /host…" />
  }

  const showScoreboard = game.currentScreen !== 'intro' && game.currentScreen !== 'end'

  return (
    <div className="h-screen w-screen flex flex-col font-quiz" onDoubleClick={toggleFullscreen}>
      {showScoreboard && <Scoreboard teams={game.teams} />}
      <GameStageView quiz={quiz} game={game} playSounds />
    </div>
  )
}

function CenteredMessage({ text }: { text: string }) {
  return (
    <div className="h-screen w-screen flex items-center justify-center text-2xl text-center px-12 font-quiz">
      {text}
    </div>
  )
}
