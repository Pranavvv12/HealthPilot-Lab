
import React, { useState } from "react";
import Login from "../src/components/Login";
import Signup from "../src/components/Signup";
import DashBoard from "./components/DashBoard";
import { Search, ShoppingCart, User, Info, Rocket, X } from 'lucide-react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

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

  // Show Dashboard with Search (when authenticated) or Landing Page (when not authenticated)
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex justify-between items-center h-16">
      
      {/* Logo */}
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
          <div className="w-4 h-4 bg-white rounded-full"></div>
        </div>
        <span className="text-xl font-bold text-gray-900">HealthHub</span>
      </div>

      {/* Navigation */}
      <nav className="hidden md:flex items-center space-x-8">
       <button
                onClick={() => navigate('/dashboard')}  // navigate to dashboard on click
                className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
              >
                Home
              </button>
      </nav>

      {/* Right Side */}
      <div className="flex items-center space-x-6">
        {/* Cart */}
        <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
          <ShoppingCart className="w-5 h-5 text-gray-600 hover:text-gray-900" />
        </button>

        {/* User */}
        <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
          <User className="w-5 h-5 text-gray-600 hover:text-gray-900" />
        </button>

        {/* Login / Logout */}
        {token ? (
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg font-medium transition-colors"
          >
            Logout
          </button>
        ) : (
          <button
            onClick={handleShowLogin}
            className="bg-black hover:bg-gray-800 text-white px-5 py-2 rounded-lg font-medium transition-colors"
          >
            Login
          </button>
        )}
      </div>
    </div>
  </div>
</header>


      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {!token ? (
          // Landing Page Content (when not authenticated)
          <>
            {/* Hero Badge */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                <span className="mr-2">🏥</span>
                Smarter Healthcare, Better Outcomes
              </div>
            </div>

            {/* Main Headline */}
            <div className="text-center mb-8">
              <h1 className="text-5xl  font-bold text-gray-900 leading-tight mb-6">
                Revolutionizing Healthcare, <span className="block">One Search at a Time.</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                 Search Lab Tests Smarter — Find, Compare, and Understand Results Instantly
              </p>
            </div>

            {/* Features List */}
            <div className="text-center mb-12 space-y-4">
              <div className="flex items-center justify-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rotate-45"></div>
                <span className="text-lg font-semibold text-gray-800">Fast & Accurate Test Search — Look up thousands of lab terms in seconds.</span>
              </div>
              <div className="flex items-center justify-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rotate-45"></div>
                <span className="text-lg font-semibold text-gray-800">Detailed Medical Information — Get LOINC codes, descriptions, and related names.</span>
              </div>
              <div className="flex items-center justify-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rotate-45"></div>
                <span className="text-lg font-semibold text-gray-800">Secure & Personalized — Access only with login for data privacy.

</span>
              </div>
            </div>

            {/* Call to Action Buttons */}
            <div className="text-center mb-8">
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button className="px-8 py-3 text-lg font-medium border-2 border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 rounded-lg flex items-center">
                  <Info className="w-5 h-5 mr-2 text-blue-500" />
                  More Info
                </button>
                <button 
                  onClick={handleShowLogin}
                  className="px-8 py-3 text-lg font-medium bg-black hover:bg-gray-800 text-white rounded-lg flex items-center"
                >
                  <Rocket className="w-5 h-5 mr-2" />
                  Get Started
                </button>
              </div>
            </div>

            {/* Footer Tagline */}
            <div className="text-center">
              <p className="text-gray-500 italic text-lg">Your health, your way.</p>
            </div>
          </>
        ) : (
          // Dashboard Content with Search (when authenticated)
          <>
            {/* Welcome Message */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to Your Dashboard</h1>
              <p className="text-lg text-gray-600">Search for lab terms and medical information</p>
            </div>

            {/* Search Bar */}
            <div className="mb-8">
              <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
                <div className="relative">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Enter search term (e.g. thyroid test)"
                    className="w-full px-4 py-4 pl-12 pr-40 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
                  />
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
                  {query && (
                    <button
                      type="button"
                      onClick={() => {
                        setQuery("");
                        setResults([]);
                        setError(null);
                      }}
                      className="absolute right-24 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                    >
                     <X className="w-5 h-5 mr-4" />

                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={loading}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 font-medium"
                  >
                    {loading ? "Searching..." : "Search"}
                  </button>
                </div>
              </form>
            </div>

            {/* Error Message */}
            {error && (
              <div className="max-w-2xl mx-auto mb-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            )}

            {/* No Results Message */}
            {!loading && results.length === 0 && query.trim() !== "" && (
              <div className="max-w-2xl mx-auto text-center">
                <p className="text-gray-600">Searching "{query}"</p>
              </div>
            )}

            {/* Search Results */}
            {results.length > 0 && (
              <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Search Results</h2>
                <div className="space-y-4">
                  {results.map((item) => (
                    <div key={item._id} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
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
            )}

            {/* Dashboard Features (when no search or no results) */}
            {(!query.trim() || results.length === 0) && !loading && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <Search className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Lab Search</h3>
                  <p className="text-gray-600">Search through comprehensive lab term database with LOINC codes</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <Search className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Test Directory</h3>
                  <p className="text-gray-600">Browse an extensive list of laboratory tests and panels.</p>
                </div>
                
              </div>
            )}
          </>
        )}
      </main>
       <BrowserRouter>
      <Routes>
        <Route path="/dashboard" element={<DashBoard />} />
        {/* other routes here */}
      </Routes>
    </BrowserRouter>
    </div>
  );
}

export default App;