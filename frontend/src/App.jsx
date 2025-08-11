// import React, { useState } from "react";
// import Login from "../src/components/Login";
// import Signup from "../src/components/Signup";
// import DashBoard from "./components/DashBoard";
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

import React, { useState } from "react";
import Login from "../src/components/Login";
import Signup from "../src/components/Signup";
import DashBoard from "./components/DashBoard";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [showSignup, setShowSignup] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showDashboard, setShowDashboard] = useState(true);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = (token) => {
    setToken(token);
    localStorage.setItem("token", token);
    // After login, go back to dashboard
    setShowLogin(false);
    setShowSignup(false);
    setShowDashboard(true);
  };

  const handleLogout = () => {
    setToken("");
    localStorage.removeItem("token");
    setResults([]);
    setQuery("");
    // After logout, go back to dashboard
    setShowLogin(false);
    setShowSignup(false);
    setShowDashboard(true);
  };

  const handleShowLogin = () => {
    setShowLogin(true);
    setShowSignup(false);
    setShowDashboard(false);
  };

  const handleShowSignup = () => {
    setShowSignup(true);
    setShowLogin(false);
    setShowDashboard(false);
  };

  const handleBackToDashboard = () => {
    setShowLogin(false);
    setShowSignup(false);
    setShowDashboard(true);
  };

  const handleSignupSuccess = () => {
    setShowSignup(false);
    setShowLogin(true);
    setShowDashboard(false);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `http://localhost:5000/search?query=${encodeURIComponent(query)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          handleLogout();
          throw new Error("Unauthorized. Please login again.");
        }
        throw new Error(`Server error: ${res.status}`);
      }

      const data = await res.json();
      setResults(data);
    } catch (err) {
      setError(err.message || "Failed to fetch");
    } finally {
      setLoading(false);
    }
  };

  // Show Login Page
  if (showLogin) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Back to Dashboard Button */}
        <div className="p-4">
          <button 
            onClick={handleBackToDashboard}
            className="text-gray-600 hover:text-gray-800 text-sm flex items-center"
          >
            ← Back to Home
          </button>
        </div>
        
        <div className="flex items-center justify-center py-12 px-4">
          <div className="max-w-md w-full">
            <Login onLogin={handleLogin} />
            <div className="text-center mt-6">
              <p className="text-gray-600">
                Don't have an account?{" "}
                <button 
                  onClick={handleShowSignup}
                  className="text-teal-600 hover:text-teal-700 font-medium"
                >
                  Sign up here
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show Signup Page
  if (showSignup) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Back to Dashboard Button */}
        <div className="p-4">
          <button 
            onClick={handleBackToDashboard}
            className="text-gray-600 hover:text-gray-800 text-sm flex items-center"
          >
            ← Back to Home
          </button>
        </div>
        
        <div className="flex items-center justify-center py-12 px-4">
          <div className="max-w-md w-full">
            <Signup onSignupSuccess={handleSignupSuccess} />
            <div className="text-center mt-6">
              <p className="text-gray-600">
                Already have an account?{" "}
                <button 
                  onClick={handleShowLogin}
                  className="text-teal-600 hover:text-teal-700 font-medium"
                >
                  Login here
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show Dashboard (Default view)
  if (showDashboard || !token) {
    return (
      <DashBoard 
        onShowLogin={handleShowLogin}
        onShowSignup={handleShowSignup}
        isAuthenticated={!!token}
        onLogout={handleLogout}
      />
    );
  }

  // Show Lab Search (When authenticated and not on dashboard)
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button 
              onClick={handleBackToDashboard}
              className="flex items-center space-x-2"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-full"></div>
              </div>
              <span className="text-xl font-bold text-gray-900">HealthHub</span>
            </button>
            <button 
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Lab Search Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Lab Term Search</h1>
        
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-4">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter search term (e.g. thyroid test)"
              className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 font-medium"
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </div>
        </form>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {!loading && results.length === 0 && query.trim() !== "" && (
          <p className="text-gray-600">No results found for "{query}"</p>
        )}

        <div className="space-y-4">
          {results.map((item) => (
            <div key={item._id} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="font-semibold text-lg text-gray-900 mb-2">
                {item.COMPONENT || "No Component"}
              </h3>
              <p className="text-sm text-gray-500 mb-2">LOINC Code: {item.LOINC_NUM || "N/A"}</p>
              <p className="text-gray-700 mb-3">{item.LONG_COMMON_NAME || "No description"}</p>
              {item.RELATEDNAMES2 && item.RELATEDNAMES2.length > 0 && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Also known as:</span> {item.RELATEDNAMES2.join(", ")}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;