import { useEffect } from 'react'
import type { Round, Question } from '../../types/quiz'
import { MediaRenderer } from '../question/MediaRenderer'
import { playSound } from '../../lib/sound'

type Props = {
  round: Round
  question: Question
  revealSoundUrl?: string
  playSounds: boolean
}

export function AnswerScreen({ round, question, revealSoundUrl, playSounds }: Props) {
  useEffect(() => {
    if (playSounds) playSound(revealSoundUrl)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question.id])

  return (
    <div className="flex flex-col items-center justify-center h-full gap-8 px-12 text-center">
      <div className="text-xl md:text-2xl font-semibold text-quiz-accent uppercase tracking-wide">Ответ</div>
      <p className="text-2xl md:text-3xl font-medium max-w-4xl text-quiz-primary/80">{question.text}</p>

      {round.type === 'choice' && question.options ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-3xl">
          {question.options.map((opt, i) => {
            const isCorrect = i === question.correctOptionIndex
            return (
              <div
                key={i}
                className={`rounded-xl border-2 py-4 px-6 text-xl font-semibold transition-colors ${
                  isCorrect
                    ? 'border-green-400 bg-green-500/30 text-white'
                    : 'border-quiz-accent/40 bg-quiz-primary/5 opacity-70'
                }`}
              >
                {String.fromCharCode(65 + i)}. {opt}
              </div>
            )
          })}
        </div>
      ) : (
        <p className="text-4xl md:text-6xl font-black max-w-5xl leading-snug">{question.answerText}</p>
      )}

      {question.answerMedia && <MediaRenderer media={question.answerMedia} />}
    </div>
  )
}
