export function IntroScreen({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 px-16 text-center">
      <h1 className="font-heading text-5xl md:text-7xl font-black uppercase tracking-wide text-quiz-primary drop-shadow-lg">
        {title}
      </h1>
      <p className="text-xl md:text-2xl text-quiz-accent">Нажми «Дальше», чтобы начать</p>
    </div>
  )
}
