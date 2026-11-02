import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AnswerResult, GameScreen, Team, TrickChoice } from '../types/quiz'
import { createGameChannel } from '../lib/broadcast'

export type GameState = {
  quizId: string | null
  roomId: string | null
  teams: Team[]
  playedQuestionIds: string[]
  currentScreen: GameScreen
  currentRoundId: string | null
  currentQuestionId: string | null
  timerDuration: number
  timerEndsAt: number | null
  timerRunning: boolean

  /** Раунд 1: индекс команды, которая сейчас отвечает (null — все промахнулись) */
  activeTeamIndex: number | null
  /** Раунд 1: с какой команды начнётся следующий трек */
  nextTurnIndex: number
  /** Раунд 1: сколько команд уже пробовали ответить на текущий трек */
  attempts: number

  /** Сладость/гадость текущего вопроса по командам */
  choices: Record<string, TrickChoice>
  /** Исход текущего вопроса по командам (раунды 2 и 3) */
  results: Record<string, AnswerResult>
  /** Ставки «Казино» */
  bets: Record<string, number>
  /** Баллы за текущий вопрос уже начислены */
  scored: boolean
  /** Сколько баллов получила каждая команда за текущий вопрос — для показа на табло и отмены */
  lastDeltas: Record<string, number>
}

type GameActions = {
  startGame: (quizId: string, roomId: string | null, teamNames: string[], defaultTimerSeconds: number) => void
  setScreen: (screen: GameScreen, opts?: { roundId?: string | null; questionId?: string | null }) => void
  update: (patch: Partial<GameState>) => void
  markQuestionPlayed: (questionId: string) => void
  adjustScore: (teamId: string, delta: number) => void
  /** Начислить пачку баллов за вопрос (запоминается в lastDeltas) */
  applyDeltas: (deltas: Record<string, number>) => void
  /** Откатить последнее начисление за вопрос */
  revertDeltas: () => void
  startTimer: (seconds?: number) => void
  stopTimer: () => void
  resetTimer: (seconds?: number) => void
}

export type GameStore = GameState & GameActions

export const perQuestionReset: Pick<GameState, 'choices' | 'results' | 'scored' | 'lastDeltas'> = {
  choices: {},
  results: {},
  scored: false,
  lastDeltas: {},
}

const initialState: GameState = {
  quizId: null,
  roomId: null,
  teams: [],
  playedQuestionIds: [],
  currentScreen: 'intro',
  currentRoundId: null,
  currentQuestionId: null,
  timerDuration: 30,
  timerEndsAt: null,
  timerRunning: false,
  activeTeamIndex: null,
  nextTurnIndex: 0,
  attempts: 0,
  bets: {},
  ...perQuestionReset,
}

const STATE_KEYS = Object.keys(initialState) as (keyof GameState)[]

function extractState(state: GameStore): GameState {
  const result: Record<string, unknown> = {}
  for (const key of STATE_KEYS) result[key] = state[key]
  return result as GameState
}

function addScores(teams: Team[], deltas: Record<string, number>, sign: 1 | -1) {
  return teams.map((t) => (deltas[t.id] ? { ...t, score: t.score + sign * deltas[t.id] } : t))
}

export const useGameStore = create<GameStore>()(
  persist(
    (set) => ({
      ...initialState,

      startGame: (quizId, roomId, teamNames, defaultTimerSeconds) =>
        set({
          ...initialState,
          quizId,
          roomId,
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

      update: (patch) => set(patch),

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

      applyDeltas: (deltas) =>
        set((state) => {
          if (state.scored) return {}
          return { teams: addScores(state.teams, deltas, 1), lastDeltas: deltas, scored: true }
        }),

      revertDeltas: () =>
        set((state) => {
          if (!state.scored) return {}
          return { teams: addScores(state.teams, state.lastDeltas, -1), lastDeltas: {}, scored: false }
        }),

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
    { name: 'quiz-game-progress', version: 2, migrate: () => initialState as GameStore },
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
