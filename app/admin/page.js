'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function AdminPanel() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [participantCode, setParticipantCode] = useState('');
  const [presenceMsg, setPresenceMsg] = useState('');

  const [stats, setStats] = useState({
    presenti: 0,
    favorevoli: 0,
    contrari: 0,
    astenuti: 0,
    totale: 0,
  });

  // Carica l'ultima sessione attiva o comunque ultima inserita
  useEffect(() => {
    async function fetchLastSession() {
      setLoading(true);

      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        setError('Errore caricamento sessione.');
        setLoading(false);
        return;
      }

      if (data.length === 0) {
        setError('Nessuna sessione disponibile.');
        setLoading(false);
        return;
      }

      setSession(data[0]);
      setLoading(false);
    }

    fetchLastSession();
  }, []);

  // Aggiorna statistiche voti ogni 3 secondi
  useEffect(() => {
    if (!session) return;

    async function loadStats() {
      const sessionId = session.id;

      const { count: presenti } = await supabase
        .from('votes')
        .select('id', { head: true, count: 'exact' })
        .eq('session_id', sessionId);

      const { count: favorevoli } = await supabase
        .from('votes')
        .select('id', { head: true, count: 'exact' })
        .eq('session_id', sessionId)
        .eq('choice', 'favorevole');

      const { count: contrari } = await supabase
        .from('votes')
        .select('id', { head: true, count: 'exact' })
        .eq('session_id', sessionId)
        .eq('choice', 'contrario');

      const { count: astenuti } = await supabase
        .from('votes')
        .select('id', { head: true, count: 'exact' })
        .eq('session_id', sessionId)
        .eq('choice', 'astenuto');

      setStats({
        presenti: presenti || 0,
        favorevoli: favorevoli || 0,
        contrari: contrari || 0,
        astenuti: astenuti || 0,
        totale: (favorevoli || 0) + (contrari || 0) + (astenuti || 0),
      });
    }

    loadStats();
    const interval = setInterval(loadStats, 3000);
    return () => clearInterval(interval);
  }, [session]);

  // Attiva o disattiva votazione
  async function toggleVoting() {
    if (!session) return;

    const { data, error } = await supabase
      .from('sessions')
      .update({ is_active: !session.is_active })
      .eq('id', session.id)
      .select('*');

    if (error) {
      setError('Errore nel cambiare stato votazione.');
      return;
    }

    setSession(data[0]);
  }

  // Registra presenza con codice univoco
  async function insertPresence() {
    if (!participantCode) {
      setPresenceMsg('Inserisci un codice univoco valido.');
      return;
    }

    if (!session) {
      setPresenceMsg('Nessuna sessione attiva.');
      return;
    }

    // Recupera participant_id a partire dal codice univoco
    const { data: participantData, error: participantError } = await supabase
      .from('participants')
      .select('id')
      .eq('code', participantCode)
      .limit(1)
      .single();

    if (participantError || !participantData) {
      setPresenceMsg('Codice univoco non trovato.');
      return;
    }

    // Controlla se già presente
    const { data: existingVote, error: voteCheckError } = await supabase
      .from('votes')
      .select('id')
      .eq('participant_id', participantData.id)
      .eq('session_id', session.id)
      .limit(1)
      .single();

    if (existingVote) {
      setPresenceMsg('Presenza già registrata.');
      return;
    }

    // Inserisci presenza (con choice "presente" o altro che vuoi)
    const { error: insertError } = await supabase
      .from('votes')
      .insert([{ participant_id: participantData.id, session_id: session.id, choice: 'presente' }]);

    if (insertError) {
      setPresenceMsg('Errore durante registrazione presenza.');
      return;
    }

    setPresenceMsg('Presenza registrata correttamente!');
    setParticipantCode('');
  }

  return (
    <div style={{ padding: 30, backgroundColor: '#1e293b', color: 'white', minHeight: '100vh' }}>
      <h1>Pannello Amministratore</h1>

      {loading && <p>Caricamento dati...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {session && (
        <>
          <p><b>Codice univoco sessione:</b> {session.code}</p>
          <p><b>Votazione:</b> {session.is_active ? '✅ Attiva' : '❌ Disattiva'}</p>

          <button
            onClick={toggleVoting}
            style={{
              marginTop: 16,
              padding: '12px 24px',
              fontWeight: 'bold',
              fontSize: 16,
              borderRadius: 8,
              border: 'none',
              color: 'white',
              backgroundColor: session.is_active ? '#ef4444' : '#10b981',
              cursor: 'pointer',
            }}
          >
            {session.is_active ? 'Disattiva votazione' : 'Attiva votazione'}
          </button>

          <hr style={{ margin: '30px 0', borderColor: '#334155' }} />

          <h2>Registra presenza partecipante</h2>
          <input
            type="text"
            placeholder="Inserisci codice univoco"
            value={participantCode}
            onChange={(e) => setParticipantCode(e.target.value)}
            style={{
              padding: 10,
              fontSize: 16,
              borderRadius: 6,
              border: 'none',
              width: '250px',
              marginRight: 12,
              backgroundColor: '#475569',
              color: 'white',
            }}
          />
          <button
            onClick={insertPresence}
            style={{
              padding: '10px 18px',
              fontWeight: 'bold',
              fontSize: 16,
              borderRadius: 6,
              border: 'none',
              backgroundColor: '#3b82f6',
              color: 'white',
              cursor: 'pointer',
            }}
          >
            Registra presenza
          </button>
          {presenceMsg && <p style={{ marginTop: 10 }}>{presenceMsg}</p>}

          <hr style={{ margin: '30px 0', borderColor: '#334155' }} />

          <h2>Statistiche voti</h2>
          <p>Presenze totali: {stats.presenti}</p>
          <p>Voti favorevoli: {stats.favorevoli}</p>
          <p>Voti contrari: {stats.contrari}</p>
          <p>Voti astenuti: {stats.astenuti}</p>
          <p style={{ fontWeight: 'bold', fontSize: 18, marginTop: 10 }}>
            Totale voti espressi: {stats.totale}
          </p>
        </>
      )}

      {!loading && !session && <p>Nessuna sessione attiva trovata.</p>}
    </div>
  );
}
