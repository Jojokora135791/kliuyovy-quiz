import { useEffect } from 'react'
import { useQuizStore } from '../stores/quizStore'
import { applyQuizTheme } from './theme'

export function useLoadedQuiz() {
  const quiz = useQuizStore((s) => s.quiz)
  const loading = useQuizStore((s) => s.loading)
  const error = useQuizStore((s) => s.error)
  const loadQuizList = useQuizStore((s) => s.loadQuizList)

  useEffect(() => {
    loadQuizList()
  }, [loadQuizList])

  useEffect(() => {
    if (quiz) applyQuizTheme(quiz.theme)
  }, [quiz])

  return { quiz, loading, error }
}
