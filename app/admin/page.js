'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function AdminPanel() {
  const [sessionId, setSessionId] = useState('');
  const [votes, setVotes] = useState([]);

  // Carica dati voti per la sessione indicata
  const fetchVotes = async () => {
    if (!sessionId) return;
    const { data, error } = await supabase
      .from('votes')
      .select('id, participant_id, choice, created_at')
      .eq('session_id', sessionId);
    if (!error) {
      setVotes(data);
    }
  };

  // Polling ogni 3 secondi per aggiornare i dati
  useEffect(() => {
    if (!sessionId) return;
    fetchVotes();
    const intervalId = setInterval(fetchVotes, 3000);
    return () => clearInterval(intervalId);
  }, [sessionId]);

  return (
    <div style={{ padding: 20, backgroundColor: '#222', color: 'white', minHeight: '100vh' }}>
      <h1>Pannello Amministratore - Voti sessione</h1>

      <input
        type="text"
        placeholder="Inserisci UUID sessione"
        value={sessionId}
        onChange={(e) => setSessionId(e.target.value)}
        style={{ padding: 10, width: 350, fontSize: 16, marginBottom: 20 }}
      />

      {!sessionId && <p>Inserisci UUID della sessione sopra e attendi i voti.</p>}

      {votes.length === 0 && sessionId && <p>Nessun voto trovato per questa sessione.</p>}

      {votes.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid white' }}>
              <th style={{ textAlign: 'left', padding: 8 }}>ID voto</th>
              <th style={{ textAlign: 'left', padding: 8 }}>ID partecipante</th>
              <th style={{ textAlign: 'left', padding: 8 }}>Voto</th>
              <th style={{ textAlign: 'left', padding: 8 }}>Data creazione</th>
            </tr>
          </thead>
          <tbody>
            {votes.map((v) => (
              <tr key={v.id} style={{ borderBottom: '1px solid #555' }}>
                <td style={{ padding: 8 }}>{v.id}</td>
                <td style={{ padding: 8 }}>{v.participant_id}</td>
                <td style={{ padding: 8 }}>{v.choice}</td>
                <td style={{ padding: 8 }}>{new Date(v.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
