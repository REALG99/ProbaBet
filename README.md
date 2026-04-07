# Betting SaaS Pro

## Setup rapido

1. Installa dipendenze:

```bash
npm install
```

2. Avvia sviluppo:

```bash
npm run dev
```

## Calendario partite (SOLO CSV locale)

La home **NON usa API** e **NON fa fetch online**.

Legge solo il file locale:

- `data/matches.csv`

Formato obbligatorio CSV:

```csv
HomeTeam,AwayTeam,Date,Time,League
Juventus,Inter,2026-04-10,20:45,Serie A
Real Madrid,Barcelona,2026-04-11,21:00,La Liga
```

## Regole importanti

- Nessun dato online
- Nessun fallback API
- Nessun array statico inventato
- Se il CSV è vuoto: "Nessuna partita disponibile"