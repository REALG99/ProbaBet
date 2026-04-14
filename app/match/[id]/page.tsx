'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { calculateMatchProbabilities } from '../../../lib/calculations';
import { getTeamStats, TeamStats } from '../../../data/store';
import { supabase } from '../../../lib/supabase';

function StatRow({ label, home, away }: { label: string; home: string | number; away: string | number }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, padding: '7px 0', borderTop: '1px solid #23365f' }}>
      <strong>{home}</strong>
      <span style={{ textAlign: 'center', opacity: 0.78 }}>{label}</span>
      <strong style={{ textAlign: 'right' }}>{away}</strong>
    </div>
  );
}

function MarketRow({ label, value }: { label: string; value?: number }) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: '1px solid #23365f' }}>
      <span>{label}</span>
      <strong>{value}%</strong>
    </div>
  );
}

function hasRequiredStats(stats: TeamStats | null): stats is TeamStats {
  if (!stats) return false;
  const coreNumbers = [stats.avgGoalsFor, stats.avgGoalsAgainst, stats.shots, stats.corners, stats.cards];
  const hasCore = coreNumbers.every((value) => typeof value === 'number' && Number.isFinite(value));
  return hasCore;
}

export default function MatchAnalysisPage() {
  const router = useRouter();
  const params = useSearchParams();
  const homeName = params.get('home') || 'Home';
  const awayName = params.get('away') || 'Away';
  const competition = params.get('comp') || 'Competizione';
  const date = params.get('date') || new Date().toISOString();

  const homeStats = useMemo(() => getTeamStats(homeName), [homeName]);
  const awayStats = useMemo(() => getTeamStats(awayName), [awayName]);
  const [calculated, setCalculated] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [checkedAuth, setCheckedAuth] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.replace('/login');
        setCheckedAuth(true);
        return;
      }
      setAuthorized(true);
      setCheckedAuth(true);
    });
  }, [router]);

  const canCalculate = hasRequiredStats(homeStats) && hasRequiredStats(awayStats);
  const result = useMemo(() => {
    if (!canCalculate || !calculated) return null;
    return calculateMatchProbabilities(homeStats, awayStats);
  }, [canCalculate, calculated, homeStats, awayStats]);

  const topOutcome = useMemo(() => {
    if (!result) return null;
    const options = [
      { label: `1 (${homeName})`, value: result.oneXTwo.homeWin },
      { label: 'X', value: result.oneXTwo.draw },
      { label: `2 (${awayName})`, value: result.oneXTwo.awayWin },
    ].sort((a, b) => b.value - a.value);
    const best = options[0];
    return {
      ...best,
      recommendation: best.value >= 55 ? 'Conviene' : 'Rischio alto',
    };
  }, [result, homeName, awayName]);

  const suggestions = useMemo(() => {
    if (!result) return [];
    const picks: Array<{ market: string; value: number }> = [
      { market: `1 (${homeName})`, value: result.oneXTwo.homeWin },
      { market: 'X', value: result.oneXTwo.draw },
      { market: `2 (${awayName})`, value: result.oneXTwo.awayWin },
      { market: 'Over 1.5 Gol', value: result.goals?.over15 ?? NaN },
      { market: 'Over 2.5 Gol', value: result.goals?.over25 ?? NaN },
      { market: 'Over 3.5 Gol', value: result.goals?.over35 ?? NaN },
      { market: 'Goal', value: result.goalNoGoal?.goal ?? NaN },
      { market: 'No Goal', value: result.goalNoGoal?.noGoal ?? NaN },
      { market: 'Over 8.5 Corner', value: result.corners?.over85 ?? NaN },
      { market: 'Over 9.5 Corner', value: result.corners?.over95 ?? NaN },
      { market: 'Over 10.5 Corner', value: result.corners?.over105 ?? NaN },
    ]
      .filter((x) => Number.isFinite(x.value))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);

    return picks.map((pick) => ({
      ...pick,
      recommendation: pick.value >= 60 ? 'CONSIGLIATA' : pick.value >= 52 ? 'VALUTARE' : 'RISCHIO',
    }));
  }, [result, homeName, awayName]);

  if (!checkedAuth) return <main style={{ minHeight: '100vh', background: '#090f20' }} />;
  if (!authorized) return null;

  return (
    <main style={{ minHeight: '100vh', background: '#090f20', color: '#f6f8ff', padding: 18 }}>
      <section style={{ maxWidth: 980, margin: '0 auto' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', marginBottom: 18 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 30 }}>
              {homeName} vs {awayName}
            </h1>
            <p style={{ marginTop: 8, opacity: 0.82 }}>
              {competition} • {new Intl.DateTimeFormat('it-IT', { dateStyle: 'full', timeStyle: 'short' }).format(new Date(date))}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Link href="/" style={{ background: '#1d2b57', color: '#fff', borderRadius: 10, padding: '10px 12px' }}>
              Home
            </Link>
            <Link href="/dashboard" style={{ background: '#3355f4', color: '#fff', borderRadius: 10, padding: '10px 12px' }}>
              Dashboard
            </Link>
          </div>
        </header>

        {!homeStats || !awayStats ? (
          <article style={{ marginTop: 14, background: '#101935', border: '1px solid #243662', borderRadius: 14, padding: 14 }}>
            Nessun dato disponibile per questa partita
          </article>
        ) : (
          <>
            <article style={{ background: '#101935', border: '1px solid #243662', borderRadius: 14, padding: 14 }}>
              <h2 style={{ marginTop: 0 }}>Statistiche squadre</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', marginBottom: 8 }}>
                <strong>{homeName}</strong>
                <span style={{ textAlign: 'center', opacity: 0.78 }}>Metrica</span>
                <strong style={{ textAlign: 'right' }}>{awayName}</strong>
              </div>
              <StatRow label="Gol fatti" home={homeStats.avgGoalsFor} away={awayStats.avgGoalsFor} />
              <StatRow label="Gol subiti" home={homeStats.avgGoalsAgainst} away={awayStats.avgGoalsAgainst} />
              <StatRow label="Tiri medi a partita" home={homeStats.shots} away={awayStats.shots} />
              <StatRow
                label="Tiri in porta"
                home={typeof homeStats.shotsOnTarget === 'number' ? homeStats.shotsOnTarget : 'N/D'}
                away={typeof awayStats.shotsOnTarget === 'number' ? awayStats.shotsOnTarget : 'N/D'}
              />
              <StatRow label="Corner fatti" home={homeStats.corners} away={awayStats.corners} />
              <StatRow
                label="Corner concessi"
                home={typeof homeStats.cornersAgainst === 'number' ? homeStats.cornersAgainst : 'N/D'}
                away={typeof awayStats.cornersAgainst === 'number' ? awayStats.cornersAgainst : 'N/D'}
              />
              <StatRow label="Cartellini" home={homeStats.cards} away={awayStats.cards} />
              <StatRow
                label="Forma"
                home={homeStats.form.length ? homeStats.form.join('-') : 'N/D'}
                away={awayStats.form.length ? awayStats.form.join('-') : 'N/D'}
              />

              <button
                onClick={() => setCalculated(true)}
                style={{ marginTop: 14, background: '#3355f4', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 14px' }}
              >
                Calcola probabilità scommesse
              </button>
            </article>

            {calculated && result ? (
              <article style={{ marginTop: 14, background: '#101935', border: '1px solid #243662', borderRadius: 14, padding: 14 }}>
                <h2 style={{ marginTop: 0 }}>Risultati finali (percentuali)</h2>

                <h3 style={{ marginBottom: 8 }}>1X2</h3>
                <MarketRow label={`1 (${homeName})`} value={result.oneXTwo.homeWin} />
                <MarketRow label="X" value={result.oneXTwo.draw} />
                <MarketRow label={`2 (${awayName})`} value={result.oneXTwo.awayWin} />
                {topOutcome ? (
                  <div style={{ marginTop: 10, padding: '10px 12px', borderRadius: 10, background: '#0b1430', border: '1px solid #20315d' }}>
                    <strong>Scelta migliore: {topOutcome.label}</strong> — {topOutcome.value}% ({topOutcome.recommendation})
                  </div>
                ) : null}

                {result.goals ? (
                  <>
                    <h3 style={{ marginBottom: 8, marginTop: 14 }}>Over/Under Gol</h3>
                    <MarketRow label="Over 1.5" value={result.goals.over15} />
                    <MarketRow label="Under 1.5" value={result.goals.under15} />
                    <MarketRow label="Over 2.5" value={result.goals.over25} />
                    <MarketRow label="Under 2.5" value={result.goals.under25} />
                    <MarketRow label="Over 3.5" value={result.goals.over35} />
                    <MarketRow label="Under 3.5" value={result.goals.under35} />
                  </>
                ) : null}

                {result.goalNoGoal ? (
                  <>
                    <h3 style={{ marginBottom: 8, marginTop: 14 }}>Goal / No Goal</h3>
                    <MarketRow label="Goal" value={result.goalNoGoal.goal} />
                    <MarketRow label="No Goal" value={result.goalNoGoal.noGoal} />
                  </>
                ) : null}

                {result.corners ? (
                  <>
                    <h3 style={{ marginBottom: 8, marginTop: 14 }}>Corner Over/Under</h3>
                    <MarketRow label="Over 7.5" value={result.corners.over75} />
                    <MarketRow label="Under 7.5" value={result.corners.under75} />
                    <MarketRow label="Over 8.5" value={result.corners.over85} />
                    <MarketRow label="Under 8.5" value={result.corners.under85} />
                    <MarketRow label="Over 9.5" value={result.corners.over95} />
                    <MarketRow label="Under 9.5" value={result.corners.under95} />
                    <MarketRow label="Over 10.5" value={result.corners.over105} />
                    <MarketRow label="Under 10.5" value={result.corners.under105} />
                  </>
                ) : (
                  <p style={{ marginTop: 14, opacity: 0.78 }}>Corner O/U non calcolato: mancano corner concessi per almeno una squadra.</p>
                )}

                {suggestions.length ? (
                  <>
                    <h3 style={{ marginBottom: 8, marginTop: 16 }}>Suggerimenti principali</h3>
                    <div style={{ display: 'grid', gap: 8 }}>
                      {suggestions.map((pick) => (
                        <div
                          key={pick.market}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '10px 12px',
                            borderRadius: 10,
                            background: '#0b1430',
                            border: '1px solid #20315d',
                          }}
                        >
                          <span>{pick.market}</span>
                          <strong>
                            {pick.value}% • {pick.recommendation}
                          </strong>
                        </div>
                      ))}
                    </div>
                  </>
                ) : null}
              </article>
            ) : null}
          </>
        )}
      </section>
    </main>
  );
}
