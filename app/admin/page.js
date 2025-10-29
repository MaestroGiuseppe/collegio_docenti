'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function AdminPanel() {
  const [sessionId, setSessionId] = useState('');
  const [stats, setStats] = useState({
    presenti: 0,
    favorevoli: 0,
    contrari: 0,
    astenuti: 0,
    totale: 0,
  });
  const [loading, setLoading] = useState(false);

  // Funzione per caricare le statistiche di voto per una sessione
  const fetchStats = async (session_id) => {
    if (!session_id) return;

    setLoading(true);

    // Conta totali presenti (voti nella sessione)
    const { count: presenti } = await supabase
      .from('votes')
      .select('id', { count: 'exact', head: true })
      .eq('session_id', session_id);

    // Conta voti favorevoli
    const { count: favorevoli } = await supabase
      .from('votes')
      .select('id', { count: 'exact', head: true })
      .eq('session_id', session_id)
      .eq('choice', 'favorevole');

    // Conta voti contrari
    const { count: contrari } = await supabase
      .from('votes')
      .select('id', { count: 'exact', head: true })
      .eq('session_id', session_id)
      .eq('choice', 'contrario');

    // Conta astenuti
    const { count: astenuti } = await supabase
      .from('votes')
      .select('id', { count: 'exact', head: true })
      .eq('session_id', session_id)
      .eq('choice', 'astenuto');

    setStats({
      presenti: presenti || 0,
      favorevoli: favorevoli || 0,
      contrari: contrari || 0,
      astenuti: astenuti || 0,
      totale: (favorevoli || 0) + (contrari || 0) + (astenuti || 0),
    });
    setLoading(false);
  };

  // Polling ogni 3 secondi per aggiornare le statistiche
  useEffect(() => {
    if (!sessionId) {
      setStats({
        presenti: 0,
        favorevoli: 0,
        contrari: 0,
        astenuti: 0,
        totale: 0,
      });
      return;
    }
    fetchStats(sessionId);
    const interval = setInterval(() => fetchStats(sessionId), 3000);
    return () => clearInterval(interval);
  }, [sessionId]);

  return (
    <div style={{ padding: 30, minHeight: '100vh', backgroundColor: '#1e293b', color: 'white' }}>
      <h1 style={{ marginBottom: 20 }}>Pannello Amministratore - Statistiche Voti</h1>

      <input
        type="text"
        placeholder="Inserisci UUID sessione"
        value={sessionId}
        onChange={(e) => setSessionId(e.target.value)}
        style={{
          width: 320,
          padding: 12,
          fontSize: 16,
          borderRadius: 6,
          border: 'none',
          marginBottom: 24,
          boxShadow: '0 0 8px rgba(255,255,255,0.1)',
          backgroundColor: '#334155',
          color: 'white'
        }}
      />

      {loading ? (
        <p>Caricamento statistiche in corso...</p>
      ) : (
        <div style={{ fontSize: 18 }}>
          <p><b>Presenze totali (voti):</b> {stats.presenti}</p>
          <p><b>Voti favorevoli:</b> {stats.favorevoli}</p>
          <p><b>Voti contrari:</b> {stats.contrari}</p>
          <p><b>Voti astenuti:</b> {stats.astenuti}</p>
          <p style={{ fontWeight: 'bold', fontSize: 20, marginTop: 20 }}>
            Totale voti espressi: {stats.totale}
          </p>
        </div>
      )}
    </div>
  );
}
