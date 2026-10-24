import { create } from 'zustand'
import type { Quiz } from '../types/quiz'
import { loadJSON, saveJSON } from '../lib/persist'

export type QuizListEntry = { id: string; title: string; file: string }

type QuizState = {
  quizList: QuizListEntry[]
  quiz: Quiz | null
  loading: boolean
  error: string | null
}

type QuizActions = {
  loadQuizList: () => Promise<void>
  selectQuiz: (file: string) => Promise<void>
  setQuiz: (quiz: Quiz) => void
}

const ACTIVE_QUIZ_KEY = 'active-quiz-file'

export const useQuizStore = create<QuizState & QuizActions>((set, get) => ({
  quizList: [],
  quiz: null,
  loading: false,
  error: null,

  loadQuizList: async () => {
    set({ loading: true, error: null })
    try {
      const res = await fetch('/quizzes/index.json')
      if (!res.ok) throw new Error(`Не удалось загрузить список квизов (${res.status})`)
      const quizList = (await res.json()) as QuizListEntry[]
      set({ quizList })
      const savedFile = loadJSON<string>(ACTIVE_QUIZ_KEY)
      const fileToLoad = savedFile && quizList.some((q) => q.file === savedFile) ? savedFile : quizList[0]?.file
      if (fileToLoad) {
        await get().selectQuiz(fileToLoad)
      } else {
        set({ loading: false })
      }
    } catch (e) {
      set({ loading: false, error: e instanceof Error ? e.message : 'Неизвестная ошибка' })
    }
  },

  selectQuiz: async (file: string) => {
    set({ loading: true, error: null })
    try {
      const res = await fetch(file)
      if (!res.ok) throw new Error(`Не удалось загрузить квиз (${res.status})`)
      const quiz = (await res.json()) as Quiz
      saveJSON(ACTIVE_QUIZ_KEY, file)
      set({ quiz, loading: false })
    } catch (e) {
      set({ loading: false, error: e instanceof Error ? e.message : 'Неизвестная ошибка' })
    }
  },

  setQuiz: (quiz: Quiz) => set({ quiz }),
}))
