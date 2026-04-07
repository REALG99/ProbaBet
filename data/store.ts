export type FormResult = 'V' | 'P' | 'S';

export type TeamStats = {
  name: string;
  avgGoalsFor: number;
  avgGoalsAgainst: number;
  shots: number;
  shotsOver105?: number;
  shotsOnTarget?: number;
  corners: number;
  cornersAgainst?: number;
  cards: number;
  form: FormResult[];
  updatedAt: string;
};

const STORAGE_KEY = 'betting_saas_team_stats_v1';

const UPDATED_AT = '2026-04-07';

function toForm(raw: string): FormResult[] {
  if (!raw || raw.includes('—')) return [];
  return raw
    .split(' ')
    .map((x) => x.trim())
    .filter(Boolean)
    .map((x) => (x === 'W' ? 'V' : x === 'D' ? 'P' : 'S'));
}

function team(
  name: string,
  goalsFor: number,
  goalsAgainst: number,
  cornersFor: number,
  cornersAgainst: number,
  shotsPct: number,
  cards: number,
  form: string,
): TeamStats {
  const cardsPerMatch = cards > 10 ? Number((cards / 20).toFixed(2)) : cards;
  const shotsPerMatch = Number((6 + shotsPct * 0.1).toFixed(2));
  return {
    name,
    avgGoalsFor: goalsFor,
    avgGoalsAgainst: goalsAgainst,
    corners: cornersFor,
    cornersAgainst,
    shots: shotsPerMatch,
    shotsOver105: shotsPct,
    cards: cardsPerMatch,
    form: toForm(form),
    updatedAt: UPDATED_AT,
  };
}

const defaults: Record<string, TeamStats> = {
  // Bundesliga
  Augsburg: team('Augsburg', 1.21, 1.11, 4.5, 5.46, 71, 71, 'D D D D L'),
  Bayern: team('Bayern', 3.46, 3.07, 6.29, 3.36, 100, 50, 'D W W D W'),
  'Bayern Monaco': team('Bayern Monaco', 3.46, 3.07, 6.29, 3.36, 100, 50, 'D W W D W'),
  Dortmund: team('Dortmund', 2.11, 1.89, 5.57, 4.54, 61, 52, 'W W L W W'),
  'Borussia Dortmund': team('Borussia Dortmund', 2.11, 1.89, 5.57, 4.54, 61, 52, 'W W L W W'),
  Frankfurt: team('Frankfurt', 1.86, 1.71, 4.43, 4.18, 61, 51, '—'),
  Eintracht: team('Eintracht', 1.86, 1.71, 4.43, 4.18, 61, 51, '—'),
  Freiburg: team('Freiburg', 1.39, 1.21, 4.46, 4.14, 68, 44, 'D L L L W'),
  Gladbach: team('Gladbach', 1.18, 1.04, 4.07, 4.57, 54, 42, 'D L L L D'),
  "Borussia M'Gladbach": team("Borussia M'Gladbach", 1.18, 1.04, 4.07, 4.57, 54, 42, 'D L L L D'),
  Hamburger: team('Hamburger', 1.14, 1.04, 3.82, 5.5, 54, 67, 'D W D W L'),
  Amburgo: team('Amburgo', 1.14, 1.04, 3.82, 5.5, 54, 67, 'D W D W L'),
  Heidenheim: team('Heidenheim', 1.04, 0.96, 4.5, 4.79, 46, 43, 'L L D L D'),
  Hoffenheim: team('Hoffenheim', 1.82, 1.68, 5.68, 5.07, 68, 54, 'L D W L D'),
  Koln: team('Koln', 1.39, 1.36, 4.5, 5.68, 61, 53, '—'),
  Colonia: team('Colonia', 1.39, 1.36, 4.5, 5.68, 61, 53, '—'),
  Leverkusen: team('Leverkusen', 2.04, 1.82, 5.29, 4.14, 75, 63, 'D L W D D'),
  Mainz: team('Mainz', 1.25, 1.0, 4.96, 4.54, 54, 62, 'W W D D W'),
  'RB Leipzig': team('RB Leipzig', 1.89, 1.86, 5.18, 4.36, 86, 40, 'L D D W W'),
  'RB Lipsia': team('RB Lipsia', 1.89, 1.86, 5.18, 4.36, 86, 40, 'L D D W W'),
  'St Pauli': team('St Pauli', 0.89, 0.75, 4.43, 5.04, 46, 43, 'D W W D L'),
  'FC St. Pauli': team('FC St. Pauli', 0.89, 0.75, 4.43, 5.04, 46, 43, 'D W W D L'),
  Stuttgart: team('Stuttgart', 1.96, 1.82, 5.36, 4.07, 86, 55, 'W W W W L'),
  Stoccarda: team('Stoccarda', 1.96, 1.82, 5.36, 4.07, 86, 55, 'W W W W L'),
  'Union Berlin': team('Union Berlin', 1.14, 1.04, 4.86, 4.5, 64, 61, 'L L L W L'),
  'Union Berlino': team('Union Berlino', 1.14, 1.04, 4.86, 4.5, 64, 61, 'L L L W L'),
  'Werder Bremen': team('Werder Bremen', 1.07, 1.0, 4.5, 4.61, 75, 67, '—'),
  'Werder Brema': team('Werder Brema', 1.07, 1.0, 4.5, 4.61, 75, 67, '—'),
  Wolfsburg: team('Wolfsburg', 1.36, 1.21, 3.93, 7.79, 61, 59, '—'),

  // Ligue 1
  Angers: team('Angers', 0.82, 0.75, 3.57, 5.25, 28, 41, 'D L D L D'),
  Auxerre: team('Auxerre', 0.68, 0.57, 4.89, 4.64, 54, 59, 'L D L D W'),
  'Le Havre': team('Le Havre', 0.82, 0.79, 4.46, 4.71, 46, 50, 'D L L L L'),
  Lille: team('Lille', 1.61, 1.43, 5.86, 3.68, 68, 64, 'L D W W W'),
  Lilla: team('Lilla', 1.61, 1.43, 5.86, 3.68, 68, 64, 'L D W W W'),
  Lorient: team('Lorient', 1.32, 1.25, 3.29, 5.18, 46, 48, 'L D D L D'),
  Lyon: team('Lyon', 1.43, 1.36, 5.36, 4.54, 61, 52, 'W W W W W'),
  Lione: team('Lione', 1.43, 1.36, 5.36, 4.54, 61, 52, 'W W W W W'),
  Marseille: team('Marseille', 1.93, 1.75, 5.11, 3.43, 71, 64, 'W W W D W'),
  'Olympique Marsiglia': team('Olympique Marsiglia', 1.93, 1.75, 5.11, 3.43, 71, 64, 'W W W D W'),
  Metz: team('Metz', 0.86, 0.71, 4.07, 4.93, 36, 47, 'L L L L D'),
  Monaco: team('Monaco', 1.68, 1.5, 4.57, 4.57, 56, 66, '—'),
  Nantes: team('Nantes', 0.85, 0.78, 3.15, 5.78, 44, 55, 'W L L L D'),
  Nice: team('Nice', 1.11, 1.04, 5.21, 5.64, 54, 62, 'D D D L L'),
  Nizza: team('Nizza', 1.11, 1.04, 5.21, 5.64, 54, 62, 'D D D L L'),
  PSG: team('PSG', 2.22, 2.07, 5.96, 2.89, 96, 25, 'W W L W W'),
  Rennes: team('Rennes', 1.64, 1.5, 5.5, 4.64, 68, 50, 'L D L L L'),
  Toulouse: team('Toulouse', 1.36, 1.21, 4.57, 4.82, 56, 63, 'D D L D W'),
  Tolosa: team('Tolosa', 1.36, 1.21, 4.57, 4.82, 56, 63, 'D D L D W'),
  Paris: team('Paris', 1.14, 0.96, 4.43, 5.54, 50, 57, '—'),

  // La Liga
  Alaves: team('Alaves', 1.0, 0.8, 4.9, 4.67, 63, 73, 'W D L L W'),
  'Athletic Club': team('Athletic Club', 1.03, 0.87, 5.33, 3.9, 80, 67, 'D W W L W'),
  'Atletico Madrid': team('Atletico Madrid', 1.53, 1.47, 6.5, 3.93, 63, 61, '—'),
  'Atlético Madrid': team('Atlético Madrid', 1.53, 1.47, 6.5, 3.93, 63, 61, '—'),
  Barcelona: team('Barcelona', 2.63, 2.43, 7.27, 4.2, 97, 45, 'W W W W W'),
  Barcellona: team('Barcellona', 2.63, 2.43, 7.27, 4.2, 97, 45, 'W W W W W'),
  Espanyol: team('Espanyol', 1.17, 1.07, 4.67, 4.47, 47, 67, 'L L D L D'),
  Valencia: team('Valencia', 1.13, 0.97, 5.2, 4.47, 56, 58, 'L W L L W'),
  Sevilla: team('Sevilla', 1.17, 1.03, 4.93, 4.57, 53, 85, '—'),
  Siviglia: team('Siviglia', 1.17, 1.03, 4.93, 4.57, 53, 85, '—'),
  Osasuna: team('Osasuna', 1.17, 1.0, 3.43, 4.7, 56, 73, '—'),
  Betis: team('Betis', 1.43, 1.37, 4.53, 5.23, 80, 57, '—'),
  Mallorca: team('Mallorca', 1.2, 1.03, 3.4, 6.6, 40, 71, '—'),
  'Rayo Vallecano': team('Rayo Vallecano', 0.97, 0.87, 6.0, 5.03, 77, 79, 'L L D D D'),
  'Celta Vigo': team('Celta Vigo', 1.43, 1.2, 4.0, 4.57, 47, 58, 'L W L L L'),
  'Real Oviedo': team('Real Oviedo', 0.7, 0.63, 3.87, 6.03, 40, 70, 'L D L D L'),
  Levante: team('Levante', 1.13, 1.07, 3.77, 6.37, 53, 68, 'L L L D D'),
  Getafe: team('Getafe', 0.9, 0.83, 4.47, 4.87, 33, 85, 'D W W L W'),
  'Real Madrid': team('Real Madrid', 2.13, 1.73, 6.33, 3.53, 97, 55, '—'),
  Girona: team('Girona', 1.07, 0.86, 4.17, 5.27, 40, 63, '—'),
  'Real Sociedad': team('Real Sociedad', 1.53, 1.33, 5.8, 4.67, 67, 61, 'W D L L W'),
  Elche: team('Elche', 1.2, 1.13, 3.67, 4.53, 56, 64, 'D L D D W'),
  Villarreal: team('Villarreal', 1.83, 1.72, 3.93, 4.57, 50, 63, 'L W L D L'),

  // Premier League
  Arsenal: team('Arsenal', 1.84, 1.74, 5.84, 3.26, 77, 40, 'D L W W W'),
  'AFC Bournemouth': team('AFC Bournemouth', 1.48, 1.35, 5.71, 5.29, 81, 71, 'D W W D D'),
  Bournemouth: team('Bournemouth', 1.48, 1.35, 5.71, 5.29, 81, 71, 'D W W D D'),
  Brentford: team('Brentford', 1.45, 1.26, 4.77, 5.06, 39, 58, 'W L D L D'),
  Everton: team('Everton', 1.13, 1.06, 4.35, 5.19, 55, 55, 'W D W W L'),
  Burnley: team('Burnley', 0.97, 0.9, 3.58, 6.0, 39, 53, 'D D L L D'),
  'Brighton & Hove Albion': team('Brighton & Hove Albion', 1.29, 1.19, 4.74, 4.84, 77, 79, 'D L D D D'),
  Brighton: team('Brighton', 1.29, 1.19, 4.74, 4.84, 77, 79, 'D L D D D'),
  Liverpool: team('Liverpool', 1.55, 1.52, 5.97, 4.45, 74, 49, '—'),
  'Aston Villa': team('Aston Villa', 1.58, 1.41, 5.2, 4.55, 72, 60, 'W D W L W'),
  Fulham: team('Fulham', 1.26, 1.13, 4.71, 5.68, 71, 65, '—'),
  'Crystal Palace': team('Crystal Palace', 1.07, 0.87, 4.27, 4.83, 60, 64, '—'),
  Newcastle: team('Newcastle', 1.42, 1.23, 6.58, 5.03, 71, 54, '—'),
  Sunderland: team('Sunderland', 0.94, 0.81, 3.58, 5.19, 42, 65, 'L L L L L'),
  Tottenham: team('Tottenham', 1.26, 1.26, 5.19, 4.97, 55, 77, 'L D L L D'),
  'Nottingham Forest': team('Nottingham Forest', 1.0, 0.94, 5.35, 4.9, 57, 48, 'D D D L D'),
  'Nottm Forest': team('Nottm Forest', 1.0, 0.94, 5.35, 4.9, 57, 48, 'D D D L D'),
  Chelsea: team('Chelsea', 1.68, 1.45, 6.23, 4.13, 84, 77, '—'),
  'Manchester City': team('Manchester City', 1.9, 1.8, 5.67, 3.7, 83, 56, '—'),
  'Man City': team('Man City', 1.9, 1.8, 5.67, 3.7, 83, 56, '—'),
  'Manchester United': team('Manchester United', 1.71, 1.58, 4.58, 4.9, 84, 48, 'W W W W W'),
  Leeds: team('Leeds', 1.19, 1.06, 4.52, 4.39, 65, 51, 'L D D D D'),
  'West Ham': team('West Ham', 1.1, 1.0, 5.03, 6.55, 48, 54, 'L D D D D'),
  Wolverhampton: team('Wolverhampton', 0.74, 0.68, 3.19, 6.03, 39, 69, 'D L D D D'),
  Wolves: team('Wolves', 0.74, 0.68, 3.19, 6.03, 39, 69, 'D L D D D'),

  // Serie A
  Inter: team('Inter', 2.19, 2.03, 6.71, 2.71, 97, 51, 'W W W L D'),
  Juventus: team('Juventus', 1.67, 1.6, 5.23, 3.81, 90, 36, 'L W D D W'),
  Como: team('Como', 1.73, 1.63, 4.16, 3.26, 87, 63, 'D L W D D'),
  Atalanta: team('Atalanta', 1.37, 1.27, 5.71, 4.29, 77, 47, 'W W W D W'),
  Bologna: team('Bologna', 1.26, 1.13, 4.52, 4.1, 74, 60, 'L L W L L'),
  Napoli: team('Napoli', 1.53, 1.4, 5.29, 2.87, 68, 42, 'L W L W W'),
  Fiorentina: team('Fiorentina', 1.13, 0.94, 4.55, 4.61, 68, 69, 'L D D L D'),
  Genoa: team('Genoa', 1.2, 1.07, 3.65, 5.13, 65, 54, 'W L W W L'),
  Milan: team('Milan', 1.57, 1.4, 4.58, 4.45, 65, 49, '—'),
  Roma: team('Roma', 1.35, 1.23, 5.06, 3.19, 61, 58, '—'),
  Torino: team('Torino', 1.06, 0.94, 3.9, 4.52, 55, 59, '—'),
  Verona: team('Verona', 0.68, 0.58, 3.87, 4.77, 55, 71, '—'),
  Cagliari: team('Cagliari', 1.03, 0.97, 3.39, 5.29, 48, 73, 'L D L L L'),
  Lecce: team('Lecce', 0.7, 0.67, 4.42, 5.48, 48, 51, 'L L L L L'),
  Lazio: team('Lazio', 0.97, 0.84, 3.74, 4.0, 45, 61, 'D D D L D'),
  Parma: team('Parma', 0.65, 0.58, 3.94, 4.45, 45, 57, 'D L W D L'),
  Udinese: team('Udinese', 1.17, 1.0, 4.35, 4.87, 45, 59, '—'),
  Sassuolo: team('Sassuolo', 1.19, 1.13, 3.9, 4.74, 39, 67, 'L W W L D'),
  Pisa: team('Pisa', 0.71, 0.52, 3.68, 4.87, 39, 61, '—'),
  Cremonese: team('Cremonese', 0.84, 0.74, 3.23, 6.45, 32, 64, 'L L L L W'),

  // Primeira Liga + alias aggiuntivi per CSV
  Sporting: team('Sporting', 2.02, 1.79, 5.64, 3.84, 88, 52, 'W W D W W'),
  Braga: team('Braga', 1.66, 1.46, 5.09, 4.36, 73, 58, 'W L W D W'),
  Porto: team('Porto', 1.91, 1.71, 5.58, 3.91, 85, 54, 'W W L W D'),
  Friburgo: team('Friburgo', 1.39, 1.21, 4.46, 4.14, 68, 44, 'D L L L W'),
};

export function getTeamStatsMap(): Record<string, TeamStats> {
  return defaults;
}

function normalizeTeamKey(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

const normalizedDefaults: Record<string, TeamStats> = Object.entries(defaults).reduce(
  (acc, [name, stats]) => {
    acc[normalizeTeamKey(name)] = stats;
    return acc;
  },
  {} as Record<string, TeamStats>,
);

export function saveTeamStats(_teamStats: TeamStats): void {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(STORAGE_KEY);
  }
}

export function getTeamStats(name: string): TeamStats | null {
  const all = getTeamStatsMap();
  if (all[name]) return all[name];
  return normalizedDefaults[normalizeTeamKey(name)] || null;
}

export function listTeams(): string[] {
  return Object.keys(getTeamStatsMap()).sort((a, b) => a.localeCompare(b));
}
