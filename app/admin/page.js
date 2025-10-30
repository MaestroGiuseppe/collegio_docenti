'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function AdminPanel() {
  const [session, setSession] = useState(null);
  const [stats, setStats] = useState({
    presenti: 0,
    favorevoli: 0,
    contrari: 0,
    astenuti: 0,
    totale: 0,
  });
  const [loading, setLoading] = useState(true);

  // Carica l'ultima sessione dal database
  useEffect(() => {
    const fetchLastSession = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);

      if (data && data.length > 0) {
        setSession(data[0]);
      } else {
        setSession(null);
      }
      setLoading(false);
    };

    fetchLastSession();
  }, []);

  // Carica le statistiche ogni 3 secondi
  useEffect(() => {
    if (!session) return;
    const fetchStats = async () => {
      // Presenze = quanti voti per questa sessione
      const { count: presenti } = await supabase
        .from('votes')
        .select('id', { count: 'exact', head: true })
        .eq('session_id', session.id);

      const { count: favorevoli } = await supabase
        .from('votes')
        .select('id', { count: 'exact', head: true })
        .eq('session_id', session.id)
        .eq('choice', 'favorevole');

      const { count: contrari } = await supabase
        .from('votes')
        .select('id', { count: 'exact', head: true })
        .eq('session_id', session.id)
        .eq('choice', 'contrario');

      const { count: astenuti } = await supabase
        .from('votes')
        .select('id', { count: 'exact', head: true })
        .eq('session_id', session.id)
        .eq('choice', 'astenuto');

      setStats({
        presenti: presenti || 0,
        favorevoli: favorevoli || 0,
        contrari: contrari || 0,
        astenuti: astenuti || 0,
        totale: (favorevoli || 0) + (contrari || 0) + (astenuti || 0),
      });
    };

    fetchStats();
    const interval = setInterval(fetchStats, 3000);
    return () => clearInterval(interval);
  }, [session]);

  // Gestisce attivazione/disattivazione votazione
  const handleToggleVoting = async () => {
    if (!session) return;
    const { data, error } = await supabase
      .from('sessions')
      .update({ is_active: !session.is_active })
      .eq('id', session.id)
      .select('*');
    if (data && data.length > 0) setSession(data[0]);
  };

  if (loading) {
    return (
      <div style={{ padding: 30, color: 'white', background: '#1e293b', minHeight: '100vh' }}>
        <h1>Pannello Amministratore</h1>
        <p>Caricamento dati...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 30, color: 'white', background: '#1e293b', minHeight: '100vh' }}>
      <h1>Pannello Amministratore</h1>
      {session ? (
        <>
          <p><b>Codice sessione:</b> {session.code}</p>
          <p><b>UUID sessione:</b> {session.id}</p>
          <p><b>Delibera numero:</b> {session.delibera_number}</p>
          <p><b>Status votazione:</b> {session.is_active ? 'ATTIVA' : 'DISATTIVA'}</p>
          <button
            style={{
              margin: '16px 0',
              padding: '14px 24px',
              borderRadius: 8,
              border: 'none',
              background: session.is_active ? '#ef4444' : '#10b981',
              color: 'white',
              fontWeight: 700,
              fontSize: 18,
              cursor: 'pointer',
            }}
            onClick={handleToggleVoting}
          >
            {session.is_active ? 'Disattiva votazione' : 'Attiva votazione'}
          </button>
          <hr style={{ margin: '18px 0', borderColor: '#334155' }} />
          <h2 style={{ marginBottom: 10, fontSize: '1.4rem' }}>Statistiche tempo reale</h2>
          <p>Presenze (voti espressi): {stats.presenti}</p>
          <p>Voti favorevoli: {stats.favorevoli}</p>
          <p>Voti contrari: {stats.contrari}</p>
          <p>Voti astenuti: {stats.astenuti}</p>
          <p style={{
            fontWeight: 'bold',
            fontSize: '1.15rem',
            marginTop: 14,
            color: '#eab308'
          }}>Totale voti espressi: {stats.totale}</p>
        </>
      ) : (
        <p>Nessuna sessione trovata.</p>
      )}
    </div>
  );
}
