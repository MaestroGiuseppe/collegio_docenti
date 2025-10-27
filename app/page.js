'use client';

export default function Home() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <h1 style={{ fontSize: '4rem', marginBottom: '40px', color: 'white', textShadow: '2px 2px 4px rgba(0,0,0,0.4)' }}>
        PANNELLO DI CONTROLLO VOTAZIONE
      </h1>
      <div style={{ display: 'flex', gap: '50px' }}>
        <a
          href="/vote"
          style={{
            padding: '30px 60px',
            fontSize: '2rem',
            backgroundColor: '#22c55e',
            color: 'white',
            borderRadius: '15px',
            fontWeight: 'bold',
            textDecoration: 'none',
            boxShadow: '0 6px 12px rgba(34, 197, 94, 0.5)',
          }}
        >
          Vai alla schermata di voto
        </a>
        <a
          href="/admin"
          style={{
            padding: '30px 60px',
            fontSize: '2rem',
            backgroundColor: '#3b82f6',
            color: 'white',
            borderRadius: '15px',
            fontWeight: 'bold',
            textDecoration: 'none',
            boxShadow: '0 6px 12px rgba(59, 130, 246, 0.5)',
          }}
        >
          Pannello amministratore
        </a>
      </div>
    </div>
  );
}
