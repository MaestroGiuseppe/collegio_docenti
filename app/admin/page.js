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

  // Carica l'ultima sessione disponibile
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

  // Carica statistiche voti aggiornate ogni 3 secondi
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

  // Cambia stato votazione attiva/disattiva
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

  // Inserisce la presenza (codice partecipante)
  async function insertPresence() {
    if (!participantCode) {
      setPresenceMsg('Inserisci un codice valido.');
      return;
    }
    if (!session) {
      setPresenceMsg('Sessione non disponibile.');
      return;
    }

    // Recupera participant_id dalla tabella participants col codice utente (campo da adattare)
    // Qui assumiamo che participant_code sia salvato nel campo 'code' della tabella participants
    const { data: participantData, error: participantError } = await supabase
      .from('participants')
      .select('id')
      .eq('code', participantCode)
      .limit(1)
      .single();

    if (participantError || !participantData) {
      setPresenceMsg('Codice partecipante non trovato.');
      return;
    }

    // Controlla se ha già votato per questa sessione (presenza)
    const { data: voteExists, error: voteCheckError } = await supabase
      .from('votes')
      .select('id')
      .eq('participant_id', participantData.id)
      .eq('session_id', session.id)
      .limit(1)
      .single();

    if (voteExists) {
      setPresenceMsg('Presenza già registrata.');
      return;
    }

    // Inserisce una presenza: niente voto scelto, solo segna presenza (potresti usare choice 'presente' o null)
    const { error: insertError } = await supabase
      .from('votes')
      .insert([{ participant_id: participantData.id, session_id: session.id, choice: 'presente' }]);

    if (insertError) {
      setPresenceMsg('Errore durante registrazione presenza.');
      return;
    }

    setPresenceMsg('Presenza registrata con successo!');
    setParticipantCode('');
  }

  return (
    <div style={{
      padding: 30,
      minHeight: '100vh',
      backgroundColor: '#1e293b',
      color: 'white',
      fontFamily: 'Arial, sans-serif',
    }}>
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
            }}>
            {session.is_active ? 'Disattiva votazione' : 'Attiva votazione'}
          </button>

          <hr style={{ margin: '30px 0', borderColor: '#334155' }} />

          <h2>Inserisci presenza partecipante</h2>
          <input
            type="text"
            placeholder="Inserisci codice partecipante"
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
            disabled={!session.is_active}
          />
          <button
            onClick={insertPresence}
            disabled={!session.is_active}
            style={{
              padding: '10px 18px',
              fontWeight: 'bold',
              fontSize: 16,
              borderRadius: 6,
              border: 'none',
              backgroundColor: '#3b82f6',
              color: 'white',
              cursor: session.is_active ? 'pointer' : 'not-allowed',
            }}
          >
            Registra Presenza
          </button>
          {presenceMsg && <p style={{ marginTop: 10 }}>{presenceMsg}</p>}

          <hr style={{ margin: '30px 0', borderColor: '#334155' }} />

          <h2>Statistiche voti aggiornate</h2>
          <p>Presenze totali: {stats.presenti}</p>
          <p>Voti favorevoli: {stats.favorevoli}</p>
          <p>Voti contrari: {stats.contrari}</p>
          <p>Voti astenuti: {stats.astenuti}</p>
          <p style={{ fontWeight: 'bold', marginTop: 10 }}>
            Totale voti espressi: {stats.totale}
          </p>
        </>
      )}

      {!loading && !session && <p>Nessuna sessione attiva trovata.</p>}
    </div>
  );
}
