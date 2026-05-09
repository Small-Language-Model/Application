import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { extractTokenFromCallback, getApiBaseUrl } from '../lib/googleAuth';
import { getCurrentUser, UserPublic } from '../lib/api';
import { AlertCircle, Loader } from 'lucide-react';

export default function GoogleAuthCallback() {
  const navigate = useNavigate();
  const { setAuthToken } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { accessToken, error: extractError } = extractTokenFromCallback();

        if (extractError) {
          setError(extractError);
          setLoading(false);
          return;
        }

        if (!accessToken) {
          setError('No access token received from Google OAuth');
          setLoading(false);
          return;
        }

        // Store the token in localStorage and context
        localStorage.setItem('auth_token', accessToken);
        setAuthToken(accessToken);

        // Redirect to chat after token is set
        setTimeout(() => {
          navigate('/chat', { replace: true });
        }, 500);
      } catch (err) {
        setError('Failed to complete authentication. Please try again.');
        setLoading(false);
      }
    };

    handleCallback();
  }, [navigate, setAuthToken]);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center">
          {loading ? (
            <>
              <div className="inline-flex items-center justify-center mb-4">
                <Loader className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Signing in...</h1>
              <p className="text-slate-600">Completing your Google authentication</p>
            </>
          ) : error ? (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-2xl mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Authentication Failed</h1>
              <p className="text-slate-600 mb-6">{error}</p>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/login', { replace: true })}
                  className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Back to Login
                </button>
                <button
                  onClick={() => navigate('/register', { replace: true })}
                  className="w-full py-3 bg-white text-blue-600 border border-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                >
                  Back to Register
                </button>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
