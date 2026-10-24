import type { Quiz, Round, Category, Question } from '../types/quiz'

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`
}

export function updateQuiz(quiz: Quiz, patch: Partial<Quiz>): Quiz {
  return { ...quiz, ...patch }
}

export function updateTheme(quiz: Quiz, patch: Partial<Quiz['theme']>): Quiz {
  return { ...quiz, theme: { ...quiz.theme, ...patch } }
}

export function updateSounds(quiz: Quiz, patch: Partial<Quiz['sounds']>): Quiz {
  return { ...quiz, sounds: { ...quiz.sounds, ...patch } }
}

export function mapRound(quiz: Quiz, roundId: string, fn: (r: Round) => Round): Quiz {
  return { ...quiz, rounds: quiz.rounds.map((r) => (r.id === roundId ? fn(r) : r)) }
}

export function mapCategory(quiz: Quiz, roundId: string, categoryId: string, fn: (c: Category) => Category): Quiz {
  return mapRound(quiz, roundId, (r) => ({
    ...r,
    categories: r.categories.map((c) => (c.id === categoryId ? fn(c) : c)),
  }))
}

export function mapQuestion(
  quiz: Quiz,
  roundId: string,
  categoryId: string,
  questionId: string,
  fn: (q: Question) => Question,
): Quiz {
  return mapCategory(quiz, roundId, categoryId, (c) => ({
    ...c,
    questions: c.questions.map((q) => (q.id === questionId ? fn(q) : q)),
  }))
}

export function addRound(quiz: Quiz): Quiz {
  const round: Round = {
    id: uid('round'),
    title: 'Новый раунд',
    type: 'jeopardy',
    priceScale: [1, 2, 3, 4, 5],
    categories: [{ id: uid('cat'), title: 'Новая категория', questions: [] }],
  }
  return { ...quiz, rounds: [...quiz.rounds, round] }
}

export function removeRound(quiz: Quiz, roundId: string): Quiz {
  return { ...quiz, rounds: quiz.rounds.filter((r) => r.id !== roundId) }
}

export function moveRound(quiz: Quiz, roundId: string, direction: -1 | 1): Quiz {
  const idx = quiz.rounds.findIndex((r) => r.id === roundId)
  const next = idx + direction
  if (idx < 0 || next < 0 || next >= quiz.rounds.length) return quiz
  const rounds = [...quiz.rounds]
  ;[rounds[idx], rounds[next]] = [rounds[next], rounds[idx]]
  return { ...quiz, rounds }
}

export function addCategory(quiz: Quiz, roundId: string): Quiz {
  return mapRound(quiz, roundId, (r) => ({
    ...r,
    categories: [...r.categories, { id: uid('cat'), title: 'Новая категория', questions: [] }],
  }))
}

export function removeCategory(quiz: Quiz, roundId: string, categoryId: string): Quiz {
  return mapRound(quiz, roundId, (r) => ({ ...r, categories: r.categories.filter((c) => c.id !== categoryId) }))
}

export function moveCategory(quiz: Quiz, roundId: string, categoryId: string, direction: -1 | 1): Quiz {
  return mapRound(quiz, roundId, (r) => {
    const idx = r.categories.findIndex((c) => c.id === categoryId)
    const next = idx + direction
    if (idx < 0 || next < 0 || next >= r.categories.length) return r
    const categories = [...r.categories]
    ;[categories[idx], categories[next]] = [categories[next], categories[idx]]
    return { ...r, categories }
  })
}

export function addQuestion(quiz: Quiz, roundId: string, categoryId: string, price: number): Quiz {
  return mapCategory(quiz, roundId, categoryId, (c) => ({
    ...c,
    questions: [...c.questions, { id: uid('q'), price, text: 'Новый вопрос' }],
  }))
}

export function removeQuestion(quiz: Quiz, roundId: string, categoryId: string, questionId: string): Quiz {
  return mapCategory(quiz, roundId, categoryId, (c) => ({
    ...c,
    questions: c.questions.filter((q) => q.id !== questionId),
  }))
}

export function moveQuestion(
  quiz: Quiz,
  roundId: string,
  categoryId: string,
  questionId: string,
  direction: -1 | 1,
): Quiz {
  return mapCategory(quiz, roundId, categoryId, (c) => {
    const idx = c.questions.findIndex((q) => q.id === questionId)
    const next = idx + direction
    if (idx < 0 || next < 0 || next >= c.questions.length) return c
    const questions = [...c.questions]
    ;[questions[idx], questions[next]] = [questions[next], questions[idx]]
    return { ...c, questions }
  })
}
