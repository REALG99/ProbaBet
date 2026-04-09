'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getTeamStatsMap, TeamStats } from '../../data/store';
import { supabase } from '../../lib/supabase';

type Fixture = {
  home: string;
  away: string;
  date: string;
  time: string;
  league: string;
};

function sortTs(match: Fixture): number {
  const parsed = new Date(`${match.date}T${match.time || '00:00'}:00`);
  if (Number.isNaN(parsed.getTime())) return Number.MAX_SAFE_INTEGER;
  return parsed.getTime();
}

function formatDate(date: string) {
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;
  return new Intl.DateTimeFormat('it-IT', { dateStyle: 'medium' }).format(parsed);
}

export default function DashboardClient({ fixtures }: { fixtures: Fixture[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState<TeamStats[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.replace('/login');
        return;
      }
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('betting_saas_has_session', '1');
      }
      setTeams(Object.values(getTeamStatsMap()).sort((a, b) => a.name.localeCompare(b.name)));
      setLoading(false);
    });
  }, [router]);

  const avgSummary = useMemo(() => {
    if (!teams.length) {
      return { avgGoals: 0, avgCorners: 0, avgCards: 0 };
    }
    const totals = teams.reduce(
      (acc, team) => {
        acc.goals += team.avgGoalsFor;
        acc.corners += team.corners;
        acc.cards += team.cards;
        return acc;
      },
      { goals: 0, corners: 0, cards: 0 },
    );

    return {
      avgGoals: Number((totals.goals / teams.length).toFixed(2)),
      avgCorners: Number((totals.corners / teams.length).toFixed(2)),
      avgCards: Number((totals.cards / teams.length).toFixed(2)),
    };
  }, [teams]);

  const orderedFixtures = useMemo(() => [...fixtures].sort((a, b) => sortTs(a) - sortTs(b)), [fixtures]);

  if (loading) {
    return (
      <main style={{ minHeight: '100vh', background: '#0a1020', color: '#fff', display: 'grid', placeItems: 'center' }}>
        Verifica sessione in corso...
      </main>
    );
  }

  return (
    <main style={{ minHeight: '100vh', background: '#0a1020', color: '#f6f8ff', padding: 20 }}>
      <section style={{ maxWidth: 1100, margin: '0 auto' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
          <div>
            <h1 style={{ margin: 0 }}>Dashboard Squadre (Sola lettura)</h1>
            <p style={{ opacity: 0.82, marginTop: 8 }}>
              Calendario settimanale caricato da `data/matches.csv` + statistiche squadre da `data/store.ts`.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Link href="/" style={{ background: '#1c2850', color: '#fff', padding: '9px 12px', borderRadius: 10 }}>
              Home
            </Link>
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                if (typeof window !== 'undefined') {
                  window.localStorage.removeItem('betting_saas_has_session');
                  document.cookie = 'betting_saas_auth=; path=/; max-age=0; samesite=lax';
                }
                router.replace('/login');
              }}
              style={{ background: '#a33544', color: '#fff', padding: '9px 12px', borderRadius: 10, border: 'none' }}
            >
              Logout
            </button>
          </div>
        </header>

        <div style={{ background: '#111933', border: '1px solid #25345f', borderRadius: 16, overflowX: 'auto', marginBottom: 14 }}>
          {!orderedFixtures.length ? (
            <p style={{ margin: 0, padding: 16, opacity: 0.82 }}>Nessuna partita disponibile</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
              <thead>
                <tr style={{ background: '#172246', textAlign: 'left' }}>
                  <th style={{ padding: 12 }}>Data</th>
                  <th style={{ padding: 12 }}>Ora</th>
                  <th style={{ padding: 12 }}>Casa</th>
                  <th style={{ padding: 12 }}>Trasferta</th>
                  <th style={{ padding: 12 }}>Competizione</th>
                </tr>
              </thead>
              <tbody>
                {orderedFixtures.map((m, idx) => (
                  <tr key={`${m.home}-${m.away}-${m.date}-${idx}`} style={{ borderTop: '1px solid #25345f' }}>
                    <td style={{ padding: 12 }}>{formatDate(m.date)}</td>
                    <td style={{ padding: 12 }}>{m.time}</td>
                    <td style={{ padding: 12, fontWeight: 600 }}>{m.home}</td>
                    <td style={{ padding: 12, fontWeight: 600 }}>{m.away}</td>
                    <td style={{ padding: 12 }}>{m.league}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 10, marginBottom: 14 }}>
          <div style={{ background: '#111933', border: '1px solid #25345f', borderRadius: 12, padding: 14 }}>
            <div style={{ opacity: 0.75, fontSize: 13 }}>Squadre disponibili</div>
            <strong style={{ fontSize: 24 }}>{teams.length}</strong>
          </div>
          <div style={{ background: '#111933', border: '1px solid #25345f', borderRadius: 12, padding: 14 }}>
            <div style={{ opacity: 0.75, fontSize: 13 }}>Media gol fatti</div>
            <strong style={{ fontSize: 24 }}>{avgSummary.avgGoals}</strong>
          </div>
          <div style={{ background: '#111933', border: '1px solid #25345f', borderRadius: 12, padding: 14 }}>
            <div style={{ opacity: 0.75, fontSize: 13 }}>Media corner</div>
            <strong style={{ fontSize: 24 }}>{avgSummary.avgCorners}</strong>
          </div>
          <div style={{ background: '#111933', border: '1px solid #25345f', borderRadius: 12, padding: 14 }}>
            <div style={{ opacity: 0.75, fontSize: 13 }}>Media cartellini</div>
            <strong style={{ fontSize: 24 }}>{avgSummary.avgCards}</strong>
          </div>
        </div>

        <div style={{ background: '#111933', border: '1px solid #25345f', borderRadius: 16, overflowX: 'auto' }}>
          {!teams.length ? (
            <p style={{ margin: 0, padding: 16, opacity: 0.82 }}>Nessun dato squadre presente in data/store.ts</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
              <thead>
                <tr style={{ background: '#172246', textAlign: 'left' }}>
                  <th style={{ padding: 12 }}>Squadra</th>
                  <th style={{ padding: 12 }}>Gol fatti</th>
                  <th style={{ padding: 12 }}>Gol subiti</th>
                  <th style={{ padding: 12 }}>Tiri</th>
                  <th style={{ padding: 12 }}>Tiri in porta</th>
                  <th style={{ padding: 12 }}>Corner</th>
                  <th style={{ padding: 12 }}>Cartellini</th>
                  <th style={{ padding: 12 }}>Forma (5)</th>
                </tr>
              </thead>
              <tbody>
                {teams.map((team) => (
                  <tr key={team.name} style={{ borderTop: '1px solid #25345f' }}>
                    <td style={{ padding: 12, fontWeight: 600 }}>{team.name}</td>
                    <td style={{ padding: 12 }}>{team.avgGoalsFor}</td>
                    <td style={{ padding: 12 }}>{team.avgGoalsAgainst}</td>
                    <td style={{ padding: 12 }}>{team.shots}</td>
                    <td style={{ padding: 12 }}>{team.shotsOnTarget}</td>
                    <td style={{ padding: 12 }}>{team.corners}</td>
                    <td style={{ padding: 12 }}>{team.cards}</td>
                    <td style={{ padding: 12 }}>{team.form.join('-')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </main>
  );
}
