export type SeedWord = [native: string, transliteration: string, english: string];

/** Build a deterministic, varied set of one-correct-answer meanings for a question. */
export function buildMeaningChoices(english: string, allWords: SeedWord[], lessonIndex: number, exerciseIndex: number) {
  const normalizedAnswer = english.normalize('NFKC').toLocaleLowerCase().trim();
  const answerPool = Array.from(new Set(allWords
    .map((word) => word[2].normalize('NFKC').trim())
    .filter((meaning) => meaning && meaning.toLocaleLowerCase() !== normalizedAnswer)));

  if (answerPool.length < 3) throw new Error('Every exercise needs at least three distinct distractor meanings.');

  const distractors = Array.from({ length: 3 }, (_, offset) =>
    answerPool[(exerciseIndex * 3 + lessonIndex * 5 + offset) % answerPool.length]);
  const correctPosition = (exerciseIndex + lessonIndex) % 4;
  const choices = new Array<string>(4);
  choices[correctPosition] = english;
  let distractorIndex = 0;
  for (let optionIndex = 0; optionIndex < choices.length; optionIndex++) {
    if (optionIndex !== correctPosition) choices[optionIndex] = distractors[distractorIndex++];
  }

  return { distractors, choices };
}
