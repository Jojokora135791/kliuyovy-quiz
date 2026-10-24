const CHANNEL_NAME = 'quiz-game-sync'

/**
 * Межвкладочная синхронизация без бэкенда: панель ведущего и табло зрителей
 * открыты в одном браузере на одном компьютере (два окна/вкладки).
 * localStorage — источник истины, BroadcastChannel — мгновенный пуш между вкладками.
 */
export function createGameChannel(onMessage: (data: unknown) => void) {
  if (typeof BroadcastChannel === 'undefined') {
    return { post: () => {}, close: () => {} }
  }
  const channel = new BroadcastChannel(CHANNEL_NAME)
  channel.onmessage = (event: MessageEvent) => onMessage(event.data)
  return {
    post: (data: unknown) => channel.postMessage(data),
    close: () => channel.close(),
  }
}
