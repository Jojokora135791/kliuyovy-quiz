import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { GameScreen, Team } from '../types/quiz'
import { createGameChannel } from '../lib/broadcast'

export type GameState = {
  quizId: string | null
  teams: Team[]
  playedQuestionIds: string[]
  currentScreen: GameScreen
  currentRoundId: string | null
  currentQuestionId: string | null
  timerDuration: number
  timerEndsAt: number | null
  timerRunning: boolean
}

type GameActions = {
  startGame: (quizId: string, teamNames: string[], defaultTimerSeconds: number) => void
  setScreen: (screen: GameScreen, opts?: { roundId?: string | null; questionId?: string | null }) => void
  markQuestionPlayed: (questionId: string) => void
  adjustScore: (teamId: string, delta: number) => void
  startTimer: (seconds?: number) => void
  stopTimer: () => void
  resetTimer: (seconds?: number) => void
}

export type GameStore = GameState & GameActions

const STATE_KEYS: (keyof GameState)[] = [
  'quizId',
  'teams',
  'playedQuestionIds',
  'currentScreen',
  'currentRoundId',
  'currentQuestionId',
  'timerDuration',
  'timerEndsAt',
  'timerRunning',
]

function extractState(state: GameStore): GameState {
  const result = {} as GameState
  for (const key of STATE_KEYS) {
    // @ts-expect-error — собираем только поля состояния, без экшенов
    result[key] = state[key]
  }
  return result
}

const initialState: GameState = {
  quizId: null,
  teams: [],
  playedQuestionIds: [],
  currentScreen: 'intro',
  currentRoundId: null,
  currentQuestionId: null,
  timerDuration: 30,
  timerEndsAt: null,
  timerRunning: false,
}

export const useGameStore = create<GameStore>()(
  persist(
    (set) => ({
      ...initialState,

      startGame: (quizId, teamNames, defaultTimerSeconds) =>
        set({
          ...initialState,
          quizId,
          teams: teamNames.map((name, i) => ({ id: `team-${i}`, name, score: 0 })),
          timerDuration: defaultTimerSeconds,
        }),

      setScreen: (screen, opts) =>
        set((state) => ({
          currentScreen: screen,
          currentRoundId: opts && 'roundId' in opts ? opts.roundId ?? null : state.currentRoundId,
          currentQuestionId: opts && 'questionId' in opts ? opts.questionId ?? null : state.currentQuestionId,
          timerRunning: false,
          timerEndsAt: null,
        })),

      markQuestionPlayed: (questionId) =>
        set((state) => ({
          playedQuestionIds: state.playedQuestionIds.includes(questionId)
            ? state.playedQuestionIds
            : [...state.playedQuestionIds, questionId],
        })),

      adjustScore: (teamId, delta) =>
        set((state) => ({
          teams: state.teams.map((t) => (t.id === teamId ? { ...t, score: t.score + delta } : t)),
        })),

      startTimer: (seconds) =>
        set((state) => {
          const duration = seconds ?? state.timerDuration
          return { timerRunning: true, timerEndsAt: Date.now() + duration * 1000 }
        }),

      stopTimer: () => set({ timerRunning: false }),

      resetTimer: (seconds) =>
        set((state) => ({
          timerRunning: false,
          timerEndsAt: null,
          timerDuration: seconds ?? state.timerDuration,
        })),
    }),
    { name: 'quiz-game-progress' },
  ),
)

// --- межвкладочная синхронизация host (/host) ↔ табло (/), без бэкенда ---
let applyingRemote = false

const channel = createGameChannel((data) => {
  applyingRemote = true
  useGameStore.setState(data as Partial<GameState>)
  applyingRemote = false
})

useGameStore.subscribe((state) => {
  if (applyingRemote) return
  channel.post(extractState(state))
})
