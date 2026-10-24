import { useCallback } from 'react'
import type { Quiz } from '../types/quiz'
import { useGameStore } from '../stores/gameStore'
import { isRoundComplete, getNextRound, getNextSequentialQuestion } from './gameLogic'

export function useGameController(quiz: Quiz | null) {
  const game = useGameStore()

  const openQuestion = useCallback(
    (questionId: string) => {
      game.markQuestionPlayed(questionId)
      game.setScreen('question', { questionId })
    },
    [game],
  )

  const showAnswer = useCallback(() => game.setScreen('answer'), [game])

  const backToBoard = useCallback(() => {
    const round = quiz?.rounds.find((r) => r.id === game.currentRoundId)
    if (round && round.type !== 'final' && game.currentScreen !== 'board') {
      game.setScreen('board', { questionId: null })
    }
  }, [quiz, game])

  const advance = useCallback(() => {
    if (!quiz) return
    switch (game.currentScreen) {
      case 'intro': {
        const first = quiz.rounds[0]
        if (first) game.setScreen('rules', { roundId: first.id, questionId: null })
        break
      }
      case 'rules': {
        const round = quiz.rounds.find((r) => r.id === game.currentRoundId)
        if (!round) break
        if (round.type === 'final') {
          const q = getNextSequentialQuestion(round, null)
          if (q) openQuestion(q.id)
        } else {
          game.setScreen('board')
        }
        break
      }
      case 'board': {
        const round = quiz.rounds.find((r) => r.id === game.currentRoundId)
        if (round && isRoundComplete(round, game.playedQuestionIds)) {
          const next = getNextRound(quiz, round.id)
          if (next) game.setScreen('rules', { roundId: next.id, questionId: null })
          else game.setScreen('end', { roundId: null, questionId: null })
        }
        break
      }
      case 'question':
        showAnswer()
        break
      case 'answer': {
        const round = quiz.rounds.find((r) => r.id === game.currentRoundId)
        if (round?.type === 'final') {
          const next = getNextSequentialQuestion(round, game.currentQuestionId)
          if (next) openQuestion(next.id)
          else game.setScreen('end', { roundId: null, questionId: null })
        } else {
          game.setScreen('board', { questionId: null })
        }
        break
      }
      default:
        break
    }
  }, [quiz, game, openQuestion, showAnswer])

  return { game, openQuestion, showAnswer, backToBoard, advance }
}
