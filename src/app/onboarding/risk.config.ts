export const QUESTION_SCORES: Record<number, Record<string, number>> = {
  1: { a: 2, b: 3, c: 4, d: 5 },
  2: { a: 5, b: 3 },
  3: { a: 5, b: 2, c: 4, d: 3 },
  4: { a: 5, b: 2, c: 5, d: 4, e: 4 },
  5: { a: 2, b: 3, c: 4, d: 5 },
  6: { a: 1, b: 3, c: 4, d: 5 },
  7: { a: 1, b: 2, c: 5, d: 3, e: 4 },
  8: { a: 1, b: 5, c: 3, d: 4 },
  9: { a: 5, b: 3, c: 4, d: 4 },
  10:{ a: 2, b: 5, c: 2, d: 1 },
};

export const GRADE_MAP = {
  5: "A",
  4: "B",
  3: "C",
  2: "D",
  1: "E",
};

export const RISK_PROFILE_MAP = {
  A: "Very Aggressive",
  B: "Aggressive",
  C: "Moderate",
  D: "Conservative",
  E: "Very Conservative",
};
