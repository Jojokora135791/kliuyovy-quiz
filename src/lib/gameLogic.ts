import type { AnswerResult, Quiz, Round, Question, Team, TrickChoice, TrickScoring } from '../types/quiz'

export const DEFAULT_TRICK_SCORING: TrickScoring = {
  sweetCorrect: 1,
  sweetWrong: 0,
  sweetEmpty: 0,
  trickCorrect: 3,
  trickWrong: -2,
  trickEmpty: -1,
}

/** Раунд 1: сколько баллов за угаданного автора и за угаданный трек */
export const MUSIC_POINTS = { author: 1, track: 1 } as const

export const ROUND_TYPE_LABELS: Record<Round['type'], string> = {
  music: 'Угадай музыку друга',
  trickOrTreat: 'Сладость или гадость',
  casino: 'Финал · ставки',
}

/** Раунды, которые играются в выбранной комнате, в порядке квиза. */
export function getRoomRounds(quiz: Quiz, roomId: string | null | undefined): Round[] {
  return quiz.rounds.filter((r) => !r.roomId || r.roomId === roomId)
}

export function getFlatQuestions(round: Round): Question[] {
  return round.categories.flatMap((c) => c.questions)
}

export function isRoundComplete(round: Round, playedIds: string[]) {
  const questions = getFlatQuestions(round)
  return questions.length > 0 && questions.every((q) => playedIds.includes(q.id))
}

export function getNextRound(quiz: Quiz, roomId: string | null, roundId: string | null | undefined): Round | null {
  const rounds = getRoomRounds(quiz, roomId)
  const idx = roundId ? rounds.findIndex((r) => r.id === roundId) : -1
  return rounds[idx + 1] ?? null
}

export type QuestionLocation = { round: Round; categoryTitle: string; index: number; question: Question }

/** Номинал вопроса: явный price или порядковый номер в теме. */
export function questionNominal(question: Question, index: number) {
  return question.price ?? index + 1
}

export function nominalLabel(n: number) {
  const mod10 = n % 10
  const mod100 = n % 100
  const word = mod10 === 1 && mod100 !== 11 ? 'балл' : mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14) ? 'балла' : 'баллов'
  return `${n} ${word}`
}

export function findQuestionLocation(quiz: Quiz, questionId: string): QuestionLocation | null {
  for (const round of quiz.rounds) {
    for (const category of round.categories) {
      const index = category.questions.findIndex((q) => q.id === questionId)
      if (index >= 0) return { round, categoryTitle: category.title, index, question: category.questions[index] }
    }
  }
  return null
}

export function trickMultiplier(scoring: TrickScoring, choice: TrickChoice, result: AnswerResult): number {
  const key = `${choice}${result[0].toUpperCase()}${result.slice(1)}` as keyof TrickScoring
  return scoring[key]
}

/** Баллы за исход: множитель режима × номинал вопроса. */
export function trickDelta(scoring: TrickScoring, choice: TrickChoice, result: AnswerResult, nominal: number): number {
  return trickMultiplier(scoring, choice, result) * nominal
}

export function computeTrickDeltas(
  round: Round,
  nominal: number,
  teams: Team[],
  choices: Record<string, TrickChoice>,
  results: Record<string, AnswerResult>,
): Record<string, number> {
  const scoring = round.scoring ?? DEFAULT_TRICK_SCORING
  return Object.fromEntries(
    teams.map((t) => [t.id, trickDelta(scoring, choices[t.id] ?? 'sweet', results[t.id] ?? 'empty', nominal)]),
  )
}

export function computeCasinoDeltas(
  teams: Team[],
  bets: Record<string, number>,
  results: Record<string, AnswerResult>,
): Record<string, number> {
  return Object.fromEntries(
    teams.map((t) => {
      const bet = bets[t.id] ?? 0
      return [t.id, results[t.id] === 'correct' ? bet : -bet]
    }),
  )
}


export function formatDelta(n: number) {
  return n > 0 ? `+${n}` : n < 0 ? `−${Math.abs(n)}` : '0'
}

/** Множитель для таблицы правил: «×3», «−×2», «0». */
export function formatMultiplier(m: number) {
  if (m === 0) return '0'
  return `${m < 0 ? '−' : '+'}${Math.abs(m) === 1 ? '' : `${Math.abs(m)} × `}номинал`
}
