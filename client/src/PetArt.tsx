const fur: Record<string, string> = {
  amber: '#f28a52',
  mint: '#54ad88',
  sky: '#5798bd',
  rose: '#ca7293',
};

const accessories: Record<string, string> = {
  none: '',
  scarf: '🧣',
  flower: '🌼',
  crown: '👑',
};

export function PetAvatar({ color = 'amber', accessory = 'none', className = '' }: { color?: string; accessory?: string; className?: string }) {
  return (
    <div className={`pet-avatar ${className}`} role="img" aria-label="Your LinguaLeap fox companion">
      <svg role="img" aria-label="A friendly fox companion" viewBox="0 0 100 100">
        <path fill={fur[color] || fur.amber} d="M11 13Q10 9 15 12l27 15q8-3 16 0l27-15q5-3 4 2l-7 39q12 25-4 38-12 10-28 10T22 91Q6 78 18 53z" />
        <path fill="#fff8e9" d="M24 57q26-16 52 0 0 21-26 28-26-7-26-28" />
        <ellipse cx="34" cy="55" rx="4" ry="5" fill="#173d34" />
        <ellipse cx="66" cy="55" rx="4" ry="5" fill="#173d34" />
        <path fill="#cb544b" d="m45 69 5-4 5 4-5 5z" />
        <path d="M46 77q4 3 8 0" fill="none" stroke="#b85a4d" strokeWidth="2" strokeLinecap="round" />
      </svg>
      {accessories[accessory] && <span className="pet-accessory" aria-hidden="true">{accessories[accessory]}</span>}
    </div>
  );
}

export const petAbility = (level: number) => {
  if (level >= 4) return 'Culture Keeper';
  if (level >= 3) return 'Phrase Weaver';
  if (level >= 2) return 'Word Finder';
  return 'Curious Scout';
};
