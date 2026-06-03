const DEDUCTION_FACTOR = 0.7;

interface RecordInput {
  pointsEarned: number;
  matchPlayedAt: Date;
}

export function applyMonthlyDeduction(records: RecordInput[]): number {
  const ordered = [...records].sort((a, b) => new Date(a.matchPlayedAt).getTime() - new Date(b.matchPlayedAt).getTime());
  if (ordered.length === 0) return 0;

  let total = 0;
  const now = new Date();
  const currentMonth = now.getFullYear() * 12 + now.getMonth();
  let lastMonth: number | null = null;

  for (const r of ordered) {
    const d = new Date(r.matchPlayedAt);
    const monthKey = d.getFullYear() * 12 + d.getMonth();

    if (lastMonth !== null && monthKey > lastMonth) {
      for (let m = lastMonth + 1; m < monthKey; m++) total *= DEDUCTION_FACTOR;
      total *= DEDUCTION_FACTOR;
    }

    total += r.pointsEarned;
    lastMonth = monthKey;
  }

  if (lastMonth !== null && lastMonth < currentMonth) {
    for (let m = lastMonth + 1; m <= currentMonth; m++) total *= DEDUCTION_FACTOR;
  }

  return Math.max(0, total);
}

// Matches .NET RankCalculator - dojo-style belts
const RANKS = [
  { name: 'White Belt', min: 0, max: 10, hourlyRate: 0, imagePath: '/images/belts/white.png', color: 'white' },
  { name: 'Yellow Belt', min: 11, max: 20, hourlyRate: 14, imagePath: '/images/belts/yellow.png', color: 'yellow' },
  { name: 'Green Belt', min: 21, max: 29, hourlyRate: 14, imagePath: '/images/belts/green.png', color: 'green' },
  { name: 'Blue Belt', min: 30, max: 38, hourlyRate: 14, imagePath: '/images/belts/blue.png', color: 'blue' },
  { name: 'Brown Belt', min: 39, max: 47, hourlyRate: 14, imagePath: '/images/belts/brown.png', color: 'brown' },
  { name: '1st Dan (Shodan)', min: 48, max: 54, hourlyRate: 12, imagePath: '/images/belts/black-1.png', color: 'black' },
  { name: '2nd Dan (Nidan)', min: 55, max: 61, hourlyRate: 12, imagePath: '/images/belts/black-2.png', color: 'black' },
  { name: '3rd Dan (Sandan)', min: 62, max: 67, hourlyRate: 12, imagePath: '/images/belts/black-3.png', color: 'black' },
  { name: '4th Dan (Yondan)', min: 68, max: 73, hourlyRate: 11, imagePath: '/images/belts/black-4.png', color: 'black' },
  { name: '5th Dan (Godan)', min: 74, max: 78, hourlyRate: 11, imagePath: '/images/belts/black-5.png', color: 'black' },
  { name: '6th Dan (Rokudan)', min: 79, max: 83, hourlyRate: 11, imagePath: '/images/belts/black-6.png', color: 'black' },
  { name: '7th Dan (Nanadan)', min: 84, max: 87, hourlyRate: 10, imagePath: '/images/belts/black-7.png', color: 'black' },
  { name: '8th Dan (Hachidan)', min: 88, max: 90, hourlyRate: 10, imagePath: '/images/belts/black-8.png', color: 'black' },
  { name: '9th Dan (Kudan)', min: 91, max: 92, hourlyRate: 10, imagePath: '/images/belts/black-9.png', color: 'black' },
  { name: '10th Dan (Judan)', min: 93, max: Infinity, hourlyRate: 9, imagePath: '/images/belts/black-10.png', color: 'black' },
];

export function getRank(points: number) {
  const r = RANKS.find((x) => points >= x.min && points <= x.max) || RANKS[0];
  return {
    name: r.name,
    pointRange: r.max === Infinity ? `${r.min}+` : `${r.min} - ${r.max}`,
    hourlyRate: r.hourlyRate,
    imagePath: r.imagePath,
    color: r.color,
  };
}

export function getAllRanks() {
  return RANKS.map((r) => ({
    name: r.name,
    pointRange: r.max === Infinity ? `${r.min}+` : `${r.min} - ${r.max}`,
    hourlyRate: r.hourlyRate,
    imagePath: r.imagePath,
    color: r.color,
  }));
}
