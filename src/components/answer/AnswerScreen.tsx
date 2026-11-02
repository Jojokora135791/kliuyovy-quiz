import { useEffect } from 'react'
import type { Round } from '../../types/quiz'
import type { QuestionLocation } from '../../lib/gameLogic'
import { MediaRenderer } from '../question/MediaRenderer'
import { questionEyebrow } from '../question/QuestionScreen'
import { playSound } from '../../lib/sound'

type Props = {
  round: Round
  location: QuestionLocation
  revealSoundUrl?: string
  playSounds: boolean
}

export function AnswerScreen({ round, location, revealSoundUrl, playSounds }: Props) {
  const { question } = location
  useEffect(() => {
    if (playSounds) playSound(revealSoundUrl)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question.id])

  return (
    <div className="flex flex-col items-center justify-center w-full h-full gap-6 px-12 text-center">
      <div className="eyebrow">{questionEyebrow(round, location)} · ответ</div>
      {round.type !== 'music' && question.text && (
        <p className="text-xl md:text-2xl font-medium max-w-4xl opacity-70">{question.text}</p>
      )}
      <p className="stage-title text-5xl md:text-7xl max-w-6xl leading-tight">{question.answerText}</p>
      {round.type === 'music' && question.author && (
        <div className="glass rounded-2xl px-8 py-3 text-2xl md:text-3xl">
          Загадал(а): <span className="font-black text-quiz-accent">{question.author}</span>
        </div>
      )}
      {question.answerMedia && <MediaRenderer media={question.answerMedia} />}
    </div>
  )
}
