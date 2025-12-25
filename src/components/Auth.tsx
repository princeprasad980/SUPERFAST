import { useState, FormEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, UserPlus, AlertCircle } from 'lucide-react';

export function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error } = isLogin
        ? await signIn(email, password)
        : await signUp(email, password);

      if (error) {
        setError(error.message);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
              <LogIn className="w-8 h-8 text-white" aria-hidden="true" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Track Management
            </h1>
            <p className="text-gray-600">
              {isLogin ? 'Sign in to your account' : 'Create a new account'}
            </p>
          </div>

          {error && (
            <div
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3"
              role="alert"
              aria-live="polite"
            >
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                placeholder="you@example.com"
                aria-required="true"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                placeholder="••••••••"
                aria-required="true"
                aria-describedby="password-hint"
              />
              {!isLogin && (
                <p id="password-hint" className="mt-2 text-sm text-gray-600">
                  Password must be at least 6 characters
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              aria-busy={loading}
            >
              {loading ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true"></span>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  {isLogin ? <LogIn className="w-5 h-5" aria-hidden="true" /> : <UserPlus className="w-5 h-5" aria-hidden="true" />}
                  <span>{isLogin ? 'Sign In' : 'Sign Up'}</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
              }}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm focus:outline-none focus:underline"
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>

        <p className="text-center text-sm text-gray-600 mt-6">
          Secure track management for all your items
        </p>
      </div>
    </div>
  );
}
