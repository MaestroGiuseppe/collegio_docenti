'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function VotePage() {
  const [nome, setNome] = useState('');
  const [cognome, setCognome] = useState('');
  const [sessionCode, setSessionCode] = useState('');
  const [step, setStep] = useState(1);
  const [isVotingActive, setIsVotingActive] = useState(false);
  const [message, setMessage] = useState('');
  const [voteSent, setVoteSent] = useState(false);

  async function verificaSessione() {
    setMessage('');
    if (!sessionCode) {
      setMessage('Inserisci il codice sessione.');
      return;
    }
    if (!nome || !cognome) {
      setMessage('Inserisci nome e cognome.');
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
    setIsVotingActive(true);
    setStep(2);
    setMessage('');
  }

  async function submitVote(vote) {
    setMessage('');
    const userFullName = nome.trim() + ' ' + cognome.trim();
    if (!userFullName) {
      setMessage('Nome e cognome obbligatori.');
      return;
    }
    const { error } = await supabase
      .from('votes')
      .insert([{ user_name: userFullName, session_code: sessionCode, vote }]);
    if (error) {
      setMessage('Hai già espresso il tuo voto per questa sessione.');
    } else {
      setVoteSent(true);
      setMessage('Voto registrato! Grazie per la partecipazione.');
    }
  }

  function tornaIndietro() {
    setStep(1);
    setMessage('');
    setVoteSent(false);
    setIsVotingActive(false);
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
      {step === 1 && (
        <>
          <h1 style={{ fontSize: '3rem', marginBottom: 24 }}>Inserisci i tuoi dati</h1>
          <input
            type="text"
            placeholder="Nome"
            value={nome}
            onChange={e => setNome(e.target.value)}
            style={{
              marginBottom: 20,
              padding: 12,
              fontSize: '1.2rem',
              borderRadius: 8,
              border: 'none',
              width: 250,
              display: 'block',
            }}
          />
          <input
            type="text"
            placeholder="Cognome"
            value={cognome}
            onChange={e => setCognome(e.target.value)}
            style={{
              marginBottom: 20,
              padding: 12,
              fontSize: '1.2rem',
              borderRadius: 8,
              border: 'none',
              width: 250,
              display: 'block',
            }}
          />
          <input
            type="text"
            placeholder="Codice sessione"
            value={sessionCode}
            onChange={e => setSessionCode(e.target.value)}
            style={{
              marginBottom: 30,
              padding: 12,
              fontSize: '1.2rem',
              borderRadius: 8,
              border: 'none',
              width: 250,
              display: 'block',
            }}
          />
          <button
            onClick={verificaSessione}
            style={{
              padding: '15px 35px',
              fontSize: '1.25rem',
              backgroundColor: '#22c55e',
              borderRadius: 12,
              border: 'none',
              color: 'white',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 5px 15px rgba(34,197,94,0.3)',
            }}
          >
            Verifica
          </button>
          {message && <p style={{ marginTop: 20, color: '#ffecb3' }}>{message}</p>}
        </>
      )}

      {step === 2 && (
        <>
          <h1 style={{ fontSize: '3rem', marginBottom: 24 }}>Esprimi il tuo voto</h1>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center' }}>
            <button
              onClick={() => submitVote('favorevole')}
              disabled={voteSent}
              style={{
                width: 250,
                padding: '16px 0',
                backgroundColor: '#10b981',
                fontSize: '1.5rem',
                color: 'white',
                borderRadius: 12,
                border: 'none',
                fontWeight: 'bold',
                cursor: voteSent ? 'default' : 'pointer',
                boxShadow: '0 6px 12px rgba(16,185,129,0.3)',
                opacity: voteSent ? 0.6 : 1,
              }}
            >
              Favorevole
            </button>
            <button
              onClick={() => submitVote('contrario')}
              disabled={voteSent}
              style={{
                width: 250,
                padding: '16px 0',
                backgroundColor: '#ef4444',
                fontSize: '1.5rem',
                color: 'white',
                borderRadius: 12,
                border: 'none',
                fontWeight: 'bold',
                cursor: voteSent ? 'default' : 'pointer',
                boxShadow: '0 6px 12px rgba(239,68,68,0.3)',
                opacity: voteSent ? 0.6 : 1,
              }}
            >
              Contrario
            </button>
            <button
              onClick={() => submitVote('astenuto')}
              disabled={voteSent}
              style={{
                width: 250,
                padding: '16px 0',
                backgroundColor: '#fbbf24',
                fontSize: '1.5rem',
                color: 'white',
                borderRadius: 12,
                border: 'none',
                fontWeight: 'bold',
                cursor: voteSent ? 'default' : 'pointer',
                boxShadow: '0 6px 12px rgba(251,191,36,0.3)',
                opacity: voteSent ? 0.6 : 1,
              }}
            >
              Astenuto
            </button>
          </div>
          {message && <p style={{ marginTop: 20, color: '#d1fae5', fontWeight: 'bold' }}>{message}</p>}
          {voteSent && (
            <button
              onClick={tornaIndietro}
              style={{
                marginTop: 40,
                padding: '12px 30px',
                fontSize: '1.1rem',
                borderRadius: 10,
                border: 'none',
                backgroundColor: '#2563eb',
                color: 'white',
                cursor: 'pointer',
              }}
            >
              Modifica dati
            </button>
          )}
        </>
      )}
    </div>
  );

  function tornaIndietro() {
    setStep(1);
    setMessage('');
    setVoteSent(false);
    setIsVotingActive(false);
    setNome('');
    setCognome('');
    setSessionCode('');
  }
}
