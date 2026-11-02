import type { ReactNode } from 'react'
import type { AnswerResult, Quiz } from '../../types/quiz'
import type { useGameController } from '../../lib/useGameController'
import {
  MUSIC_POINTS,
  computeCasinoDeltas,
  computeTrickDeltas,
  findQuestionLocation,
  formatDelta,
  questionNominal,
} from '../../lib/gameLogic'

type Controller = ReturnType<typeof useGameController>

/** Контекстная панель ведущего: то, что нужно сделать на текущем экране, + подсказка с ответом. */
export function HostControls({ quiz, controller }: { quiz: Quiz; controller: Controller }) {
  const { game, round } = controller
  const location = game.currentQuestionId ? findQuestionLocation(quiz, game.currentQuestionId) : null
  const screen = game.currentScreen

  return (
    <div className="flex flex-col gap-3 pb-3">
      {location && ['choose', 'question', 'answer'].includes(screen) && (
        <Panel title="Шпаргалка (видно только тебе)">
          <div className="text-sm opacity-70">
            {location.categoryTitle}
            {round?.type === 'trickOrTreat' && ` · номинал ${questionNominal(location.question, location.index)}`}
          </div>
          <div className="text-lg font-bold text-quiz-primary">{location.question.answerText || '—'}</div>
          {location.question.author && (
            <div className="text-sm">
              Загадал(а): <b>{location.question.author}</b>
            </div>
          )}
        </Panel>
      )}

      {round?.type === 'music' && screen === 'question' && <MusicPanel controller={controller} />}
      {round?.type === 'music' && screen === 'answer' && Object.keys(game.lastDeltas).length > 0 && (
        <Panel title="Начислено за трек">
          {Object.entries(game.lastDeltas).map(([id, d]) => (
            <div key={id}>
              {game.teams.find((t) => t.id === id)?.name}: <b>{formatDelta(d)}</b>
            </div>
          ))}
        </Panel>
      )}

      {round?.type === 'trickOrTreat' && ['choose', 'question'].includes(screen) && <ChoicePanel controller={controller} />}
      {round && round.type !== 'music' && screen === 'answer' && <ResultsPanel quiz={quiz} controller={controller} />}

      {round?.type === 'casino' && screen === 'casino-bets' && <BetsPanel controller={controller} />}

      {screen === 'board' && <Hint>Кликни по клетке на доске, чтобы открыть вопрос.</Hint>}
      {screen === 'question' && round?.type !== 'music' && (
        <Hint>Запусти таймер. Когда время выйдет — «Показать ответ».</Hint>
      )}
    </div>
  )
}

function MusicPanel({ controller }: { controller: Controller }) {
  const { game, awardMusic, passTurn } = controller
  const active = game.activeTeamIndex !== null ? game.teams[game.activeTeamIndex] : null
  return (
    <Panel title="Раунд 1 — кто отвечает">
      {active ? (
        <>
          <div className="text-2xl font-black text-quiz-primary">{active.name}</div>
          <div className="text-xs opacity-60">
            Попытка {game.attempts} из {game.teams.length}
          </div>
          <div className="grid grid-cols-2 gap-2 mt-1">
            <button className="btn-secondary !bg-green-600/40 hover:!bg-green-600/70" onClick={() => awardMusic('author')}>
              Угадали автора +{MUSIC_POINTS.author}
            </button>
            <button className="btn-secondary !bg-green-600/40 hover:!bg-green-600/70" onClick={() => awardMusic('track')}>
              Угадали трек +{MUSIC_POINTS.track}
            </button>
          </div>
          <button className="btn-secondary !bg-red-600/30 hover:!bg-red-600/60" onClick={passTurn}>
            ✗ Мимо — ход следующей команде
          </button>
        </>
      ) : (
        <div className="opacity-70">Все команды попробовали. Покажи ответ.</div>
      )}
      {Object.entries(game.lastDeltas).map(([id, d]) => (
        <div key={id} className="text-sm">
          {game.teams.find((t) => t.id === id)?.name}: <b className="text-trick">{formatDelta(d)}</b>
        </div>
      ))}
    </Panel>
  )
}

function ChoicePanel({ controller }: { controller: Controller }) {
  const { game, setChoice } = controller
  return (
    <Panel title="Сладость или гадость?">
      {game.teams.map((t) => {
        const choice = game.choices[t.id]
        return (
          <div key={t.id} className="flex items-center gap-2">
            <span className="flex-1 truncate font-semibold">{t.name}</span>
            <button
              className={`chip ${choice === 'sweet' ? 'border-sweet bg-sweet/25 text-sweet' : 'chip-off'}`}
              onClick={() => setChoice(t.id, 'sweet')}
            >
              🍬 Сладость
            </button>
            <button
              className={`chip ${choice === 'trick' ? 'border-trick bg-trick/20 text-trick' : 'chip-off'}`}
              onClick={() => setChoice(t.id, 'trick')}
            >
              💀 Гадость
            </button>
          </div>
        )
      })}
      <div className="text-xs opacity-60">Не выбрали — считается «Сладость».</div>
    </Panel>
  )
}

const RESULTS: { value: AnswerResult; label: string; on: string }[] = [
  { value: 'correct', label: '✓', on: 'border-green-400 bg-green-500/30' },
  { value: 'wrong', label: '✗', on: 'border-red-400 bg-red-500/30' },
  { value: 'empty', label: 'пусто', on: 'border-white/50 bg-white/20' },
]

function ResultsPanel({ quiz, controller }: { quiz: Quiz; controller: Controller }) {
  const { game, round, setResult, score, unscore } = controller
  if (!round) return null
  const isCasino = round.type === 'casino'
  const loc = game.currentQuestionId ? findQuestionLocation(quiz, game.currentQuestionId) : null
  const nominal = loc ? questionNominal(loc.question, loc.index) : 1
  const preview = isCasino
    ? computeCasinoDeltas(game.teams, game.bets, game.results)
    : computeTrickDeltas(round, nominal, game.teams, game.choices, game.results)
  const deltas = game.scored ? game.lastDeltas : preview

  return (
    <Panel title={isCasino ? 'Кто ответил верно?' : `Кто ответил верно? Номинал ${nominal}`}>
      {game.teams.map((t) => {
        const result = game.results[t.id]
        const choice = game.choices[t.id] ?? 'sweet'
        return (
          <div key={t.id} className="flex items-center gap-2">
            <span className="flex-1 truncate font-semibold">
              {t.name}{' '}
              <span className="text-xs opacity-70">
                {isCasino ? `ставка ${game.bets[t.id] ?? 0}` : choice === 'trick' ? '💀' : '🍬'}
              </span>
            </span>
            {RESULTS.filter((r) => !isCasino || r.value !== 'empty').map((r) => (
              <button
                key={r.value}
                disabled={game.scored}
                className={`chip ${result === r.value ? r.on : 'chip-off'}`}
                onClick={() => setResult(t.id, r.value)}
              >
                {r.label}
              </button>
            ))}
            <span
              className={`w-10 text-right font-black tabular-nums ${
                deltas[t.id] > 0 ? 'text-trick' : deltas[t.id] < 0 ? 'text-red-400' : 'opacity-50'
              }`}
            >
              {formatDelta(deltas[t.id] ?? 0)}
            </span>
          </div>
        )
      })}
      <div className="text-xs opacity-60">
        {isCasino ? 'Не отмечено «✓» — ставка вычитается.' : 'Не отмечено — считается «нет ответа».'}
      </div>
      {game.scored ? (
        <button className="btn-secondary" onClick={unscore}>
          ↶ Отменить начисление
        </button>
      ) : (
        <button className="btn-primary" onClick={score}>
          Засчитать баллы
        </button>
      )}
    </Panel>
  )
}

function BetsPanel({ controller }: { controller: Controller }) {
  const { game, setBet } = controller
  return (
    <Panel title="Ставки на этот вопрос (на табло суммы скрыты)">
      {game.teams.map((t) => (
        <label key={t.id} className="flex items-center gap-2">
          <span className="flex-1 truncate font-semibold">{t.name}</span>
          <span className="text-xs opacity-60">счёт {t.score}</span>
          <input
            type="number"
            min={0}
            className="input !w-24"
            value={game.bets[t.id] ?? ''}
            onChange={(e) => setBet(t.id, Number(e.target.value))}
          />
        </label>
      ))}
    </Panel>
  )
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="glass rounded-2xl p-4 flex flex-col gap-2">
      <div className="text-xs uppercase tracking-widest opacity-60 font-bold">{title}</div>
      {children}
    </div>
  )
}

function Hint({ children }: { children: ReactNode }) {
  return <div className="text-sm opacity-60 px-1">{children}</div>
}
