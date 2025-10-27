'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function VotePage() {
  const [userName, setUserName] = useState('');
  const [sessionCode, setSessionCode] = useState('');
  const [isSessionValid, setIsSessionValid] = useState(false);
  const [isVotingActive, setIsVotingActive] = useState(false);
  const [message, setMessage] = useState('');
  const [voteSent, setVoteSent] = useState(false);

  async function checkSession() {
    setMessage('');
    setIsSessionValid(false);
    setIsVotingActive(false);
    if (!sessionCode) {
      setMessage('Inserisci il codice sessione.');
      return;
    }
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('code', sessionCode)
      .single();
    if (error || !data) {
      setMessage('Codice sessione non valido.');
      return;
    }
    if (!data.is_active) {
      setMessage('La votazione non è attiva.');
      return;
    }
    setIsSessionValid(true);
    setIsVotingActive(true);
    setMessage('Sessione trovata! Ora puoi votare.');
  }

  async function submitVote(vote) {
    if (!userName) {
      setMessage('Inserisci prima il tuo nome.');
      return;
    }
    setMessage('');
    const { error } = await supabase
      .from('votes')
      .insert([{ user_name: userName, session_code: sessionCode, vote }]);
    if (error) {
      setMessage('Errore durante il voto (forse hai già votato).');
    } else {
      setVoteSent(true);
      setMessage('Voto registrato correttamente! Grazie.');
    }
  }

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
      <div style={{ marginBottom: 30 }}>
        <input
          type="text"
          placeholder="Il tuo nome"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          disabled={voteSent}
          style={{
            padding: 12,
            fontSize: '1.1rem',
            borderRadius: 8,
            border: 'none',
            marginRight: 18,
            width: 210,
          }}
        />
        <input
          type="text"
          placeholder="Codice sessione"
          value={sessionCode}
          onChange={(e) => setSessionCode(e.target.value)}
          disabled={voteSent}
          style={{
            padding: 12,
            fontSize: '1.1rem',
            borderRadius: 8,
            border: 'none',
            width: 170,
          }}
        />
        {!voteSent && (
          <button
            onClick={checkSession}
            style={{
              marginLeft: 18,
              padding: '14px 28px',
              fontSize: '1.12rem',
              borderRadius: 9,
              border: 'none',
              backgroundColor: '#22c55e',
              color: 'white',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 3px 8px rgba(34, 197, 94, 0.25)',
            }}
          >
            Verifica
          </button>
        )}
      </div>
      {message && (
        <div style={{ margin: '15px 0', color: voteSent ? '#16a34a' : '#fee440', fontWeight: 'bold' }}>
          {message}
        </div>
      )}
      {isVotingActive && !voteSent && (
        <div style={{ display: 'flex', gap: 30, marginTop: 18 }}>
          <button
            onClick={() => submitVote('favorevole')}
            style={{
              padding: '16px 40px',
              backgroundColor: '#10b981',
              fontSize: '1.3rem',
              color: 'white',
              borderRadius: 12,
              border: 'none',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 5px 10px rgba(16,185,129,0.3)',
            }}
          >
            Favorevole
          </button>
          <button
            onClick={() => submitVote('contrario')}
            style={{
              padding: '16px 40px',
              backgroundColor: '#ef4444',
              fontSize: '1.3rem',
              color: 'white',
              borderRadius: 12,
              border: 'none',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 5px 10px rgba(239,68,68,0.3)',
            }}
          >
            Contrario
          </button>
          <button
            onClick={() => submitVote('astenuto')}
            style={{
              padding: '16px 40px',
              backgroundColor: '#fbbf24',
              fontSize: '1.3rem',
              color: 'white',
              borderRadius: 12,
              border: 'none',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 5px 10px rgba(251,191,36,0.3)',
            }}
          >
            Astenuto
          </button>
        </div>
      )}
      {voteSent && (
        <div style={{ marginTop: 30, fontSize: '1.25rem', color: '#d1fae5' }}>
          Hai già espresso il tuo voto.
        </div>
      )}
    </div>
  );
}
