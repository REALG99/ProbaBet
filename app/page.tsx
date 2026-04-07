import Link from 'next/link';
import { matches } from '../data/matches';

function sortTs(match: { date: string; time: string }): number {
  const parsed = new Date(`${match.date}T${match.time || '00:00'}:00`);
  if (Number.isNaN(parsed.getTime())) return Number.MAX_SAFE_INTEGER;
  return parsed.getTime();
}

function formatDate(date: string) {
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return date || 'Data non disponibile';
  return new Intl.DateTimeFormat('it-IT', { dateStyle: 'medium' }).format(parsed);
}

function formatTime(time: string) {
  if (!time) return 'Ora non disponibile';
  return time.slice(0, 5);
}

export default function HomePage() {
  const ordered = [...matches].sort((a, b) => sortTs(a) - sortTs(b));

  return (
    <main style={{ minHeight: '100vh', background: '#0b1020', color: '#f6f8ff', padding: '32px 18px' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
            alignItems: 'center',
            marginBottom: 24,
          }}
        >
          <h1 style={{ fontSize: 34, margin: 0 }}>Calendario Partite Europee</h1>
          <div style={{ display: 'flex', gap: 10 }}>
            <Link href="/login" style={{ padding: '10px 14px', borderRadius: 12, background: '#1a2446', color: '#fff' }}>
              Login
            </Link>
            <Link
              href="/dashboard"
              style={{ padding: '10px 14px', borderRadius: 12, background: '#3453f6', color: '#fff', fontWeight: 600 }}
            >
              Dashboard
            </Link>
          </div>
        </header>

        {!ordered.length ? (
          <div
            style={{
              background: '#111933',
              border: '1px solid #25345f',
              borderRadius: 14,
              padding: 16,
              opacity: 0.9,
            }}
          >
            Nessuna partita disponibile
          </div>
        ) : (
          <section
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 16,
            }}
          >
            {ordered.map((match, index) => {
              const eventId = `${match.home}-${match.away}-${match.date}-${index}`;
              const href = `/match/${encodeURIComponent(eventId)}?home=${encodeURIComponent(match.home)}&away=${encodeURIComponent(
                match.away,
              )}&comp=${encodeURIComponent(match.league)}&date=${encodeURIComponent(`${match.date}T${match.time}`)}`;

              return (
                <article
                  key={eventId}
                  style={{
                    background: 'linear-gradient(180deg,#111a35,#0e1730)',
                    border: '1px solid #293760',
                    borderRadius: 16,
                    padding: 18,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                  }}
                >
                  <span style={{ color: '#7aa2ff', fontSize: 13, fontWeight: 600 }}>{match.league}</span>
                  <strong style={{ fontSize: 20 }}>{match.home}</strong>
                  <span style={{ fontWeight: 700, opacity: 0.7 }}>vs</span>
                  <strong style={{ fontSize: 20 }}>{match.away}</strong>
                  <p style={{ margin: 0, opacity: 0.84 }}>Data: {formatDate(match.date)}</p>
                  <p style={{ margin: 0, opacity: 0.84 }}>Ora: {formatTime(match.time)}</p>
                  <Link
                    href={href}
                    style={{
                      marginTop: 8,
                      display: 'inline-block',
                      textAlign: 'center',
                      padding: '10px 12px',
                      borderRadius: 10,
                      background: '#3453f6',
                      color: '#fff',
                      fontWeight: 600,
                    }}
                  >
                    Apri analisi partita
                  </Link>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
}
