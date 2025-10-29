'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function AdminPanel() {
  const [sessionId, setSessionId] = useState('');
  const [votes, setVotes] = useState([]);
  const [loading, setLoading] = useState(false);

  // Funzione per caricare tutte le votes di una sessione
  const fetchVotes = async () => {
    if (!sessionId) return;
    const { data, error } = await supabase
      .from('votes')
      .select('*')
      .eq('session_id', sessionId);
    if (!error) {
      setVotes(data);
    }
  };

  // Per aggiornare in tempo reale o con polling ogni 3 sec
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchVotes();
    }, 3000);
    return () => clearInterval(intervalId);
  }, [sessionId]);

  // Inserisci il nuovo sessionId
  const handleLoadVotes = () => {
    fetchVotes();
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#4b5563',
      color: 'white',
      padding: 20,
    }}>
      <h1>Admin Panel - Visualizza Voti</h1>

      <div style={{ marginBottom: 20 }}>
        <input
          placeholder="Inserisci UUID sessione"
          value={sessionId}
          onChange={(e) => setSessionId(e.target.value)}
          style={{ padding: 10, width: 300, borderRadius: 4, border: 'none' }}
        />
        <button
          onClick={handleLoadVotes}
          style={{ padding: 10, marginLeft: 10, borderRadius: 4, border: 'none', backgroundColor: '#22c55e', color: 'white' }}
        >
          Carica Voti
        </button>
      </div>

      <h2>Voti recenti per sessione {sessionId}</h2>
      {votes.length === 0 ? (
        <p>Nessun voto trovato per questa sessione.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ddd', padding: 8 }}>ID</th>
              <th style={{ border: '1px solid #ddd', padding: 8 }}>Participante</th>
              <th style={{ border: '1px solid #ddd', padding: 8 }}>Voto</th>
              <th style={{ border: '1px solid #ddd', padding: 8 }}>Data</th>
            </tr>
          </thead>
          <tbody>
            {votes.map((vote) => (
              <tr key={vote.id}>
                <td style={{ border: '1px solid #ddd', padding: 8 }}>{vote.id}</td>
                <td style={{ border: '1px solid #ddd', padding: 8 }}>{vote.participant_id}</td>
                <td style={{ border: '1px solid #ddd', padding: 8 }}>{vote.choice}</td>
                <td style={{ border: '1px solid #ddd', padding: 8 }}>{vote.created_at}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
