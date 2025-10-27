'use client';

export default function VotePage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        color: 'white',
      }}
    >
      <h1 style={{ fontSize: '3rem', marginBottom: 24 }}>Schermata Docente per Voting</h1>
      <p style={{ fontSize: '1.4rem' }}>Qui puoi implementare la tua logica di voto personalizzata.</p>
    </div>
  );
}
