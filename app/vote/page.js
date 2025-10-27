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
