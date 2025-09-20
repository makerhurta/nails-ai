import { useState } from 'react';

function App() {
  const [message, setMessage] = useState<string>('');
  const [text, setText] = useState<string>('');
  const [noteText, setNoteText] = useState<string>('');
  const [notes, setNotes] = useState<Array<{ id: string; text: string; created_at: string }>>([]);

  async function checkHealth() {
    try {
      const response = await fetch('http://localhost:3001/health'); // volá backend
      const data = await response.json();
      setMessage(`Server says: ${data.status}`);
    } catch (err) {
      setMessage('❌ Error connecting to server');
    }
  }

  async function checkTime() {
    try {
      const response = await fetch('http://localhost:3001/time');
      const data = await response.json();
      setMessage(`Server time: ${data.now}`);
    } catch (err) {
      setMessage('❌ Error connecting to server');
    }
  }

  async function sendEcho() {
    try {
      const response = await fetch('http://localhost:3001/echo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        setMessage(`❌ Error: ${response.status} ${errBody.error ?? ''}`);
        return;
      }

      const data = await response.json();
      setMessage(`Echo from server: ${data.echo}`);
    } catch {
      setMessage('❌ Error connecting to server');
    }
  }

  async function fetchNotes() {
    try {
      const resp = await fetch('http://localhost:3001/notes');
      const data = await resp.json();
      setNotes(data.notes ?? []);
    } catch {
      setMessage('❌ Error loading notes');
    }
  }

  async function addNote() {
    try {
      const resp = await fetch('http://localhost:3001/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: noteText }),
      });

      if (!resp.ok) {
        const errBody = await resp.json().catch(() => ({}));
        setMessage(`❌ Error: ${resp.status} ${errBody.error ?? ''}`);
        return;
      }

      setNoteText(''); // vyčisti input
      await fetchNotes(); // obnov zoznam
      setMessage('✅ Note saved');
    } catch {
      setMessage('❌ Error saving note');
    }
  }

  return (
    <div style={{ marginTop: 24 }}>
      <h2>Notes</h2>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input
          placeholder="Napíš poznámku"
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          style={{ padding: 8, flex: 1 }}
        />
        <button onClick={addNote}>Add note</button>
        <button onClick={fetchNotes}>Refresh</button>
      </div>

      <ul>
        {notes.map((n) => (
          <li key={n.id}>
            {n.text}{' '}
            <span style={{ color: '#666', fontSize: 12 }}>
              ({new Date(n.created_at).toLocaleString()})
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
