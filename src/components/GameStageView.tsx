import type { ReactNode } from 'react'
import type { Quiz } from '../types/quiz'
import type { GameState } from '../stores/gameStore'
import { IntroScreen } from './intro/IntroScreen'
import { RulesScreen } from './rules/RulesScreen'
import { Board } from './board/Board'
import { QuestionScreen } from './question/QuestionScreen'
import { AnswerScreen } from './answer/AnswerScreen'
import { EndScreen } from './scoreboard/EndScreen'
import { findQuestionLocation } from '../lib/gameLogic'
import { backgroundStyle, resolveBackground } from '../lib/theme'

type Props = {
  quiz: Quiz
  game: GameState
  playSounds: boolean
  interactiveBoard?: boolean
  onSelectQuestion?: (questionId: string) => void
  onTimerEnd?: () => void
}

export function GameStageView({
  quiz,
  game,
  playSounds,
  interactiveBoard = false,
  onSelectQuestion,
  onTimerEnd,
}: Props) {
  const round = quiz.rounds.find((r) => r.id === game.currentRoundId) ?? null
  const location = game.currentQuestionId ? findQuestionLocation(quiz, game.currentQuestionId) : null

  const background = resolveBackground([quiz.theme.background, round?.background, location?.question.background])

  let content: ReactNode = null
  switch (game.currentScreen) {
    case 'intro':
      content = <IntroScreen title={quiz.title} />
      break
    case 'rules':
      content = round ? <RulesScreen round={round} /> : null
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
    case 'question':
      content =
        round && location ? (
          <QuestionScreen
            round={round}
            question={location.question}
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
          <AnswerScreen
            round={round}
            question={location.question}
            revealSoundUrl={quiz.sounds.reveal}
            playSounds={playSounds}
          />
        ) : null
      break
    case 'end':
      content = <EndScreen teams={game.teams} />
      break
  }

  return (
    <div className="flex-1 w-full h-full flex" style={backgroundStyle(background)}>
      {content}
    </div>
  )
}
