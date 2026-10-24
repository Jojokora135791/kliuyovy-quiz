import type { Quiz, Round, Question } from '../types/quiz'

export function getFlatQuestions(round: Round): Question[] {
  return round.categories.flatMap((c) => c.questions)
}

export function isRoundComplete(round: Round, playedIds: string[]) {
  const questions = getFlatQuestions(round)
  return questions.length > 0 && questions.every((q) => playedIds.includes(q.id))
}

export function getRoundIndex(quiz: Quiz, roundId: string | null | undefined) {
  if (!roundId) return -1
  return quiz.rounds.findIndex((r) => r.id === roundId)
}

export function getNextRound(quiz: Quiz, roundId: string | null | undefined): Round | null {
  const idx = getRoundIndex(quiz, roundId)
  return quiz.rounds[idx + 1] ?? null
}

export type QuestionLocation = { round: Round; question: Question }

export function findQuestionLocation(quiz: Quiz, questionId: string): QuestionLocation | null {
  for (const round of quiz.rounds) {
    for (const category of round.categories) {
      const question = category.questions.find((q) => q.id === questionId)
      if (question) return { round, question }
    }
  }
  return null
}

/** Вопросы раунда "финал" (и опорный порядок для "разминки") — по возрастанию price. */
export function getOrderedQuestions(round: Round): Question[] {
  return [...getFlatQuestions(round)].sort((a, b) => a.price - b.price)
}

export function getNextSequentialQuestion(round: Round, currentQuestionId: string | null | undefined): Question | null {
  const list = getOrderedQuestions(round)
  if (!currentQuestionId) return list[0] ?? null
  const idx = list.findIndex((q) => q.id === currentQuestionId)
  return list[idx + 1] ?? null
}
