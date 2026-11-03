import { useCallback } from 'react'
import type { AnswerResult, Quiz, TrickChoice } from '../types/quiz'
import { perQuestionReset, useGameStore } from '../stores/gameStore'
import {
  MUSIC_POINTS,
  computeCasinoDeltas,
  computeTrickDeltas,
  findQuestionLocation,
  getNextRound,
  getRoomRounds,
  getFlatQuestions,
  isRoundComplete,
  questionNominal,
} from './gameLogic'

/** Вся логика переходов и начисления баллов. Вызывается только со страницы ведущего. */
export function useGameController(quiz: Quiz | null) {
  const game = useGameStore()
  const round = quiz?.rounds.find((r) => r.id === game.currentRoundId) ?? null

  const roundTimer = useCallback(
    () => round?.timerSeconds ?? quiz?.defaultTimerSeconds ?? 30,
    [round, quiz],
  )

  const goToNextRound = useCallback(() => {
    if (!quiz) return
    const next = getNextRound(quiz, game.roomId, game.currentRoundId)
    if (next) {
      game.update({ ...perQuestionReset, bets: {}, activeTeamIndex: null, attempts: 0 })
      game.setScreen('rules', { roundId: next.id, questionId: null })
    } else {
      game.setScreen('end', { roundId: null, questionId: null })
    }
  }, [quiz, game])

  const openQuestion = useCallback(
    (questionId: string) => {
      if (!round) return
      game.markQuestionPlayed(questionId)
      game.resetTimer(roundTimer())
      game.update(perQuestionReset)
      const n = game.teams.length
      switch (round.type) {
        case 'music': {
          const active = n ? game.nextTurnIndex % n : null
          game.update({ activeTeamIndex: active, nextTurnIndex: (active ?? 0) + 1, attempts: 1 })
          game.setScreen('question', { questionId })
          break
        }
        case 'trickOrTreat':
          game.setScreen('choose', { questionId })
          break
        case 'casino':
          game.setScreen('question', { questionId })
          break
      }
    },
    [round, game, roundTimer],
  )

  const showAnswer = useCallback(() => game.setScreen('answer'), [game])

  /** Финал: следующий несыгранный вопрос по порядку тем. */
  const nextCasinoQuestion = useCallback(() => {
    if (!round || round.type !== 'casino') return null
    return getFlatQuestions(round).find((q) => !game.playedQuestionIds.includes(q.id)) ?? null
  }, [round, game.playedQuestionIds])

  /** Финал: экран ставок перед вопросом — ставки обнуляются, тема вопроса уже известна. */
  const openCasinoBets = useCallback(
    (questionId: string) => {
      game.update({ ...perQuestionReset, bets: {} })
      game.setScreen('casino-bets', { questionId })
    },
    [game],
  )

  const backToBoard = useCallback(() => {
    if (!round || round.type === 'casino') return
    if (['choose', 'question', 'answer'].includes(game.currentScreen)) {
      game.setScreen('board', { questionId: null })
    }
  }, [round, game])

  /** Вернуться к слайду правил текущего раунда. Сыгранные вопросы сохраняются. */
  const backToRules = useCallback(() => {
    if (round && ['board', 'casino-bets'].includes(game.currentScreen)) {
      game.setScreen('rules', { questionId: null })
    }
  }, [round, game])

  // --- Раунд 1: музыка ---
  const awardMusic = useCallback(
    (kind: keyof typeof MUSIC_POINTS) => {
      if (game.activeTeamIndex === null) return
      const team = game.teams[game.activeTeamIndex]
      if (!team) return
      const points = MUSIC_POINTS[kind]
      game.adjustScore(team.id, points)
      game.update({ lastDeltas: { ...game.lastDeltas, [team.id]: (game.lastDeltas[team.id] ?? 0) + points } })
    },
    [game],
  )

  /** Команда не угадала — ход переходит следующей. Когда попробовали все — никто не отвечает. */
  const passTurn = useCallback(() => {
    const n = game.teams.length
    if (game.activeTeamIndex === null || n === 0) return
    if (game.attempts >= n) {
      game.update({ activeTeamIndex: null })
    } else {
      game.update({ activeTeamIndex: (game.activeTeamIndex + 1) % n, attempts: game.attempts + 1 })
    }
  }, [game])

  // --- Раунды 2.x: сладость или гадость ---
  const setChoice = useCallback(
    (teamId: string, choice: TrickChoice) => game.update({ choices: { ...game.choices, [teamId]: choice } }),
    [game],
  )

  const setResult = useCallback(
    (teamId: string, result: AnswerResult) => {
      if (game.scored) return
      game.update({ results: { ...game.results, [teamId]: result } })
    },
    [game],
  )

  const score = useCallback(() => {
    if (!round || game.scored) return
    if (round.type === 'trickOrTreat') {
      const loc = quiz && game.currentQuestionId ? findQuestionLocation(quiz, game.currentQuestionId) : null
      if (!loc) return
      const nominal = questionNominal(loc.question, loc.index)
      game.applyDeltas(computeTrickDeltas(round, nominal, game.teams, game.choices, game.results))
    } else if (round.type === 'casino') {
      game.applyDeltas(computeCasinoDeltas(game.teams, game.bets, game.results))
    }
  }, [quiz, round, game])

  const unscore = useCallback(() => game.revertDeltas(), [game])

  // --- Финал: ставки ---
  /** Ставка — любое неотрицательное целое, без верхнего предела. */
  const setBet = useCallback(
    (teamId: string, value: number) => {
      const bet = Math.max(0, Math.round(value) || 0)
      game.update({ bets: { ...game.bets, [teamId]: bet } })
    },
    [game],
  )

  const advance = useCallback(() => {
    if (!quiz) return
    switch (game.currentScreen) {
      case 'intro': {
        const first = getRoomRounds(quiz, game.roomId)[0]
        if (first) game.setScreen('rules', { roundId: first.id, questionId: null })
        else game.setScreen('end')
        break
      }
      case 'rules': {
        if (!round) break
        if (round.type !== 'casino') {
          game.setScreen('board')
          break
        }
        const q = nextCasinoQuestion()
        if (q) openCasinoBets(q.id)
        else goToNextRound()
        break
      }
      case 'board':
        if (round && isRoundComplete(round, game.playedQuestionIds)) goToNextRound()
        break
      case 'choose':
        game.setScreen('question')
        break
      case 'question':
        showAnswer()
        break
      case 'answer':
        if (!round) break
        if (round.type === 'music') {
          game.setScreen('board', { questionId: null })
        } else if (!game.scored) {
          score()
        } else if (round.type === 'casino') {
          const q = nextCasinoQuestion()
          if (q) openCasinoBets(q.id)
          else goToNextRound()
        } else {
          game.setScreen('board', { questionId: null })
        }
        break
      case 'casino-bets':
        if (game.currentQuestionId) openQuestion(game.currentQuestionId)
        break
      default:
        break
    }
  }, [quiz, round, game, goToNextRound, openQuestion, showAnswer, score, nextCasinoQuestion, openCasinoBets])

  /** Подпись для главной кнопки — чтобы ведущий видел, что произойдёт по Space. */
  function advanceLabel(): string {
    switch (game.currentScreen) {
      case 'intro':
        return 'Начать'
      case 'rules':
        return round?.type === 'casino' ? 'К ставкам' : 'К доске'
      case 'board':
        return round && isRoundComplete(round, game.playedQuestionIds) ? 'Следующий раунд' : 'Выбери вопрос на доске'
      case 'choose':
        return 'Показать вопрос'
      case 'question':
        return 'Показать ответ'
      case 'answer':
        if (round?.type === 'music') return 'К доске'
        if (!game.scored) return 'Засчитать баллы'
        return round?.type === 'casino' ? (nextCasinoQuestion() ? 'К следующим ставкам' : 'Итоги') : 'К доске'
      case 'casino-bets':
        return 'Показать вопрос'
      default:
        return 'Дальше'
    }
  }

  return {
    game,
    round,
    openQuestion,
    showAnswer,
    backToBoard,
    backToRules,
    advance,
    advanceLabel: advanceLabel(),
    awardMusic,
    passTurn,
    setChoice,
    setResult,
    score,
    unscore,
    setBet,
  }
}
