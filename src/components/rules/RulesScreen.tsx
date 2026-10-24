import type { Round } from '../../types/quiz'

export function RulesScreen({ round }: { round: Round }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-8 px-16 text-center">
      <h2 className="font-heading text-4xl md:text-6xl font-black uppercase tracking-wide text-quiz-primary">
        {round.title}
      </h2>
      {round.rulesText && (
        <p className="text-xl md:text-3xl max-w-4xl whitespace-pre-line leading-relaxed">{round.rulesText}</p>
      )}
    </div>
  )
}
