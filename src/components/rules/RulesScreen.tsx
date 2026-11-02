import type { Round, Team } from '../../types/quiz'
import { DEFAULT_TRICK_SCORING, MUSIC_POINTS, ROUND_TYPE_LABELS, formatDelta, formatMultiplier } from '../../lib/gameLogic'

export function RulesScreen({ round, teams = [] }: { round: Round; teams?: Team[] }) {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full gap-6 px-16 text-center">
      <div className="eyebrow">{ROUND_TYPE_LABELS[round.type]}</div>
      <h2 className="stage-title text-5xl md:text-7xl leading-tight">{round.title}</h2>
      {round.rulesText && (
        <p className="text-xl md:text-2xl max-w-5xl whitespace-pre-line leading-relaxed">{round.rulesText}</p>
      )}
      {round.type === 'music' && (
        <>
          {teams.length > 0 && (
            <div className="glass rounded-2xl px-6 py-3 text-xl md:text-2xl">
              <span className="opacity-70">Отвечаем по очереди: </span>
              {teams.map((t, i) => (
                <span key={t.id} className="font-bold">
                  {i > 0 && <span className="text-quiz-accent mx-2">→</span>}
                  {t.name}
                </span>
              ))}
            </div>
          )}
          <div className="flex gap-4">
            <ScoreCard title="Угадали, кто загадал" value={formatDelta(MUSIC_POINTS.author)} />
            <ScoreCard title="Угадали трек / исполнителя / напели" value={formatDelta(MUSIC_POINTS.track)} />
          </div>
        </>
      )}
      {round.type === 'trickOrTreat' && <TrickScoringTable round={round} />}
    </div>
  )
}

function ScoreCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="glass rounded-2xl px-6 py-4 min-w-48">
      <div className="text-4xl font-black text-quiz-primary">{value}</div>
      <div className="text-lg opacity-80">{title}</div>
    </div>
  )
}

/**
 * Таблица «Сладость / Гадость».
 * Без nominal — показывает формулы («+3 × номинал»), с nominal — конкретные баллы за этот вопрос.
 */
export function TrickScoringTable({ round, nominal, compact = false }: { round: Round; nominal?: number; compact?: boolean }) {
  const s = round.scoring ?? DEFAULT_TRICK_SCORING
  const fmt = (m: number) => (nominal === undefined ? formatMultiplier(m) : formatDelta(m * nominal))
  const cols = [
    { emoji: '🍬', title: 'Сладость', hint: 'безопасно', color: 'text-sweet', values: [s.sweetCorrect, s.sweetWrong, s.sweetEmpty] },
    { emoji: '💀', title: 'Гадость', hint: 'зона риска', color: 'text-trick', values: [s.trickCorrect, s.trickWrong, s.trickEmpty] },
  ]
  const rows = ['Верно', 'Неверно', 'Нет ответа']
  return (
    <div className={`grid grid-cols-2 gap-4 ${compact ? 'text-lg' : 'text-xl md:text-2xl'}`}>
      {cols.map((c) => (
        <div key={c.title} className="glass rounded-2xl px-6 py-4 min-w-72">
          <div className={`font-spooky ${compact ? 'text-3xl' : 'text-4xl'} ${c.color}`}>
            {c.emoji} {c.title}
          </div>
          <div className="text-sm uppercase tracking-widest opacity-60 mb-2">{c.hint}</div>
          {rows.map((r, i) => (
            <div key={r} className="flex justify-between gap-6">
              <span className="opacity-80">{r}</span>
              <span className="font-black whitespace-nowrap">{fmt(c.values[i])}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
