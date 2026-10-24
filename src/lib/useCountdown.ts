import { useEffect, useRef, useState } from 'react'

/** Отсчитывает секунды до timestamp endsAt, дёргает onEnd ровно один раз по достижении нуля. */
export function useCountdown(running: boolean, endsAt: number | null | undefined, onEnd?: () => void) {
  const [remaining, setRemaining] = useState<number | null>(null)
  const endedRef = useRef(false)

  useEffect(() => {
    endedRef.current = false
  }, [endsAt])

  useEffect(() => {
    if (!running || !endsAt) {
      setRemaining(null)
      return
    }
    const tick = () => {
      const secondsLeft = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000))
      setRemaining(secondsLeft)
      if (secondsLeft === 0 && !endedRef.current) {
        endedRef.current = true
        onEnd?.()
      }
    }
    tick()
    const interval = setInterval(tick, 200)
    return () => clearInterval(interval)
  }, [running, endsAt, onEnd])

  return remaining
}
