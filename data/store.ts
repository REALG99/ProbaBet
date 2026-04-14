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

const UPDATED_AT = '2026-04-14';

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
  Augsburg: team('Augsburg', 1.24, 1.76, 4.48, 5.41, 71, 75, '—'),
  'FC Augsburg': team('FC Augsburg', 1.24, 1.76, 4.48, 5.41, 71, 75, '—'),
  Bayern: team('Bayern', 3.52, 0.93, 6.21, 3.34, 131, 52, '—'),
  'Bayern Monaco': team('Bayern Monaco', 3.52, 0.93, 6.21, 3.34, 131, 52, '—'),
  Dortmund: team('Dortmund', 2.03, 1.0, 5.55, 4.55, 72, 57, '—'),
  'Borussia Dortmund': team('Borussia Dortmund', 2.03, 1.0, 5.55, 4.55, 72, 57, '—'),
  Frankfurt: team('Frankfurt', 1.86, 1.83, 4.52, 4.28, 58, 49, '—'),
  Eintracht: team('Eintracht', 1.86, 1.83, 4.52, 4.28, 58, 49, '—'),
  Freiburg: team('Freiburg', 1.38, 1.59, 4.45, 4.21, 66, 48, '—'),
  Gladbach: team('Gladbach', 1.14, 1.62, 4.07, 4.79, 57, 45, '—'),
  "Borussia M'Gladbach": team("Borussia M'Gladbach", 1.14, 1.62, 4.07, 4.79, 57, 45, '—'),
  Hamburger: team('Hamburger', 1.1, 1.55, 3.76, 5.59, 62, 65, '—'),
  Amburgo: team('Amburgo', 1.1, 1.55, 3.76, 5.59, 62, 65, '—'),
  Heidenheim: team('Heidenheim', 1.1, 2.17, 4.45, 4.79, 52, 44, '—'),
  Hoffenheim: team('Hoffenheim', 1.83, 1.48, 5.62, 5.03, 79, 59, '—'),
  'TSG Hoffenheim': team('TSG Hoffenheim', 1.83, 1.48, 5.62, 5.03, 79, 59, '—'),
  Koln: team('Koln', 1.41, 1.72, 4.62, 5.66, 73, 57, '—'),
  Colonia: team('Colonia', 1.41, 1.72, 4.62, 5.66, 73, 57, '—'),
  Leverkusen: team('Leverkusen', 2.0, 1.31, 5.28, 4.17, 84, 61, '—'),
  'Bayer 04 Leverkusen': team('Bayer 04 Leverkusen', 2.0, 1.31, 5.28, 4.17, 84, 61, '—'),
  Mainz: team('Mainz', 1.21, 1.45, 5.0, 4.52, 52, 66, '—'),
  '1. FSV Mainz 05': team('1. FSV Mainz 05', 1.21, 1.45, 5.0, 4.52, 52, 66, '—'),
  'RB Leipzig': team('RB Leipzig', 1.86, 1.21, 5.38, 4.34, 98, 44, '—'),
  'RB Lipsia': team('RB Lipsia', 1.86, 1.21, 5.38, 4.34, 98, 44, '—'),
  'St Pauli': team('St Pauli', 0.86, 1.72, 4.38, 5.0, 42, 44, '—'),
  'FC St. Pauli': team('FC St. Pauli', 0.86, 1.72, 4.38, 5.0, 42, 44, '—'),
  Stuttgart: team('Stuttgart', 2.03, 1.28, 5.45, 4.0, 91, 58, '—'),
  'VfB Stuttgart': team('VfB Stuttgart', 2.03, 1.28, 5.45, 4.0, 91, 58, '—'),
  Stoccarda: team('Stoccarda', 2.03, 1.28, 5.45, 4.0, 91, 58, '—'),
  'Union Berlin': team('Union Berlin', 1.14, 1.69, 4.86, 4.45, 60, 65, '—'),
  'Union Berlino': team('Union Berlino', 1.14, 1.69, 4.86, 4.45, 60, 65, '—'),
  'Werder Bremen': team('Werder Bremen', 1.07, 1.72, 4.52, 4.72, 71, 66, '—'),
  'SV Werder Bremen': team('SV Werder Bremen', 1.07, 1.72, 4.52, 4.72, 71, 66, '—'),
  'Werder Brema': team('Werder Brema', 1.07, 1.72, 4.52, 4.72, 71, 66, '—'),
  Wolfsburg: team('Wolfsburg', 1.34, 2.1, 4.03, 7.76, 57, 60, '—'),
  'VfL Wolfsburg': team('VfL Wolfsburg', 1.34, 2.1, 4.03, 7.76, 57, 60, '—'),

  // Ligue 1
  Angers: team('Angers', 0.83, 1.31, 3.55, 5.45, 33, 44, '—'),
  'Angers Sporting Club': team('Angers Sporting Club', 0.83, 1.31, 3.55, 5.45, 33, 44, '—'),
  Auxerre: team('Auxerre', 0.66, 1.21, 4.83, 4.55, 45, 60, '—'),
  'Association Jeunesse Auxerroise': team('Association Jeunesse Auxerroise', 0.66, 1.21, 4.83, 4.55, 45, 60, '—'),
  'AJ Auxerre': team('AJ Auxerre', 0.66, 1.21, 4.83, 4.55, 45, 60, '—'),
  Brest: team('Brest', 1.29, 1.5, 4.11, 5.5, 54, 56, '—'),
  'Stade Brestois 29': team('Stade Brestois 29', 1.29, 1.5, 4.11, 5.5, 54, 56, '—'),
  Lens: team('Lens', 1.89, 0.96, 5.75, 3.82, 91, 54, '—'),
  'Racing Club de Lens': team('Racing Club de Lens', 1.89, 0.96, 5.75, 3.82, 91, 54, '—'),
  'RC Lens': team('RC Lens', 1.89, 0.96, 5.75, 3.82, 91, 54, '—'),
  Strasbourg: team('Strasbourg', 1.64, 1.18, 4.18, 4.46, 55, 56, '—'),
  'RC Strasbourg Alsace': team('RC Strasbourg Alsace', 1.64, 1.18, 4.18, 4.46, 55, 56, '—'),
  'Racing Strasbourg': team('Racing Strasbourg', 1.64, 1.18, 4.18, 4.46, 55, 56, '—'),
  'Le Havre': team('Le Havre', 0.83, 1.17, 4.38, 4.72, 51, 56, '—'),
  'Le Havre AC': team('Le Havre AC', 0.83, 1.17, 4.38, 4.72, 51, 56, '—'),
  Lille: team('Lille', 1.66, 1.14, 5.72, 3.69, 79, 68, '—'),
  Lilla: team('Lilla', 1.66, 1.14, 5.72, 3.69, 79, 68, '—'),
  'Lille OSC Metropole': team('Lille OSC Metropole', 1.66, 1.14, 5.72, 3.69, 79, 68, '—'),
  Lorient: team('Lorient', 1.28, 1.45, 3.38, 5.14, 53, 51, '—'),
  'FC Lorient': team('FC Lorient', 1.28, 1.45, 3.38, 5.14, 53, 51, '—'),
  Lyon: team('Lyon', 1.45, 0.93, 5.31, 4.59, 60, 61, '—'),
  Lione: team('Lione', 1.45, 0.93, 5.31, 4.59, 60, 61, '—'),
  'Olympique Lyonnais': team('Olympique Lyonnais', 1.45, 0.93, 5.31, 4.59, 60, 61, '—'),
  Marseille: team('Marseille', 1.97, 1.24, 5.17, 3.45, 86, 68, '—'),
  'Olympique Marsiglia': team('Olympique Marsiglia', 1.97, 1.24, 5.17, 3.45, 86, 68, '—'),
  'Olympique de Marseille': team('Olympique de Marseille', 1.97, 1.24, 5.17, 3.45, 86, 68, '—'),
  Metz: team('Metz', 0.86, 2.07, 4.07, 5.0, 37, 51, '—'),
  'FC Metz': team('FC Metz', 0.86, 2.07, 4.07, 5.0, 37, 51, '—'),
  Monaco: team('Monaco', 1.66, 1.45, 4.79, 4.45, 64, 68, '—'),
  'AS Monaco FC': team('AS Monaco FC', 1.66, 1.45, 4.79, 4.45, 64, 68, '—'),
  Nantes: team('Nantes', 0.82, 1.57, 3.11, 5.68, 43, 61, '—'),
  'FC Nantes': team('FC Nantes', 0.82, 1.57, 3.11, 5.68, 43, 61, '—'),
  Nice: team('Nice', 1.1, 1.93, 5.21, 5.52, 54, 64, '—'),
  Nizza: team('Nizza', 1.1, 1.93, 5.21, 5.52, 54, 64, '—'),
  "OGC Nice Cote d'Azur": team("OGC Nice Cote d'Azur", 1.1, 1.93, 5.21, 5.52, 54, 64, '—'),
  PSG: team('PSG', 2.22, 0.81, 5.96, 2.89, 119, 26, '—'),
  'Paris Saint Germain FC': team('Paris Saint Germain FC', 2.22, 0.81, 5.96, 2.89, 119, 26, '—'),
  'Paris Saint-Germain': team('Paris Saint-Germain', 2.22, 0.81, 5.96, 2.89, 119, 26, '—'),
  Rennes: team('Rennes', 1.62, 1.41, 5.69, 4.59, 76, 52, '—'),
  'Stade Rennais FC': team('Stade Rennais FC', 1.62, 1.41, 5.69, 4.59, 76, 52, '—'),
  'Stade Rennais': team('Stade Rennais', 1.62, 1.41, 5.69, 4.59, 76, 52, '—'),
  Toulouse: team('Toulouse', 1.31, 1.31, 4.55, 4.72, 68, 69, '—'),
  Tolosa: team('Tolosa', 1.31, 1.31, 4.55, 4.72, 68, 69, '—'),
  'Toulouse FC': team('Toulouse FC', 1.31, 1.31, 4.55, 4.72, 68, 69, '—'),
  Paris: team('Paris', 1.24, 1.55, 4.31, 5.72, 54, 58, '—'),
  'Paris FC': team('Paris FC', 1.24, 1.55, 4.31, 5.72, 54, 58, '—'),

  // La Liga
  Alaves: team('Alaves', 1.13, 1.45, 4.9, 4.81, 61, 73, '—'),
  'Alavés': team('Alavés', 1.13, 1.45, 4.9, 4.81, 61, 73, '—'),
  'Deportivo Alaves': team('Deportivo Alaves', 1.13, 1.45, 4.9, 4.81, 61, 73, '—'),
  'Athletic Club': team('Athletic Club', 1.03, 1.42, 5.65, 3.87, 80, 72, '—'),
  'Athletic Bilbao': team('Athletic Bilbao', 1.03, 1.42, 5.65, 3.87, 80, 72, '—'),
  'Atletico Madrid': team('Atletico Madrid', 1.52, 1.03, 6.48, 4.0, 74, 67, '—'),
  'Atlético Madrid': team('Atlético Madrid', 1.52, 1.03, 6.48, 4.0, 74, 67, '—'),
  'Atletico de Madrid': team('Atletico de Madrid', 1.52, 1.03, 6.48, 4.0, 74, 67, '—'),
  Barcelona: team('Barcelona', 2.68, 0.97, 7.26, 4.23, 137, 49, '—'),
  Barcellona: team('Barcellona', 2.68, 0.97, 7.26, 4.23, 137, 49, '—'),
  'FC Barcelona': team('FC Barcelona', 2.68, 0.97, 7.26, 4.23, 137, 49, '—'),
  Espanyol: team('Espanyol', 1.16, 1.48, 4.68, 4.55, 67, 73, '—'),
  Valencia: team('Valencia', 1.1, 1.42, 5.32, 4.48, 57, 62, '—'),
  Sevilla: team('Sevilla', 1.16, 1.65, 4.97, 4.61, 52, 91, '—'),
  'Sevilla FC': team('Sevilla FC', 1.16, 1.65, 4.97, 4.61, 52, 91, '—'),
  Siviglia: team('Siviglia', 1.16, 1.65, 4.97, 4.61, 52, 91, '—'),
  Osasuna: team('Osasuna', 1.16, 1.23, 3.52, 4.65, 55, 82, '—'),
  Betis: team('Betis', 1.42, 1.19, 4.48, 5.26, 85, 64, '—'),
  'Real Betis': team('Real Betis', 1.42, 1.19, 4.48, 5.26, 85, 64, '—'),
  Mallorca: team('Mallorca', 1.26, 1.48, 3.48, 6.61, 44, 72, '—'),
  'Rayo Vallecano': team('Rayo Vallecano', 0.94, 1.19, 6.03, 5.06, 77, 86, '—'),
  'Celta Vigo': team('Celta Vigo', 1.39, 1.26, 4.0, 4.45, 47, 58, '—'),
  'Celta de Vigo': team('Celta de Vigo', 1.39, 1.26, 4.0, 4.45, 47, 58, '—'),
  'Real Oviedo': team('Real Oviedo', 0.77, 1.55, 3.77, 5.97, 37, 72, '—'),
  Levante: team('Levante', 1.13, 1.55, 3.9, 6.23, 59, 73, '—'),
  Getafe: team('Getafe', 0.87, 0.97, 4.39, 4.97, 34, 92, '—'),
  'Real Madrid': team('Real Madrid', 2.1, 0.9, 6.45, 3.45, 121, 62, '—'),
  Girona: team('Girona', 1.03, 1.42, 4.06, 5.42, 44, 69, '—'),
  'Real Sociedad': team('Real Sociedad', 1.55, 1.48, 5.9, 4.68, 69, 67, '—'),
  Elche: team('Elche', 1.19, 1.52, 3.71, 4.68, 50, 66, '—'),
  Villarreal: team('Villarreal', 1.77, 1.1, 3.9, 4.9, 62, 70, '—'),

  // Premier League
  Arsenal: team('Arsenal', 1.81, 0.72, 5.97, 3.19, 87, 41, 'W W D W W'),
  'AFC Bournemouth': team('AFC Bournemouth', 1.5, 1.47, 5.56, 5.44, 78, 75, 'W D W W D'),
  Bournemouth: team('Bournemouth', 1.5, 1.47, 5.56, 5.44, 78, 75, 'W D W W D'),
  Brentford: team('Brentford', 1.47, 1.28, 4.69, 5.0, 45, 59, 'L D L D W'),
  Everton: team('Everton', 1.16, 1.13, 4.31, 5.09, 51, 59, 'W W L D W'),
  Burnley: team('Burnley', 0.94, 1.84, 3.72, 5.88, 33, 56, 'L L D D L'),
  'Brighton & Hove Albion': team('Brighton & Hove Albion', 1.31, 1.03, 4.66, 4.94, 68, 80, 'D D D L D'),
  Brighton: team('Brighton', 1.31, 1.03, 4.66, 4.94, 68, 80, 'D D D L D'),
  Liverpool: team('Liverpool', 1.56, 1.31, 5.97, 4.59, 98, 50, 'W W L D W'),
  'Aston Villa': team('Aston Villa', 1.25, 1.16, 5.28, 4.84, 68, 50, 'W L W D W'),
  Fulham: team('Fulham', 1.22, 1.34, 4.84, 5.69, 66, 65, 'D D L D D'),
  'Crystal Palace': team('Crystal Palace', 1.1, 1.13, 4.19, 4.81, 56, 64, 'D D D W L'),
  Newcastle: team('Newcastle', 1.41, 1.41, 6.5, 4.94, 70, 56, 'D L L W W'),
  'Newcastle United': team('Newcastle United', 1.41, 1.41, 6.5, 4.94, 70, 56, 'D L L W W'),
  Sunderland: team('Sunderland', 0.94, 1.09, 3.53, 5.22, 40, 70, 'L L L L L'),
  Tottenham: team('Tottenham', 1.22, 1.59, 5.22, 4.88, 52, 82, 'L D L L D'),
  'Tottenham Hotspur': team('Tottenham Hotspur', 1.22, 1.59, 5.22, 4.88, 52, 82, 'L D L L D'),
  'Nottingham Forest': team('Nottingham Forest', 1.0, 1.28, 5.41, 4.84, 67, 51, 'D D D L D'),
  'Nottm Forest': team('Nottm Forest', 1.0, 1.28, 5.41, 4.84, 67, 51, 'D D D L D'),
  Chelsea: team('Chelsea', 1.63, 1.28, 6.16, 4.38, 77, 81, 'D W W W L'),
  'Manchester City': team('Manchester City', 1.94, 0.9, 5.87, 3.71, 88, 57, 'W W W D W'),
  'Man City': team('Man City', 1.94, 0.9, 5.87, 3.71, 88, 57, 'W W W D W'),
  'Manchester United': team('Manchester United', 1.69, 1.34, 4.78, 4.8, 100, 52, 'W W W W W'),
  'Man United': team('Man United', 1.69, 1.34, 4.78, 4.8, 100, 52, 'W W W W W'),
  Leeds: team('Leeds', 1.22, 1.5, 4.5, 4.59, 66, 52, 'L D D D D'),
  'Leeds Utd': team('Leeds Utd', 1.22, 1.5, 4.5, 4.59, 66, 52, 'L D D D D'),
  'West Ham': team('West Ham', 1.19, 1.72, 5.03, 6.41, 44, 58, 'L D D D D'),
  'West Ham United': team('West Ham United', 1.19, 1.72, 5.03, 6.41, 44, 58, 'L D D D D'),
  Wolverhampton: team('Wolverhampton', 0.72, 1.69, 3.16, 6.0, 34, 71, 'D L D D D'),
  Wolves: team('Wolves', 0.72, 1.69, 3.16, 6.0, 34, 71, 'D L D D D'),

  // Serie A
  Inter: team('Inter', 2.25, 0.91, 6.53, 2.66, 116, 58, 'W W W L D'),
  Juventus: team('Juventus', 1.66, 0.84, 5.13, 4.09, 105, 43, 'L W D D W'),
  Como: team('Como', 1.72, 0.81, 4.06, 3.19, 85, 70, 'D L W D D'),
  Atalanta: team('Atalanta', 1.38, 0.84, 5.94, 4.22, 90, 50, 'W W W D W'),
  Bologna: team('Bologna', 1.28, 1.13, 4.63, 4.16, 74, 62, 'L L W L L'),
  Napoli: team('Napoli', 1.5, 0.97, 5.34, 2.88, 71, 44, 'L W L W W'),
  Fiorentina: team('Fiorentina', 1.13, 1.34, 4.56, 4.66, 73, 72, 'L D D L D'),
  Genoa: team('Genoa', 1.19, 1.34, 3.69, 5.06, 58, 59, 'W L W W L'),
  Milan: team('Milan', 1.47, 0.81, 4.56, 4.41, 77, 50, '—'),
  'AC Milan': team('AC Milan', 1.47, 0.81, 4.56, 4.41, 77, 50, '—'),
  Roma: team('Roma', 1.41, 0.88, 4.94, 3.19, 69, 59, '—'),
  'AS Roma': team('AS Roma', 1.41, 0.88, 4.94, 3.19, 69, 59, '—'),
  Torino: team('Torino', 1.09, 1.69, 3.88, 4.56, 59, 62, '—'),
  Verona: team('Verona', 0.69, 1.63, 3.94, 4.72, 53, 75, '—'),
  'Hellas Verona': team('Hellas Verona', 0.69, 1.63, 3.94, 4.72, 53, 75, '—'),
  Cagliari: team('Cagliari', 1.03, 1.38, 3.47, 5.28, 43, 72, 'L D L L L'),
  Lecce: team('Lecce', 0.66, 1.38, 4.47, 5.56, 38, 55, 'L L L L L'),
  Lazio: team('Lazio', 0.94, 0.94, 3.81, 4.03, 50, 68, 'D D D L D'),
  Parma: team('Parma', 0.66, 1.22, 3.91, 4.53, 49, 58, 'D L W D L'),
  Udinese: team('Udinese', 1.16, 1.28, 4.31, 4.84, 52, 63, '—'),
  Sassuolo: team('Sassuolo', 1.19, 1.28, 3.88, 4.75, 45, 73, 'L W W L D'),
  Pisa: team('Pisa', 0.69, 1.78, 3.66, 4.75, 37, 65, '—'),
  Cremonese: team('Cremonese', 0.81, 1.44, 3.28, 6.44, 30, 68, 'L L L L W'),

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
