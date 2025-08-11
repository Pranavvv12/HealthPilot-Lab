import React, { useState } from "react";

export default function App() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `http://localhost:5000/search?query=${encodeURIComponent(query)}`
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err.message || "Unknown error");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "auto", padding: 20 }}>
      <h1>Lab Glossary Search</h1>

      <input
        type="text"
        placeholder="Search for lab tests (e.g., thyroid test)"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSearch();
        }}
        style={{ width: "100%", padding: 10, fontSize: 16 }}
      />

      <button
        onClick={handleSearch}
        disabled={loading}
        style={{ marginTop: 10, padding: "10px 20px", fontSize: 16 }}
      >
        {loading ? "Searching..." : "Search"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <ul style={{ marginTop: 20 }}>
        {results.length === 0 && !loading && <p>No results found</p>}

        {results.map((item) => (
          <li key={item.LOINC_NUM} style={{ marginBottom: 15 }}>
            <strong>{item.COMPONENT || "No Component"}</strong> — Code: {item.LOINC_NUM}
            <br />
            <em>{item.LONG_COMMON_NAME || "No Description"}</em>
          </li>
        ))}
      </ul>
    </div>
  );
}
