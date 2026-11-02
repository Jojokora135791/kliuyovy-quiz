import type { ReactNode } from 'react'
import type { Quiz } from '../types/quiz'
import type { GameState } from '../stores/gameStore'
import { IntroScreen } from './intro/IntroScreen'
import { RulesScreen } from './rules/RulesScreen'
import { Board } from './board/Board'
import { QuestionScreen } from './question/QuestionScreen'
import { AnswerScreen } from './answer/AnswerScreen'
import { EndScreen } from './scoreboard/EndScreen'
import { ChooseScreen } from './trick/ChooseScreen'
import { BetsScreen } from './casino/BetsScreen'
import { TeamStrip } from './TeamStrip'
import { findQuestionLocation } from '../lib/gameLogic'
import { backgroundStyle, resolveBackground } from '../lib/theme'

type Props = {
  quiz: Quiz
  game: GameState
  playSounds: boolean
  interactiveBoard?: boolean
  onSelectQuestion?: (questionId: string) => void
  onTimerEnd?: () => void
  footer?: ReactNode
}

export function GameStageView({
  quiz,
  game,
  playSounds,
  interactiveBoard = false,
  onSelectQuestion,
  onTimerEnd,
  footer,
}: Props) {
  const round = quiz.rounds.find((r) => r.id === game.currentRoundId) ?? null
  const room = quiz.rooms.find((r) => r.id === game.roomId) ?? null
  const location = game.currentQuestionId ? findQuestionLocation(quiz, game.currentQuestionId) : null

  const background = resolveBackground([
    quiz.theme.background,
    room?.background,
    round?.background,
    location?.question.background,
  ])

  let content: ReactNode = null
  switch (game.currentScreen) {
    case 'intro':
      content = <IntroScreen title={quiz.title} room={room} />
      break
    case 'rules':
      content = round ? <RulesScreen round={round} teams={game.teams} /> : null
      break
    case 'board':
      content = round ? (
        <Board
          round={round}
          playedQuestionIds={game.playedQuestionIds}
          interactive={interactiveBoard}
          onSelect={onSelectQuestion}
        />
      ) : null
      break
    case 'choose':
      content = round && location ? <ChooseScreen round={round} location={location} game={game} /> : null
      break
    case 'question':
      content =
        round && location ? (
          <QuestionScreen
            round={round}
            location={location}
            openSoundUrl={quiz.sounds.open}
            timerEndSoundUrl={quiz.sounds.timerEnd}
            playSounds={playSounds}
            timerRunning={game.timerRunning}
            timerEndsAt={game.timerEndsAt}
            onTimerEnd={onTimerEnd}
          />
        ) : null
      break
    case 'answer':
      content =
        round && location ? (
          <AnswerScreen round={round} location={location} revealSoundUrl={quiz.sounds.reveal} playSounds={playSounds} />
        ) : null
      break
    case 'casino-bets':
      content = round && location ? <BetsScreen round={round} location={location} game={game} /> : null
      break
    case 'end':
      content = <EndScreen teams={game.teams} />
      break
  }

  const showStrip = round && ['question', 'answer'].includes(game.currentScreen)

  return (
    <div className="relative flex-1 w-full h-full overflow-hidden">
      <div className="absolute inset-0 scale-105" style={backgroundStyle(background)} />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0c0a22]/55 via-[#0c0a22]/70 to-[#0c0a22]/90" />
      <div className="relative z-10 h-full w-full flex flex-col">
        <div className="flex-1 min-h-0 flex">{content}</div>
        {showStrip && round && <TeamStrip round={round} game={game} />}
        {footer}
      </div>
    </div>
  )
}
