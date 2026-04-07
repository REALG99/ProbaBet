import { FormResult, TeamStats } from '../data/store';

export type MatchProbabilities = {
  oneXTwo: {
    homeWin: number;
    draw: number;
    awayWin: number;
  };
  goals?: {
    over15: number;
    under15: number;
    over25: number;
    under25: number;
    over35: number;
    under35: number;
  };
  goalNoGoal?: {
    goal: number;
    noGoal: number;
  };
  corners?: {
    over75: number;
    under75: number;
    over85: number;
    under85: number;
    over95: number;
    under95: number;
    over105: number;
    under105: number;
  };
  cards?: {
    over25: number;
    under25: number;
    over35: number;
    under35: number;
    over45: number;
    under45: number;
  };
  shots?: {
    over105: number;
    under105: number;
    over125: number;
    under125: number;
    over145: number;
    under145: number;
    over165: number;
    under165: number;
  };
};

const clamp = (value: number, min = 0, max = 100) => {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
};

function formScore(form: FormResult[]): number {
  if (!form.length) return 50;
  const points = form.reduce((acc, curr) => {
    if (curr === 'V') return acc + 3;
    if (curr === 'P') return acc + 1;
    return acc;
  }, 0);
  return (points / 15) * 100;
}

function marketOverProbability(mean: number, line: number, sensitivity: number) {
  return clamp(50 + (mean - line) * sensitivity, 5, 95);
}

function normalizeThreeWay(homeStrength: number, drawStrength: number, awayStrength: number) {
  const total = homeStrength + drawStrength + awayStrength;
  if (!Number.isFinite(total) || total <= 0) {
    return { homeWin: 33.3, draw: 33.4, awayWin: 33.3 };
  }
  return {
    homeWin: clamp((homeStrength / total) * 100),
    draw: clamp((drawStrength / total) * 100),
    awayWin: clamp((awayStrength / total) * 100),
  };
}

export function calculateMatchProbabilities(home: TeamStats, away: TeamStats): MatchProbabilities {
  const homeForm = formScore(home.form);
  const awayForm = formScore(away.form);
  const homeExpected = clamp((home.avgGoalsFor + away.avgGoalsAgainst) / 2, 0.05, 4.8);
  const awayExpected = clamp((away.avgGoalsFor + home.avgGoalsAgainst) / 2, 0.05, 4.8);
  const strengthGap = homeExpected - awayExpected;
  const balancePenalty = Math.abs(strengthGap);

  const homeStrength = clamp(48 + strengthGap * 14 + (homeForm - awayForm) * 0.12, 10, 85);
  const awayStrength = clamp(46 - strengthGap * 14 + (awayForm - homeForm) * 0.12, 8, 80);
  const drawStrength = clamp(26 - balancePenalty * 5 + (100 - Math.abs(homeForm - awayForm)) * 0.07, 10, 45);

  const { homeWin, draw, awayWin } = normalizeThreeWay(homeStrength, drawStrength, awayStrength);

  const totalGoalsExpected = homeExpected + awayExpected;
  const over15 = marketOverProbability(totalGoalsExpected, 1.5, 22);
  const over25 = marketOverProbability(totalGoalsExpected, 2.5, 20);
  const over35 = marketOverProbability(totalGoalsExpected, 3.5, 18);
  const goal = clamp(20 + homeExpected * 22 + awayExpected * 22, 5, 95);

  const hasCornersData = typeof home.cornersAgainst === 'number' && typeof away.cornersAgainst === 'number';
  const cornersMean = hasCornersData ? (home.corners + away.corners + home.cornersAgainst + away.cornersAgainst) / 2 : null;

  const cardsMean = home.cards + away.cards;

  const baseOver105Home = typeof home.shotsOver105 === 'number' ? home.shotsOver105 : clamp(20 + home.shots * 4.5, 5, 95);
  const baseOver105Away = typeof away.shotsOver105 === 'number' ? away.shotsOver105 : clamp(20 + away.shots * 4.5, 5, 95);
  const rhythmBoost = ((homeForm + awayForm) / 2 - 50) * 0.08;
  const over105Shots = clamp((baseOver105Home + baseOver105Away) / 2 + rhythmBoost, 5, 95);

  return {
    oneXTwo: {
      homeWin: Number(homeWin.toFixed(1)),
      draw: Number(draw.toFixed(1)),
      awayWin: Number(awayWin.toFixed(1)),
    },
    goals: {
      over15: Number(over15.toFixed(1)),
      under15: Number((100 - over15).toFixed(1)),
      over25: Number(over25.toFixed(1)),
      under25: Number((100 - over25).toFixed(1)),
      over35: Number(over35.toFixed(1)),
      under35: Number((100 - over35).toFixed(1)),
    },
    goalNoGoal: {
      goal: Number(goal.toFixed(1)),
      noGoal: Number((100 - goal).toFixed(1)),
    },
    corners: hasCornersData && cornersMean !== null
      ? {
          over75: Number(marketOverProbability(cornersMean, 7.5, 15).toFixed(1)),
          under75: Number((100 - marketOverProbability(cornersMean, 7.5, 15)).toFixed(1)),
          over85: Number(marketOverProbability(cornersMean, 8.5, 15).toFixed(1)),
          under85: Number((100 - marketOverProbability(cornersMean, 8.5, 15)).toFixed(1)),
          over95: Number(marketOverProbability(cornersMean, 9.5, 14).toFixed(1)),
          under95: Number((100 - marketOverProbability(cornersMean, 9.5, 14)).toFixed(1)),
          over105: Number(marketOverProbability(cornersMean, 10.5, 14).toFixed(1)),
          under105: Number((100 - marketOverProbability(cornersMean, 10.5, 14)).toFixed(1)),
        }
      : undefined,
    cards: {
      over25: Number(marketOverProbability(cardsMean, 2.5, 19).toFixed(1)),
      under25: Number((100 - marketOverProbability(cardsMean, 2.5, 19)).toFixed(1)),
      over35: Number(marketOverProbability(cardsMean, 3.5, 19).toFixed(1)),
      under35: Number((100 - marketOverProbability(cardsMean, 3.5, 19)).toFixed(1)),
      over45: Number(marketOverProbability(cardsMean, 4.5, 18).toFixed(1)),
      under45: Number((100 - marketOverProbability(cardsMean, 4.5, 18)).toFixed(1)),
    },
    shots: {
      over105: Number(over105Shots.toFixed(1)),
      under105: Number((100 - over105Shots).toFixed(1)),
      over125: Number(clamp(over105Shots - 6).toFixed(1)),
      under125: Number((100 - clamp(over105Shots - 6)).toFixed(1)),
      over145: Number(clamp(over105Shots - 12).toFixed(1)),
      under145: Number((100 - clamp(over105Shots - 12)).toFixed(1)),
      over165: Number(clamp(over105Shots - 18).toFixed(1)),
      under165: Number((100 - clamp(over105Shots - 18)).toFixed(1)),
    },
  };
}

export function getSuggestionLabel(value: number): 'ALTA' | 'MEDIA' | 'BASSA' {
  if (value >= 67) return 'ALTA';
  if (value >= 52) return 'MEDIA';
  return 'BASSA';
}
