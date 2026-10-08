import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { readFile } from 'node:fs/promises';

const db = new PrismaClient();
const languages = ['tamil', 'hindi', 'malayalam', 'spanish', 'french'];

try {
  for (const [languageIndex, file] of languages.entries()) {
    console.log(`Seeding ${file} (${languageIndex + 1}/${languages.length})...`);
    const data = JSON.parse(
      await readFile(new URL(`../seed/${file}.json`, import.meta.url), 'utf8'),
    );
    const course = await db.course.upsert({
      where: { language: data.language },
      create: { language: data.language, code: data.code },
      update: { code: data.code },
    });

    for (let unitIndex = 0; unitIndex < 3; unitIndex++) {
      const unit = await db.unit.upsert({
        where: { courseId_order: { courseId: course.id, order: unitIndex + 1 } },
        create: {
          title: data.units[unitIndex].title,
          order: unitIndex + 1,
          courseId: course.id,
        },
        update: { title: data.units[unitIndex].title },
      });

      for (let lessonIndex = 0; lessonIndex < 3; lessonIndex++) {
        const lesson = await db.lesson.upsert({
          where: { unitId_order: { unitId: unit.id, order: lessonIndex + 1 } },
          create: {
            title: ['First steps', 'Everyday words', 'Quick review'][lessonIndex],
            order: lessonIndex + 1,
            unitId: unit.id,
          },
          update: {},
        });

        const unitData = data.units[unitIndex];
        const lessonWords = unitData.words.slice(lessonIndex * 8, lessonIndex * 8 + 8);
        const allWords = unitData.words;
        const sceneSets = [
          ['You are counting snacks on a table', 'A friend is practising numbers', 'At a ticket counter', 'During a quick number challenge'],
          ['You are meeting a classmate', 'Someone welcomes you to a family home', 'At the start of a conversation', 'You are greeting a neighbour'],
          ['You are ordering at a local café', 'A friend points to something on a menu', 'You are shopping for lunch', 'At a small family restaurant'],
        ];
        const exercises = Array.from({ length: 8 }, (_, index) => {
          const [native, transliteration, english] = lessonWords[index];
          const display = transliteration ? `${native} / ${transliteration}` : native;
          const type = ['multiple-choice', 'match', 'fill', 'tiles', 'listening', 'multiple-choice', 'tiles', 'fill'][index];
          const scene = sceneSets[unitIndex][(index + lessonIndex) % 4];
          const distractorWords = allWords.filter((word: string[]) => word[2] !== english);
          const distractors: string[] = Array.from(new Set<string>(distractorWords.map((word: string[]) => String(word[2])))).slice(0, 3);
          let options: string[];
          if (type === 'match') {
            options = [english, ...distractors].map((meaning, optionIndex) => `${display} = ${meaning}`);
          } else if (type === 'tiles') {
            const answerTiles = english.split(/\s+/).filter(Boolean);
            const extraTiles = distractors.flatMap((meaning: string) => meaning.split(/\s+/)).filter((word: string) => !answerTiles.includes(word));
            options = [...answerTiles, ...[...new Set(extraTiles)].slice(0, 3)];
            const shift = (index + lessonIndex) % options.length;
            options = [...options.slice(shift), ...options.slice(0, shift)];
          } else {
            options = [english, ...distractors];
            const correctIndex = (index + lessonIndex) % options.length;
            [options[0], options[correctIndex]] = [options[correctIndex], options[0]];
          }

          return {
            lessonId: lesson.id,
            type,
            prompt:
              type === 'listening'
                ? `${scene}. Listen to the phrase and select its English meaning.`
                : type === 'fill'
                  ? `${scene}. Type the English meaning of “${display}”.`
                  : type === 'tiles'
                    ? `${scene}. Translate “${display}” into English by tapping the word tiles.`
                    : type === 'match'
                      ? `${scene}. Choose the only correctly matched pair for “${display}”.`
                      : `${scene}. What does “${display}” mean in English?`,
            answer: type === 'match' ? `${display} = ${english}` : english,
            options: JSON.stringify(options),
            audioText: native,
            order: index + 1,
          };
        });

        await db.exercise.deleteMany({ where: { lessonId: lesson.id } });
        await db.exercise.createMany({ data: exercises });
      }
    }
  }

  for (const [code, name, description] of [
    ['first', 'First Lesson', 'Complete your first lesson'],
    ['streak3', '3-Day Streak', 'Learn three days in a row'],
    ['xp100', '100 XP', 'Earn 100 XP'],
    ['perfect', 'Perfect Lesson', 'Get every answer correct'],
  ]) {
    await db.badge.upsert({
      where: { code },
      create: { code, name, description },
      update: { name, description },
    });
  }

  console.log('Seeded 5 courses, 15 units, 45 lessons and 360 exercises.');
} finally {
  await db.$disconnect();
}
