export function normalizeAnswer(value: string) {
  return value
    .normalize('NFKC')
    .toLocaleLowerCase()
    .replace(/[’‘`]/g, "'")
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[.!?,;:]+$/u, '');
}

export function isCorrect(expected: string, given: string) {
  return normalizeAnswer(expected) === normalizeAnswer(given);
}
export function nextStreak(current:number,last:Date|null,today=new Date()){if(!last)return 1;const a=new Date(last);a.setHours(0,0,0,0);const b=new Date(today);b.setHours(0,0,0,0);const days=Math.round((b.getTime()-a.getTime())/86400000);return days===0?current:days===1?current+1:1}
