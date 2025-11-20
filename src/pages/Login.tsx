import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { GoogleOAuthProvider, GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { useAuth } from '../hooks/useAuth';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const AUTHORIZED_EMAILS = (import.meta.env.VITE_AUTHORIZED_EMAILS || '').split(',');

// Helper to decode JWT and get email
const parseJwt = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

const LoginContent: React.FC = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleAuthenticated, setIsGoogleAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      const success = login(password);

      if (success) {
        navigate('/content');
      } else {
        setError('Password non corretta');
        setPassword('');
        setIsLoading(false);
      }
    }, 500);
  };

  const handleGoogleSuccess = (credentialResponse: CredentialResponse) => {
    setError('');

    if (!credentialResponse.credential) {
      setError('Errore durante l\'autenticazione Google');
      return;
    }

    const payload = parseJwt(credentialResponse.credential);

    if (!payload || !payload.email) {
      setError('Impossibile ottenere l\'email dal profilo Google');
      return;
    }

    const email = payload.email.toLowerCase();

    // Check if email is authorized
    if (!AUTHORIZED_EMAILS.map((e: string) => e.toLowerCase().trim()).includes(email)) {
      setError(`Email non autorizzata: ${email}`);
      return;
    }

    // Login successful - save auth and show button
    loginWithGoogle(email);
    setUserEmail(email);
    setIsGoogleAuthenticated(true);
  };

  const handleAccediClick = () => {
    setIsLoading(true);
    // Navigate after a brief delay to ensure state is updated
    setTimeout(() => {
      // Force sessionStorage check before navigation
      const authToken = sessionStorage.getItem('alf_backoffice_auth');
      console.log('Auth token before navigation:', authToken);
      if (authToken) {
        navigate('/content', { replace: true });
      } else {
        setError('Errore: sessione non trovata');
        setIsLoading(false);
      }
    }, 100);
  };

  const handleGoogleError = () => {
    setError('Errore durante l\'autenticazione Google');
  };

  return (
    <>
      <Helmet>
        <title>Login - Backoffice Adele Lo Feudo</title>
      </Helmet>

      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Logo/Titolo */}
          <div className="text-center mb-8">
            <h1
              className="text-5xl font-bold mb-3 uppercase"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              <span className="text-white">ALF</span>
            </h1>
            <p className="text-white/60 text-sm uppercase tracking-wider">
              Backoffice Amministrazione
            </p>
          </div>

          {/* Form Card */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-secondary p-8 rounded-xl border"
            style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
          >
            {/* Google Login or Authenticated State */}
            {!isGoogleAuthenticated ? (
              <div className="flex flex-col gap-6">
                {/* Google Login */}
                <div className="flex flex-col items-center">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    theme="filled_black"
                    size="large"
                    text="continue_with"
                    shape="rectangular"
                    logo_alignment="left"
                  />
                </div>

                {/* Password Form - ONLY in development */}
                {import.meta.env.DEV && (
                  <>
                    {/* Divider */}
                    <div className="flex items-center gap-4">
                      <div className="flex-1 h-px bg-white/10"></div>
                      <span className="text-white/40 text-sm uppercase tracking-wider">oppure</span>
                      <div className="flex-1 h-px bg-white/10"></div>
                    </div>

                    {/* Password Form */}
                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                      <div>
                        <label className="block text-white/80 text-sm font-bold mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                          Password (Development Only)
                        </label>
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Inserisci la password"
                          className="w-full px-4 py-3 bg-background text-white border rounded-lg focus:outline-none focus:border-accent transition-colors"
                          style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                          disabled={isLoading}
                        />
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={isLoading || !password}
                        className="w-full py-3 px-6 bg-accent text-white font-bold uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
                        style={{ fontFamily: 'Montserrat, sans-serif' }}
                      >
                        {isLoading ? 'Caricamento...' : 'Accedi'}
                      </motion.button>
                    </form>
                  </>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-6">
                {/* User Info */}
                <div className="flex items-center gap-3 text-white/80">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-sm">Autenticato come <span className="font-semibold">{userEmail}</span></p>
                </div>

                {/* Brand Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAccediClick}
                  disabled={isLoading}
                  className="w-full py-4 px-8 bg-[#F02D6E] text-white font-bold text-lg uppercase tracking-wider hover:bg-[#D01257] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ fontFamily: 'Montserrat, sans-serif', borderRadius: 0 }}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Caricamento...
                    </span>
                  ) : (
                    'Accedi al Backoffice'
                  )}
                </motion.button>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg"
              >
                <p className="text-red-400 text-sm flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </p>
              </motion.div>
            )}

            {/* Info */}
            <div className="mt-6">
              <p className="text-white/40 text-xs text-center">
                Accesso riservato agli amministratori
              </p>
            </div>
          </motion.div>

          {/* Desktop Only Notice */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 text-center"
          >
            <div className="inline-flex items-center gap-2 text-white/40 text-xs">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Accesso consentito solo da desktop
            </div>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
};

const Login: React.FC = () => {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <LoginContent />
    </GoogleOAuthProvider>
  );
};

export default Login;
