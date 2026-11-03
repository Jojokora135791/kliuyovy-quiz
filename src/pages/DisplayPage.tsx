import { useLoadedQuiz } from '../lib/useLoadedQuiz'
import { useGameStore } from '../stores/gameStore'
import { GameStageView } from '../components/GameStageView'
import { Scoreboard } from '../components/scoreboard/Scoreboard'
import { toggleFullscreen } from '../lib/fullscreen'

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
  const activeTeamId =
    game.currentScreen === 'question' && game.activeTeamIndex !== null ? game.teams[game.activeTeamIndex]?.id : null

  return (
    <div className="h-screen w-screen flex font-quiz" onDoubleClick={toggleFullscreen}>
      <GameStageView
        quiz={quiz}
        game={game}
        playSounds
        footer={showScoreboard && <Scoreboard teams={game.teams} activeTeamId={activeTeamId} />}
      />
    </div>
  )
}

function CenteredMessage({ text }: { text: string }) {
  return (
    <div
      className="h-screen w-screen flex items-center justify-center text-2xl text-center px-12 font-quiz bg-cover bg-center"
      style={{ backgroundImage: 'linear-gradient(rgba(12,10,34,.75), rgba(12,10,34,.9)), url(/media/bg-forest.jpg)' }}
    >
      <div className="glass rounded-3xl px-10 py-6">{text}</div>
    </div>
  )
}
