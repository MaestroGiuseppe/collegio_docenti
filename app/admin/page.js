'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

function arrayToCSV(data) {
  if (!data.length) return '';
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(row => Object.values(row).map(v => `"${v}"`).join(','));
  return [headers, ...rows].join('\n');
}

export default function AdminPage() {
  const [sessionCode, setSessionCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [deliberaNumber, setDeliberaNumber] = useState(null);
  const [loading, setLoading] = useState(false);

  const [voteStats, setVoteStats] = useState({
    presenti: 0,
    favorevoli: 0,
    contrari: 0,
    astenuti: 0,
    totale: 0,
  });

  useEffect(() => {
    fetchSession();
    fetchStats();

    const subscription = supabase
      .channel('votes-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'votes' },
        () => {
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [sessionCode]);

  async function fetchSession() {
    const { data } = await supabase
      .from('sessions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);
    if (data?.length) {
      setSessionCode(data[0].code);
      setIsActive(data[0].is_active);
      setDeliberaNumber(data[0].delibera_number || 0);
    } else {
      setSessionCode('');
      setIsActive(false);
      setDeliberaNumber(0);
    }
  }

  async function fetchStats() {
    if (!sessionCode) return;

    const { count: presenti } = await supabase
      .from('votes')
      .select('*', { count: 'exact' })
      .eq('session_code', sessionCode);

    const favorevoli = await countVotes(sessionCode, 'favorevole');
    const contrari = await countVotes(sessionCode, 'contrario');
    const astenuti = await countVotes(sessionCode, 'astenuto');

    setVoteStats({
      presenti,
      favorevoli,
      contrari,
      astenuti,
      totale: favorevoli + contrari + astenuti,
    });
  }

  async function countVotes(sessionCode, tipo) {
    const { count } = await supabase
      .from('votes')
      .select('*', { count: 'exact' })
      .eq('session_code', sessionCode)
      .eq('vote', tipo);
    return count || 0;
  }

  async function handleSetCode() {
    if (!inputCode) {
      alert('Inserisci un codice valido');
      return;
    }
    setLoading(true);

    const { data: existingSession } = await supabase
      .from('sessions')
      .select('code')
      .eq('code', inputCode)
      .single();

    if (!existingSession) {
      await supabase.from('sessions').insert([{ code: inputCode, is_active: false, delibera_number: 0 }]);
      setDeliberaNumber(0);
    }
    setSessionCode(inputCode);
    setInputCode('');
    setIsActive(false);
    setLoading(false);
  }

  async function toggleVoting() {
    if (!sessionCode) return;
    setLoading(true);

    if (!isActive) {
      const { data, error } = await supabase
        .from('sessions')
        .select('delibera_number')
        .eq('code', sessionCode)
        .single();

      let newDeliberaNumber = 1;
      if (!error && data && data.delibera_number !== null) {
        newDeliberaNumber = data.delibera_number + 1;
      }

      await supabase
        .from('sessions')
        .update({ is_active: true, delibera_number: newDeliberaNumber })
        .eq('code', sessionCode);

      setDeliberaNumber(newDeliberaNumber);
      setIsActive(true);
    } else {
      await supabase
        .from('sessions')
        .update({ is_active: false })
        .eq('code', sessionCode);

      setIsActive(false);
    }

    setLoading(false);
  }

  async function exportPresenze() {
    if (!sessionCode) {
      alert('Imposta prima un codice sessione');
      return;
    }
    const { data } = await supabase
      .from('votes')
      .select('user_name,vote')
      .eq('session_code', sessionCode);
    const csv = arrayToCSV(data || []);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `presenze_sessione_${sessionCode}.csv`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
        color: 'white',
        padding: 30,
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <h1
        style={{
          fontSize: '3rem',
          marginBottom: 30,
          fontWeight: 'bold',
          textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
        }}
      >
        PANNELLO DI CONTROLLO VOTAZIONE
      </h1>

      <p style={{ fontSize: '1.5rem', marginBottom: 15 }}>
        Delibera n°: <b>{deliberaNumber || 'N/A'}</b>
      </p>

      <div style={{ marginBottom: 30 }}>
        <input
          type="text"
          placeholder="Inserisci codice sessione"
          value={inputCode}
          onChange={(e) => setInputCode(e.target.value)}
          disabled={loading}
          style={{
            padding: 15,
            fontSize: '1.25rem',
            borderRadius: 10,
            border: 'none',
            marginRight: 10,
            width: '320px',
          }}
        />
        <button
          onClick={handleSetCode}
          disabled={loading}
          style={{
            padding: '15px 30px',
            fontSize: '1.1rem',
            fontWeight: '600',
            borderRadius: 10,
            border: 'none',
            backgroundColor: '#22c55e',
            color: 'white',
            cursor: 'pointer',
            boxShadow: '0 4px 8px rgba(34,197,94,0.4)',
          }}
        >
          Salva Codice
        </button>
      </div>

      <p style={{ fontSize: '1.2rem', marginBottom: 20 }}>
        Codice sessione attuale: <b>{sessionCode || 'Nessun codice impostato'}</b>
      </p>

      <button
        onClick={toggleVoting}
        disabled={loading || !sessionCode}
        style={{
          marginBottom: 25,
          padding: '20px 60px',
          fontSize: '1.6rem',
          borderRadius: 15,
          border: 'none',
          backgroundColor: isActive ? '#ef4444' : '#10b981',
          color: 'white',
          fontWeight: '700',
          cursor: 'pointer',
          boxShadow: `0 8px 16px ${isActive ? 'rgba(239, 68, 68, 0.5)' : 'rgba(16, 185, 129, 0.6)'}`,
        }}
      >
        {isActive ? 'Disattiva votazione' : 'Attiva votazione'}
      </button>

      <hr style={{ margin: '30px 0', borderColor: 'rgba(255,255,255,0.3)', width: '60%' }} />

      <h2 style={{ marginBottom: 10, fontSize: '2rem' }}>Statistiche tempo reale</h2>
      <p>Presenze: {voteStats.presenti}</p>
      <p>Voti favorevoli: {voteStats.favorevoli}</p>
      <p>Voti contrari: {voteStats.contrari}</p>
      <p>Voti astenuti: {voteStats.astenuti}</p>
      <p style={{ fontWeight: 'bold', fontSize: '1.35rem' }}>Totale voti: {voteStats.totale}</p>

      <button
        onClick={exportPresenze}
        disabled={!sessionCode}
        style={{
          marginTop: 35,
          padding: '14px 40px',
          fontSize: '1.1rem',
          borderRadius: 12,
          border: 'none',
          backgroundColor: '#2563eb',
          color: 'white',
          fontWeight: '600',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
        }}
      >
        Esporta presenze CSV
      </button>
    </div>
  );
}
