'use client';

export default function VotePage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
        color: 'white',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        textAlign: 'center',
      }}
    >
      <h1 style={{ fontSize: '3rem', marginBottom: 24 }}>Schermata Docente per Voto</h1>
      <p style={{ fontSize: '1.4rem' }}>Implementa qui la logica di voto personalizzata.</p>
    </div>
  );
}
