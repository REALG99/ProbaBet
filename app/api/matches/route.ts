import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const LEAGUES = ['4328', '4332', '4335', '4331', '4334', '4480'];

type SportsDbEvent = {
  idEvent: string;
  strHomeTeam: string;
  strAwayTeam: string;
  strEvent?: string;
  dateEvent: string;
  strTime: string;
  strLeague: string;
  strTimestamp?: string;
};

function parseTeams(event: SportsDbEvent) {
  if (event.strHomeTeam && event.strAwayTeam) {
    return { home: event.strHomeTeam, away: event.strAwayTeam };
  }

  const label = event.strEvent || '';
  const chunks = label.split(' vs ');
  if (chunks.length !== 2) return null;
  return { home: chunks[0].trim(), away: chunks[1].trim() };
}

function kickoffIso(date: string, time: string, timestamp?: string) {
  if (timestamp) {
    const parsed = new Date(timestamp);
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString();
  }

  if (!date) return '';
  if (!time) return `${date}T00:00:00.000Z`;
  const hasTimezone = /(?:Z|[+-]\d{2}:\d{2})$/.test(time);
  const normalized = hasTimezone ? `${date}T${time}` : `${date}T${time}Z`;
  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toISOString();
}

export async function GET() {
  const apiKey = process.env.THESPORTSDB_API_KEY || process.env.NEXT_PUBLIC_THESPORTSDB_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        matches: [],
        reason: 'Config mancante: imposta THESPORTSDB_API_KEY (o NEXT_PUBLIC_THESPORTSDB_API_KEY) nel file .env.local',
        diagnostics: [],
      },
      { status: 500 },
    );
  }

  try {
    const diagnostics: Array<{ leagueId: string; status: number | null; count: number }> = [];

    const chunks = await Promise.all(
      LEAGUES.map(async (leagueId) => {
        const url = `https://www.thesportsdb.com/api/v1/json/${apiKey}/eventsnextleague.php?id=${leagueId}`;
        const response = await fetch(url, {
          cache: 'no-store',
          headers: { Accept: 'application/json' },
        });
        if (!response.ok) {
          diagnostics.push({ leagueId, status: response.status, count: 0 });
          return [] as SportsDbEvent[];
        }
        const payload = await response.json();
        const events = Array.isArray(payload?.events) ? (payload.events as SportsDbEvent[]) : [];
        diagnostics.push({ leagueId, status: response.status, count: events.length });
        return events;
      }),
    );

    const matches = chunks
      .flat()
      .filter((event) => event?.idEvent && event?.dateEvent)
      .map((event) => {
        const teams = parseTeams(event);
        if (!teams) return null;
        const kickoff = kickoffIso(event.dateEvent, event.strTime || '', event.strTimestamp);
        return {
          id: event.idEvent,
          home: teams.home,
          away: teams.away,
          date: event.dateEvent,
          time: event.strTime || '',
          league: event.strLeague || 'Competizione',
          kickoff,
        };
      })
      .filter((match): match is NonNullable<typeof match> => Boolean(match))
      .filter((match, index, arr) => arr.findIndex((x) => x.id === match.id) === index)
      .sort((a, b) => new Date(a.kickoff || `${a.date}T00:00:00.000Z`).getTime() - new Date(b.kickoff || `${b.date}T00:00:00.000Z`).getTime());

    const reason = matches.length ? '' : 'Nessun evento restituito da TheSportsDB per le leghe richieste';
    return NextResponse.json({ matches, reason, diagnostics });
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'Errore sconosciuto';
    return NextResponse.json({ matches: [], reason: detail, diagnostics: [] }, { status: 200 });
  }
}
