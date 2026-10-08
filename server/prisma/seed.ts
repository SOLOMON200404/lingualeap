import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { readFile } from 'node:fs/promises';
import { buildMeaningChoices } from '../src/exerciseContent.js';

const db = new PrismaClient();
const languages = ['tamil', 'hindi', 'malayalam', 'spanish', 'french'];
const numberMeanings = new Set(['one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen']);

function learningContext(unitIndex: number, english: string) {
  const meaning = english.toLocaleLowerCase();
  if (unitIndex === 0) {
    if (numberMeanings.has(meaning)) return `You are checking a ticket, quantity, room number, or small item on a receipt; the number is “${meaning}”`;
    if (meaning === 'hello') return 'You arrive at a class and want to greet the person sitting beside you';
    if (meaning === 'thank you') return 'A local helps you find the right bus stop and you want to respond politely';
    if (meaning === 'yes') return 'A café worker asks whether you would like a table by the window';
    if (meaning === 'no') return 'A shopkeeper checks whether you need a bag, and you politely decline';
    if (meaning === 'please') return 'You are making a polite request while ordering at a small café';
    if (meaning === 'sorry') return 'You accidentally step in front of someone in a crowded station';
    if (meaning === 'good morning') return 'You meet your host at breakfast and want to greet them warmly';
    return 'You are leaving a new friend after your first day exploring the city';
  }
  if (unitIndex === 1) {
    if (meaning.includes('name')) return 'You are introducing yourself to a new classmate and exchanging names';
    if (meaning.includes('how are you') || meaning === 'i am well') return 'A neighbour greets you and asks how you are feeling today';
    if (meaning.includes('where are you from')) return 'A conversation partner asks about your hometown during introductions';
    if (meaning.includes('welcome')) return 'Your host greets you at the door of their family home';
    if (meaning.includes('thank')) return 'You want to show appreciation after someone gives you directions';
    if (meaning.includes('help')) return 'You are lost near the station and need to ask a passer-by for help';
    if (meaning.includes('repeat')) return 'You missed part of a sentence and want the speaker to say it again';
    if (meaning.includes('restroom') || meaning.includes('bus stop') || meaning.includes('how much') || meaning.includes('what time') || meaning.includes('how old')) return 'You are travelling in a new town and need to ask a practical question';
    if (meaning.includes('good evening')) return 'You arrive at a neighbour’s home just as the evening begins';
    if (meaning.includes('good morning')) return 'You greet a colleague at the start of the day';
    if (meaning.includes('goodbye') || meaning.includes('see you')) return 'You are ending a conversation and making plans to meet again';
    return 'You are speaking with a new friend and want to keep the conversation warm and polite';
  }
  if (meaning === 'water' || meaning === 'tea' || meaning === 'coffee' || meaning.includes('juice') || meaning === 'milk') return 'You are ordering a drink at a busy café and checking the menu';
  if (meaning === 'salt' || meaning === 'sugar' || meaning === 'pepper' || meaning.includes('vegetable')) return 'You are choosing ingredients for lunch at a neighbourhood market';
  if (meaning === 'rice' || meaning === 'bread' || meaning === 'idli' || meaning === 'dosa' || meaning === 'omelette') return 'You are ordering a meal and checking which familiar dish is available';
  return 'A server points to a menu item while you decide what to share for lunch';
}

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
          [
            'A traveller is learning practical expressions and numbers before exploring a new city',
            'You are helping a classmate read a short message in their new language',
            'At a station, you need to understand a sign or a simple question',
            'A shopkeeper is confirming a quantity and you want to follow the conversation',
            'You are introducing yourself and learning the words people use every day',
            'A friend asks you to repeat a number or phrase so they can write it down',
            'You are checking a ticket, room number, or small item on a receipt',
            'You are practising useful first-day phrases with a local conversation partner',
          ],
          [
            'You arrive at a class and want to greet the person sitting beside you',
            'A neighbour welcomes you into their home and continues the conversation',
            'You meet a new teammate and want to respond in a friendly, natural way',
            'You are ending a conversation politely because your bus is about to leave',
            'A host asks a question while you are meeting their family for the first time',
            'You are asking someone to speak more slowly so you can understand them',
            'You want to thank a person who has just helped you find the right place',
            'You are making plans with a friend and need to understand their parting phrase',
          ],
          [
            'You are reading a menu and want to identify a dish before ordering',
            'A café worker asks what you would like to drink with your meal',
            'You are shopping for ingredients and need to ask for one item by name',
            'A friend offers you a snack and you want to understand what it is',
            'You are ordering lunch and checking whether a dish contains a certain ingredient',
            'A server repeats a food word while confirming your order',
            'You are choosing a drink at a busy counter and need to recognise it quickly',
            'You are sharing a meal and asking for a familiar ingredient at the table',
          ],
        ];
        const exercises = Array.from({ length: 8 }, (_, index) => {
          const [native, transliteration, english] = lessonWords[index];
          const display = transliteration ? `${native} / ${transliteration}` : native;
          const type = ['multiple-choice', 'match', 'fill', 'tiles', 'listening', 'multiple-choice', 'tiles', 'fill'][index];
          const scene = `${learningContext(unitIndex, english)}. ${sceneSets[unitIndex][(index + lessonIndex) % 8]}.`;
          const { distractors, choices: choiceMeanings } = buildMeaningChoices(english, allWords, lessonIndex, index);
          let options: string[];
          if (type === 'match') {
            options = choiceMeanings.map(meaning => `${display} = ${meaning}`);
          } else if (type === 'tiles') {
            const answerTiles = english.split(/\s+/).filter(Boolean);
            const extraTiles = distractors.flatMap((meaning: string) => meaning.split(/\s+/)).filter((word: string) => !answerTiles.includes(word));
            options = [...new Set([...answerTiles, ...extraTiles])];
            const shift = (index + lessonIndex) % options.length;
            options = [...options.slice(shift), ...options.slice(0, shift)];
          } else {
            options = choiceMeanings;
          }

          return {
            lessonId: lesson.id,
            type,
            prompt:
              type === 'listening'
                ? `${scene} Listen closely to “${display}” and choose its English meaning.`
                : type === 'fill'
                  ? `${scene} Type the English meaning of “${display}”; answer with the English word or phrase.`
                  : type === 'tiles'
                    ? `${scene} Rebuild the English translation of “${display}” by tapping the word tiles in order.`
                    : type === 'match'
                      ? `${scene} Select the one exact English meaning that matches “${display}”.`
                      : `${scene} Which English word or phrase matches “${display}”?`,
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
