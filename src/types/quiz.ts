export type MediaType = 'image' | 'audio' | 'video' | 'youtube'

export type Media = {
  type: MediaType
  url: string
  /** только для type: 'youtube', секунды */
  youtubeStart?: number
  youtubeEnd?: number
}

export type Theme = {
  background?: string
  fontFamily?: string
  primaryColor?: string
  accentColor?: string
}

export type Question = {
  id: string
  /** цена клетки; порядковый номер для warmup/final */
  price: number
  text: string
  media?: Media
  /** варианты ответа — только для раунда типа "choice" */
  options?: string[]
  correctOptionIndex?: number
  answerText?: string
  answerMedia?: Media
  background?: string
  sound?: string
}

export type Category = {
  id: string
  title: string
  questions: Question[]
}

export type RoundType = 'jeopardy' | 'warmup' | 'choice' | 'final'

export type Round = {
  id: string
  title: string
  rulesText?: string
  type: RoundType
  /** шкала цен для jeopardy, напр. [1,2,3,4,5] */
  priceScale?: number[]
  background?: string
  categories: Category[]
}

export type QuizSounds = {
  open?: string
  reveal?: string
  timerEnd?: string
}

export type Quiz = {
  id: string
  title: string
  theme: Theme
  defaultTimerSeconds: number
  sounds: QuizSounds
  rounds: Round[]
}

export type Team = {
  id: string
  name: string
  score: number
}

export type GameScreen = 'intro' | 'rules' | 'board' | 'question' | 'answer' | 'end'

export type GameProgress = {
  teams: Team[]
  playedQuestionIds: string[]
  currentScreen: GameScreen
  currentRoundId?: string
  currentQuestionId?: string
  timerRunning: boolean
  timerEndsAt?: number
}
