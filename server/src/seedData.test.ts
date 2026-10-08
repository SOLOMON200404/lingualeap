import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { buildMeaningChoices, type SeedWord } from './exerciseContent.js';

const languages = ['tamil', 'hindi', 'malayalam', 'spanish', 'french'] as const;
const numberWords = new Set(['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight']);

describe('reviewable course seed content', () => {
  for (const language of languages) {
    it(`${language} has varied, complete units and unique English meanings`, () => {
      const data = JSON.parse(readFileSync(new URL(`../seed/${language}.json`, import.meta.url), 'utf8'));
      expect(data.units).toHaveLength(3);
      for (const unit of data.units) {
        expect(unit.words).toHaveLength(24);
        const meanings = unit.words.map((word: string[]) => word[2].trim().toLocaleLowerCase());
        expect(new Set(meanings).size).toBe(meanings.length);
        expect(unit.words.every((word: string[]) => word.length === 3 && word[0] && word[2])).toBe(true);
        for (let lessonIndex = 0; lessonIndex < 3; lessonIndex++) {
          const lessonWords = unit.words.slice(lessonIndex * 8, lessonIndex * 8 + 8) as SeedWord[];
          const optionSets = new Set<string>();
          for (let exerciseIndex = 0; exerciseIndex < lessonWords.length; exerciseIndex++) {
            const answer = lessonWords[exerciseIndex][2];
            const { choices } = buildMeaningChoices(answer, unit.words as SeedWord[], lessonIndex, exerciseIndex);
            expect(choices.filter(choice => choice === answer)).toHaveLength(1);
            expect(new Set(choices.map(choice => choice.toLocaleLowerCase())).size).toBe(4);
            optionSets.add([...choices].sort().join('|'));
          }
          expect(optionSets.size).toBe(8);
        }
      }

      const openingWords = data.units[0].words.slice(0, 8).map((word: string[]) => word[2].toLocaleLowerCase());
      expect(openingWords.filter((word: string) => numberWords.has(word))).toHaveLength(4);
    });
  }

  for (const language of ['tamil', 'hindi', 'malayalam']) {
    it(`${language} keeps native script and transliteration on every entry`, () => {
      const data = JSON.parse(readFileSync(new URL(`../seed/${language}.json`, import.meta.url), 'utf8'));
      for (const unit of data.units) {
        expect(unit.words.every((word: string[]) => word[0].trim() && word[1].trim())).toBe(true);
      }
    });
  }
});
