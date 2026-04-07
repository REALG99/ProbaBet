import fs from 'node:fs';
import path from 'node:path';

export type CsvMatch = {
  home: string;
  away: string;
  date: string;
  time: string;
  league: string;
};

const CSV_PATH = path.join(process.cwd(), 'data', 'matches.csv');

function parseLine(line: string): string[] {
  return line.split(',').map((cell) => cell.trim());
}

function readMatchesFromCsv(): CsvMatch[] {
  if (!fs.existsSync(CSV_PATH)) return [];

  const raw = fs.readFileSync(CSV_PATH, 'utf8').trim();
  if (!raw) return [];

  const rows = raw.split(/\r?\n/);
  if (rows.length <= 1) return [];

  const dataRows = rows.slice(1).filter((row) => row.trim().length > 0);

  return dataRows
    .map((row) => {
      const [home, away, date, time, league] = parseLine(row);
      if (!home || !away || !date || !time || !league) return null;
      return { home, away, date, time, league };
    })
    .filter((match): match is CsvMatch => Boolean(match));
}

export const matches: CsvMatch[] = readMatchesFromCsv();
