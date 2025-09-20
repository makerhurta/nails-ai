import { useState } from "react";

function App() {
  const [message, setMessage] = useState<string>("");
  const [text, setText] = useState<string>("");

  async function checkHealth() {
    try {
      const response = await fetch("http://localhost:3001/health"); // volá backend
      const data = await response.json();
      setMessage(`Server says: ${data.status}`);
    } catch (err) {
      setMessage("❌ Error connecting to server");
    }
  }

  async function checkTime() {
    try {
        const response = await fetch("http://localhost:3001/time");
        const data = await response.json();
        setMessage(`Server time: ${data.now}`);
    } catch (err) {
        setMessage("❌ Error connecting to server");
    }
    }

    async function sendEcho() {
    try {
      const response = await fetch("http://localhost:3001/echo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        setMessage(`❌ Error: ${response.status} ${errBody.error ?? ""}`);
        return;
        }

      const data = await response.json();
      setMessage(`Echo from server: ${data.echo}`);
    } catch {
      setMessage("❌ Error connecting to server");
    }
  }

    return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Nails AI – Frontend</h1>

      <button onClick={checkHealth}>Check Health</button>
      <button onClick={checkTime} style={{ marginLeft: 8 }}>Check Time</button>

      <div style={{ marginTop: 16 }}>
        <input
          placeholder="Napíš text pre /echo"
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{ padding: 8, marginRight: 8 }}
        />
        <button onClick={sendEcho}>Send to /echo</button>
      </div>

      <p style={{ marginTop: 16 }}>{message}</p>
    </div>
  );
}

export default App;