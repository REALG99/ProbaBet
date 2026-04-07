export const metadata = {
  title: 'Betting SaaS Pro',
  description: 'Calendario e analisi partite',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  );
}
