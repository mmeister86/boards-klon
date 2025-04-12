export default function NotFound() {
  return (
    <html lang="de">
      <head>
        <title>Board nicht gefunden</title>
      </head>
      <body>
        <main className="min-h-screen flex items-center justify-center bg-muted">
          <div className="bg-card p-8 rounded-lg shadow-lg max-w-md text-center">
            <h1 className="text-2xl font-bold mb-4">Board nicht gefunden</h1>
            <p className="text-muted-foreground mb-6">
              Das gesuchte Board existiert nicht oder wurde nicht
              veröffentlicht.
            </p>
            <a
              href="/"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              Zurück zur Startseite
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
