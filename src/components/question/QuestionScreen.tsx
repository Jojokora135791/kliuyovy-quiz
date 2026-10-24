import { useEffect } from 'react'
import type { Round, Question } from '../../types/quiz'
import { MediaRenderer } from './MediaRenderer'
import { playSound } from '../../lib/sound'
import { useCountdown } from '../../lib/useCountdown'

type Props = {
  round: Round
  question: Question
  openSoundUrl?: string
  timerEndSoundUrl?: string
  playSounds: boolean
  timerRunning: boolean
  timerEndsAt: number | null
  onTimerEnd?: () => void
}

export function QuestionScreen({
  round,
  question,
  openSoundUrl,
  timerEndSoundUrl,
  playSounds,
  timerRunning,
  timerEndsAt,
  onTimerEnd,
}: Props) {
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
    <div className="flex flex-col items-center justify-center h-full gap-8 px-12 text-center">
      <div className="text-xl md:text-2xl font-semibold text-quiz-accent uppercase tracking-wide">
        {round.title} · {question.price}
      </div>
      {remaining !== null && (
        <div className={`text-6xl font-black ${remaining <= 5 ? 'text-red-500 animate-pulse' : 'text-quiz-primary'}`}>
          {remaining}
        </div>
      )}
      <p className="text-3xl md:text-5xl font-bold max-w-5xl leading-snug">{question.text}</p>
      {question.media && <MediaRenderer media={question.media} />}
      {round.type === 'choice' && question.options && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-3xl">
          {question.options.map((opt, i) => (
            <div
              key={i}
              className="rounded-xl border-2 border-quiz-accent/60 py-4 px-6 text-xl font-semibold bg-quiz-primary/10"
            >
              {String.fromCharCode(65 + i)}. {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
