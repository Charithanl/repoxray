export interface BusFactor {
  busFactor: number; // how many people it takes to cover more than half the changes
  topAuthor: string; // the person who changed the file most
  topShare: number; // their share of all changes, from 0 to 1
}

export function calculateBusFactor(authors: Record<string, number>): BusFactor {
  // Most active author first, ties sorted by name so results never shuffle
  const sorted = Object.entries(authors).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  const total = sorted.reduce((sum, [, count]) => sum + count, 0);

  if (total === 0) return { busFactor: 0, topAuthor: "", topShare: 0 };

  let covered = 0;
  let busFactor = 0;
  for (const [, count] of sorted) {
    covered += count;
    busFactor += 1;
    if (covered / total > 0.5) break;
  }

  const top = sorted[0];
  return {
    busFactor,
    topAuthor: top ? top[0] : "",
    topShare: top ? top[1] / total : 0,
  };
}