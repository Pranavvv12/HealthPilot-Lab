import React from 'react'
import { ShoppingCart, User, Info, Rocket } from 'lucide-react'
import { useNavigate } from 'react-router-dom'; 

const DashBoard = ({ onShowLogin, onShowSignup, isAuthenticated, onLogout }) => {
    const navigate = useNavigate();
  return (
    
    <div className="min-h-screen bg-gray-50">
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

            {/* Right side icons and login */}
            <div className="flex items-center space-x-4">
  <ShoppingCart className="w-5 h-5 text-gray-600 hover:text-gray-900 cursor-pointer" />
  <User className="w-5 h-5 text-gray-600 hover:text-gray-900 cursor-pointer" />
  {isAuthenticated ? (
    <button 
      onClick={onLogout}
      className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium"
    >
      Logout
    </button>
  ) : (
    <button 
      onClick={onShowLogin}
      className="bg-black hover:bg-gray-800 text-white px-6 py-2 rounded-lg font-medium"
    >
      Login
    </button>
  )}
</div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Badge */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            <span className="mr-2">🏥</span>
            Smarter Healthcare, Better Outcomes
          </div>
        </div>

        {/* Main Headline */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
            Revolutionizing Healthcare, <span className="block">One Search at a Time.</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Maximize efficiency with our AI-powered healthcare marketplace— Book appointments, get AI-assisted
            diagnoses, and access medical supplies effortlessly.
          </p>
        </div>

        {/* Features List */}
        <div className="text-center mb-12 space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <div className="w-2 h-2 bg-blue-500 rotate-45"></div>
            <span className="text-lg font-semibold text-gray-800">AI-Powered Diagnosis & Report Summarization</span>
          </div>
          <div className="flex items-center justify-center space-x-3">
            <div className="w-2 h-2 bg-blue-500 rotate-45"></div>
            <span className="text-lg font-semibold text-gray-800">Seamless Medical Equipment Shopping</span>
          </div>
          <div className="flex items-center justify-center space-x-3">
            <div className="w-2 h-2 bg-blue-500 rotate-45"></div>
            <span className="text-lg font-semibold text-gray-800">Instant Doctor Appointments</span>
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
              onClick={isAuthenticated ? null : onShowLogin}
              className="px-8 py-3 text-lg font-medium bg-black hover:bg-gray-800 text-white rounded-lg flex items-center"
            >
              <Rocket className="w-5 h-5 mr-2" />
              {isAuthenticated ? 'Welcome!' : 'Get Started'}
            </button>
          </div>
        </div>

        {/* Footer Tagline */}
        <div className="text-center">
          <p className="text-gray-500 italic text-lg">Your health, your way—powered by AI.</p>
        </div>
      </main>
    </div>
  )
}

export default DashBoard