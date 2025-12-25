import { useAuth } from './contexts/AuthContext';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" aria-hidden="true"></div>
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  return user ? <Dashboard /> : <Auth />;
}

export default App;
