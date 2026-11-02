import { useEffect } from 'react'
import type { Round } from '../../types/quiz'
import { nominalLabel, questionNominal, type QuestionLocation } from '../../lib/gameLogic'
import { MediaRenderer } from './MediaRenderer'
import { playSound } from '../../lib/sound'
import { useCountdown } from '../../lib/useCountdown'

type Props = {
  round: Round
  location: QuestionLocation
  openSoundUrl?: string
  timerEndSoundUrl?: string
  playSounds: boolean
  timerRunning: boolean
  timerEndsAt: number | null
  onTimerEnd?: () => void
}

export function questionEyebrow(round: Round, location: QuestionLocation) {
  if (round.type === 'music') return `Трек ${location.index + 1}`
  if (round.type === 'casino') return `🎰 ${location.categoryTitle}`
  return `${location.categoryTitle} · ${nominalLabel(questionNominal(location.question, location.index))}`
}

export function QuestionScreen({
  round,
  location,
  openSoundUrl,
  timerEndSoundUrl,
  playSounds,
  timerRunning,
  timerEndsAt,
  onTimerEnd,
}: Props) {
  const { question } = location
  const remaining = useCountdown(timerRunning, timerEndsAt, () => {
    if (playSounds) playSound(timerEndSoundUrl)
    onTimerEnd?.()
  })

  useEffect(() => {
    if (playSounds) playSound(question.sound ?? openSoundUrl)
    // звук открытия/собственный звук вопроса проигрывается один раз при показе
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question.id])

  return (
    <div className="relative flex flex-col items-center justify-center w-full h-full gap-8 px-12 text-center">
      <div className="eyebrow">{questionEyebrow(round, location)}</div>
      {remaining !== null && (
        <div
          className={`absolute top-6 right-8 glass rounded-full w-24 h-24 flex items-center justify-center text-5xl font-black ${
            remaining <= 5 ? 'text-red-400 animate-pulse border-red-400/60' : 'text-quiz-primary'
          }`}
        >
          {remaining}
        </div>
      )}
      {question.text && (
        <p
          className={`font-bold max-w-6xl leading-snug whitespace-pre-line ${
            question.text.length > 220
              ? 'text-[clamp(1.25rem,2.4vw,2.6rem)]'
              : question.text.length > 110
                ? 'text-[clamp(1.5rem,3vw,3.2rem)]'
                : 'text-[clamp(1.875rem,3.6vw,3.75rem)]'
          }`}
        >
          {question.text}
        </p>
      )}
      {question.media && <MediaRenderer media={question.media} />}
    </div>
  )
}
