export type MediaType = 'image' | 'audio' | 'video' | 'youtube' | 'embed'

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
  /** Номинал (вес) вопроса, 1–5. Если не задан — порядковый номер в теме. */
  price?: number
  text: string
  media?: Media
  answerText?: string
  answerMedia?: Media
  /** Раунд 1 (music): кто из гостей загадал трек */
  author?: string
  background?: string
  sound?: string
}

export type Category = {
  id: string
  title: string
  questions: Question[]
}

/**
 * music        — Раунд 1: угадать музыку друг друга, команды отвечают по очереди
 * trickOrTreat — Раунды 2.1 / 2.2: перед каждым вопросом команды выбирают «Сладость» или «Гадость»
 * casino       — Финал: вопросы по темам по очереди, перед каждым команды ставят баллы
 */
export type RoundType = 'music' | 'trickOrTreat' | 'casino'

/** Множители номинала вопроса за исход в раунде «Сладость или гадость». Итог = множитель × номинал. */
export type TrickScoring = {
  sweetCorrect: number
  sweetWrong: number
  sweetEmpty: number
  trickCorrect: number
  trickWrong: number
  trickEmpty: number
}

export type Round = {
  id: string
  title: string
  type: RoundType
  /** Если задано — раунд играется только в этой комнате. Пусто — во всех комнатах. */
  roomId?: string
  rulesText?: string
  background?: string
  /** Свой таймер раунда, сек (иначе defaultTimerSeconds квиза) */
  timerSeconds?: number
  /** Только для trickOrTreat */
  scoring?: TrickScoring
  categories: Category[]
}

/** Комната — отдельная игра со своим наполнением части раундов (например, свои треки в Раунде 1). */
export type Room = {
  id: string
  title: string
  subtitle?: string
  background?: string
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
  rooms: Room[]
  rounds: Round[]
}

export type Team = {
  id: string
  name: string
  score: number
}

export type GameScreen =
  | 'intro'
  | 'rules'
  | 'board'
  /** trickOrTreat: команды выбирают «Сладость»/«Гадость» перед вопросом */
  | 'choose'
  | 'question'
  | 'answer'
  /** casino (финал): команды делают ставки перед каждым вопросом */
  | 'casino-bets'
  | 'end'

export type TrickChoice = 'sweet' | 'trick'
export type AnswerResult = 'correct' | 'wrong' | 'empty'
