// src/components/Login.jsx
import { useState } from "react";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async e => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      console.log("Login response data:", data);

      if (!res.ok) {
        setError(data.message || "Login failed");
        return;
      }

      if (!data.token) {
        setError("No token returned from server");
        return;
      }

      // Stash token locally (ok to keep; App also sets it)
      localStorage.setItem("token", data.token);

      // IMPORTANT: pass token to parent so App updates its state/UI
      onLogin(data.token);
    } catch (err) {
      setError("Network error");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={e => setUsername(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
      />
      <button type="submit">Login</button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </form>
  );
}