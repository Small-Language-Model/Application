import { Link, useNavigate } from 'react-router';
import { useLocation } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { Brain, Menu, X, LogOut, User, Coins } from 'lucide-react';
import { useState } from 'react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isChatPage = location.pathname === '/chat';

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2 font-bold text-xl text-blue-600">
              <Brain className="w-8 h-8" />
              <span>VitalLM</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <Link to="/" className="text-slate-700 hover:text-blue-600 transition-colors">
                Home
              </Link>
              <Link to="/model" className="text-slate-700 hover:text-blue-600 transition-colors">
                Model
              </Link>
              <Link to="/pricing" className="text-slate-700 hover:text-blue-600 transition-colors">
                Pricing
              </Link>
              <Link to="/guide" className="text-slate-700 hover:text-blue-600 transition-colors">
                Guide & FAQ
              </Link>
              {user && (
                <Link to="/chat" className="text-slate-700 hover:text-blue-600 transition-colors">
                  Chat
                </Link>
              )}
              {user?.isAdmin && (
                <Link to="/admin" className="text-slate-700 hover:text-blue-600 transition-colors">
                  Admin
                </Link>
              )}
            </div>

            {/* User Menu */}
            <div className="hidden md:flex items-center gap-4">
              {user && !isChatPage ? (
                <>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg">
                    <Coins className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-slate-700">
                      {user.tokensRemaining.toLocaleString()} prompts
                    </span>
                  </div>
                  <Link to="/settings" className="flex items-center gap-2">
                    <img
                      src={user.profileImageUrl ?? `https://api.dicebear.com/6.x/initials/svg?seed=${encodeURIComponent(
                        user.name
                      )}`}
                      alt="Profile"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  </Link>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-700">{user.name}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:text-red-600 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </>
              ) : !user ? (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 text-slate-700 hover:text-blue-600 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Sign Up
                  </Link>
                </>
              ) : null}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-700"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t">
              <div className="flex flex-col gap-3">
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-2 text-slate-700 hover:bg-slate-50 rounded-lg"
                >
                  Home
                </Link>
                <Link
                  to="/model"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-2 text-slate-700 hover:bg-slate-50 rounded-lg"
                >
                  Model
                </Link>
                <Link
                  to="/pricing"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-2 text-slate-700 hover:bg-slate-50 rounded-lg"
                >
                  Pricing
                </Link>
                <Link
                  to="/guide"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-2 text-slate-700 hover:bg-slate-50 rounded-lg"
                >
                  Guide & FAQ
                </Link>
                {user && (
                  <Link
                    to="/chat"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-2 text-slate-700 hover:bg-slate-50 rounded-lg"
                  >
                    Chat
                  </Link>
                )}
                {user?.isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-2 text-slate-700 hover:bg-slate-50 rounded-lg"
                  >
                    Admin
                  </Link>
                )}
                <div className="border-t my-2"></div>
                {user && !isChatPage ? (
                  <>
                    <div className="px-4 py-2">
                      <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                        <img
                          src={user.profileImageUrl ?? `https://api.dicebear.com/6.x/initials/svg?seed=${encodeURIComponent(
                            user.name
                          )}`}
                          alt="Profile"
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        {user.name}
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg">
                        <Coins className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-slate-700">
                          {user.tokensRemaining.toLocaleString()} prompts
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 items-center mx-4">
                      <Link to="/settings" className="px-3 py-2 text-sm text-slate-700 hover:text-blue-600">
                        Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="px-4 py-2 flex items-center gap-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </>
                ) : !user ? (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="mx-4 px-4 py-2 text-center border border-slate-300 rounded-lg hover:bg-slate-50"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="mx-4 px-4 py-2 text-center bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Sign Up
                    </Link>
                  </>
                ) : null}
              </div>
            </div>
          )}
        </nav>
      </header>

      <main className="flex-1">{children}</main>

      {!isChatPage && (
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 font-bold text-lg text-blue-600 mb-3">
                <Brain className="w-6 h-6" />
                VitalLM
              </div>
              <p className="text-slate-600 text-sm">
                Open-source small language model for everyone. Train, scale, and deploy on your terms.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-3">Quick Links</h3>
              <div className="flex flex-col gap-2">
                <Link to="/model" className="text-slate-600 hover:text-blue-600 text-sm">
                  Model Details
                </Link>
                <Link to="/guide" className="text-slate-600 hover:text-blue-600 text-sm">
                  Documentation
                </Link>
                <Link to="/chat" className="text-slate-600 hover:text-blue-600 text-sm">
                  Try Chat
                </Link>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-3">Open Source</h3>
              <p className="text-slate-600 text-sm">
                Licensed under MIT. Download, modify, and deploy on your infrastructure.
              </p>
            </div>
          </div>
          <div className="border-t mt-8 pt-6 text-center text-slate-600 text-sm">
            © 2026 VitalLM. All rights reserved.
          </div>
        </div>
      </footer>
      )}
    </div>
  );
}
