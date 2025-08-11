// import React, { useState } from "react";
// import Login from "../src/components/Login";
// import Signup from "../src/components/Signup";

// function App() {
//   const [token, setToken] = useState(localStorage.getItem("token") || "");
//   const [showSignup, setShowSignup] = useState(false);
//   const [query, setQuery] = useState("");
//   const [results, setResults] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   const handleLogin = (token) => {
//     setToken(token);
//     localStorage.setItem("token", token);
//   };

//   const handleLogout = () => {
//     setToken("");
//     localStorage.removeItem("token");
//     setResults([]);
//     setQuery("");
//   };

//   const handleSearch = async (e) => {
//     e.preventDefault();
//     if (!query.trim()) {
//       setResults([]);
//       return;
//     }

//     setLoading(true);
//     setError(null);

//     try {
//       const res = await fetch(
//         `http://localhost:5000/search?query=${encodeURIComponent(query)}`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       if (!res.ok) {
//         if (res.status === 401 || res.status === 403) {
//           handleLogout();
//           throw new Error("Unauthorized. Please login again.");
//         }
//         throw new Error(`Server error: ${res.status}`);
//       }

//       const data = await res.json();
//       setResults(data);
//     } catch (err) {
//       setError(err.message || "Failed to fetch");
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!token) {
//     return (
//       <div style={{ maxWidth: 400, margin: "auto", padding: 20 }}>
//         {showSignup ? (
//           <>
//             <Signup onSignupSuccess={() => setShowSignup(false)} />
//             <p>
//               Already have an account?{" "}
//               <button onClick={() => setShowSignup(false)}>Login here</button>
//             </p>
//           </>
//         ) : (
//           <>
//             <Login onLogin={handleLogin} />
//             <p>
//               Don't have an account?{" "}
//               <button onClick={() => setShowSignup(true)}>Sign up here</button>
//             </p>
//           </>
//         )}
//       </div>
//     );
//   }

//   return (
//     <div style={{ maxWidth: 700, margin: "2rem auto", fontFamily: "Arial, sans-serif" }}>
//       <button onClick={handleLogout} style={{ marginBottom: 20 }}>
//         Logout
//       </button>
//       <h1>Lab Term Search</h1>
//       <form onSubmit={handleSearch} style={{ marginBottom: 20 }}>
//         <input
//           type="text"
//           value={query}
//           onChange={(e) => setQuery(e.target.value)}
//           placeholder="Enter search term (e.g. thyroid test)"
//           style={{ width: "100%", padding: 10, fontSize: 16 }}
//         />
//         <button
//           type="submit"
//           style={{ marginTop: 10, padding: "10px 20px", fontSize: 16 }}
//           disabled={loading}
//         >
//           {loading ? "Searching..." : "Search"}
//         </button>
//       </form>

//       {error && <p style={{ color: "red" }}>{error}</p>}

//       {!loading && results.length === 0 && query.trim() !== "" && (
//         <p>No results found for "{query}"</p>
//       )}

//       <ul style={{ listStyle: "none", paddingLeft: 0 }}>
//         {results.map((item) => (
//           <li
//             key={item._id}
//             style={{ marginBottom: 15, padding: 10, border: "1px solid #ccc" }}
//           >
//             <strong>{item.COMPONENT || "No Component"}</strong> <br />
//             <small>LOINC Code: {item.LOINC_NUM || "N/A"}</small> <br />
//             <p>{item.LONG_COMMON_NAME || "No description"}</p>
//             {item.RELATEDNAMES2 && item.RELATEDNAMES2.length > 0 && (
//               <p>
//                 <em>Also known as:</em> {item.RELATEDNAMES2.join(", ")}
//               </p>
//             )}
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// }

// export default App;


"use client"
import './index.css';
import { useState } from "react"
import Login from "../src/components/Login"
import Signup from "../src/components/Signup"

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "")
  const [showSignup, setShowSignup] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleLogin = (token) => {
    setToken(token)
    localStorage.setItem("token", token)
  }

  const handleLogout = () => {
    setToken("")
    localStorage.removeItem("token")
    setResults([])
    setQuery("")
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!query.trim()) {
      setResults([])
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`http://localhost:5000/search?query=${encodeURIComponent(query)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          handleLogout()
          throw new Error("Unauthorized. Please login again.")
        }
        throw new Error(`Server error: ${res.status}`)
      }

      const data = await res.json()
      setResults(data)
    } catch (err) {
      setError(err.message || "Failed to fetch")
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div style={{ maxWidth: 400, margin: "auto", padding: 20 }}>
        {showSignup ? (
          <>
            <Signup onSignupSuccess={() => setShowSignup(false)} />
            <p>
              Already have an account? <button onClick={() => setShowSignup(false)}>Login here</button>
            </p>
          </>
        ) : (
          <>
            <Login onLogin={handleLogin} />
            <p>
              Don't have an account? <button onClick={() => setShowSignup(true)}>Sign up here</button>
            </p>
          </>
        )}
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 700, margin: "2rem auto", fontFamily: "Arial, sans-serif" }}>
      <button onClick={handleLogout} style={{ marginBottom: 20 }}>
        Logout
      </button>
      <h1>Lab Term Search</h1>
      <form onSubmit={handleSearch} style={{ marginBottom: 20 }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter search term (e.g. thyroid test)"
          style={{ width: "100%", padding: 10, fontSize: 16 }}
        />
        <button type="submit" style={{ marginTop: 10, padding: "10px 20px", fontSize: 16 }} disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && results.length === 0 && query.trim() !== "" && <p>No results found for "{query}"</p>}

      <ul style={{ listStyle: "none", paddingLeft: 0 }}>
        {results.map((item) => (
          <li key={item._id} style={{ marginBottom: 15, padding: 10, border: "1px solid #ccc" }}>
            <strong>{item.COMPONENT || "No Component"}</strong> <br />
            <small>LOINC Code: {item.LOINC_NUM || "N/A"}</small> <br />
            <p>{item.LONG_COMMON_NAME || "No description"}</p>
            {item.RELATEDNAMES2 && item.RELATEDNAMES2.length > 0 && (
              <p>
                <em>Also known as:</em> {item.RELATEDNAMES2.join(", ")}
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default App
