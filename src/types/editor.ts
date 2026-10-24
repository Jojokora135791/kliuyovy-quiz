export type Selection =
  | { kind: 'quiz' }
  | { kind: 'round'; roundId: string }
  | { kind: 'category'; roundId: string; categoryId: string }
  | { kind: 'question'; roundId: string; categoryId: string; questionId: string }
