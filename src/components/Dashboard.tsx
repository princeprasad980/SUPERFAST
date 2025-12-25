import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { TrackList } from './TrackList';
import { TrackDetail } from './TrackDetail';
import { CreateTrack } from './CreateTrack';
import { LogOut, Plus, LayoutDashboard, Package } from 'lucide-react';

interface Track {
  id: string;
  title: string;
  description: string;
  category_id: string | null;
  status: string;
  priority: string;
  tracking_number: string;
  created_at: string;
  updated_at: string;
}

interface Stats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
}

export function Dashboard() {
  const { signOut, user } = useAuth();
  const [view, setView] = useState<'list' | 'detail' | 'create'>('list');
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
  });
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    loadStats();
  }, [refreshKey]);

  const loadStats = async () => {
    if (!user) return;

    const { data: tracks } = await supabase
      .from('tracks')
      .select('status')
      .eq('user_id', user.id);

    if (tracks) {
      setStats({
        total: tracks.length,
        pending: tracks.filter((t) => t.status === 'pending').length,
        inProgress: tracks.filter((t) => t.status === 'in_progress').length,
        completed: tracks.filter((t) => t.status === 'completed').length,
      });
    }
  };

  const handleViewTrack = (trackId: string) => {
    setSelectedTrack(trackId);
    setView('detail');
  };

  const handleBack = () => {
    setView('list');
    setSelectedTrack(null);
    setRefreshKey((k) => k + 1);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-white" aria-hidden="true" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Track Management System
                </h1>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Sign out"
            >
              <LogOut className="w-5 h-5" aria-hidden="true" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {view === 'list' && (
          <>
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Track Overview
                  </h2>
                  <p className="text-gray-600">
                    Manage and monitor all your tracked items
                  </p>
                </div>
                <button
                  onClick={() => setView('create')}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                  aria-label="Create new track"
                >
                  <Plus className="w-5 h-5" aria-hidden="true" />
                  <span>New Track</span>
                </button>
              </div>

              <div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
                role="region"
                aria-label="Track statistics"
              >
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">
                      Total Tracks
                    </span>
                    <LayoutDashboard className="w-5 h-5 text-gray-400" aria-hidden="true" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">
                      Pending
                    </span>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full" aria-hidden="true"></div>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{stats.pending}</p>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">
                      In Progress
                    </span>
                    <div className="w-3 h-3 bg-blue-400 rounded-full" aria-hidden="true"></div>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{stats.inProgress}</p>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">
                      Completed
                    </span>
                    <div className="w-3 h-3 bg-green-400 rounded-full" aria-hidden="true"></div>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{stats.completed}</p>
                </div>
              </div>
            </div>

            <TrackList onViewTrack={handleViewTrack} refreshKey={refreshKey} />
          </>
        )}

        {view === 'detail' && selectedTrack && (
          <TrackDetail trackId={selectedTrack} onBack={handleBack} />
        )}

        {view === 'create' && <CreateTrack onBack={handleBack} />}
      </main>
    </div>
  );
}
