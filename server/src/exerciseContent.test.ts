import { describe, expect, it } from 'vitest';
import { buildMeaningChoices, type SeedWord } from './exerciseContent.js';

const words = Array.from({ length: 24 }, (_, index) => [
  `native-${index + 1}`,
  '',
  ['hello', 'thank you', 'please', 'sorry', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'water', 'tea', 'rice', 'bread', 'apple', 'milk', 'coffee', 'fish', 'egg', 'fruit'][index],
]) as SeedWord[];

describe('lesson question options', () => {
  it('gives each question exactly one correct choice and three distinct distractors', () => {
    for (let index = 0; index < 8; index++) {
      const answer = words[index][2];
      const { choices } = buildMeaningChoices(answer, words, 0, index);
      expect(choices).toHaveLength(4);
      expect(new Set(choices.map(value => value.toLocaleLowerCase())).size).toBe(4);
      expect(choices.filter(value => value === answer)).toHaveLength(1);
    }
  });

  it('changes the distractor set and correct-answer position across exercises', () => {
    const choiceSets = Array.from({ length: 8 }, (_, index) => {
      const { choices } = buildMeaningChoices(words[index][2], words, 1, index);
      return [...choices].sort().join('|');
    });
    const correctPositions = Array.from({ length: 8 }, (_, index) =>
      buildMeaningChoices(words[index][2], words, 1, index).choices.indexOf(words[index][2]));
    expect(new Set(choiceSets).size).toBe(8);
    expect(new Set(correctPositions).size).toBe(4);
  });
});
