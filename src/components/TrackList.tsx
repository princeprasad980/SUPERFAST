import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Search, Filter, Package, Calendar, ArrowUpDown } from 'lucide-react';

interface Track {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  tracking_number: string;
  created_at: string;
  updated_at: string;
}

interface TrackListProps {
  onViewTrack: (trackId: string) => void;
  refreshKey: number;
}

export function TrackList({ onViewTrack, refreshKey }: TrackListProps) {
  const { user } = useAuth();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [filteredTracks, setFilteredTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'title'>('date');

  useEffect(() => {
    loadTracks();
  }, [refreshKey]);

  useEffect(() => {
    filterAndSortTracks();
  }, [tracks, searchQuery, statusFilter, priorityFilter, sortBy]);

  const loadTracks = async () => {
    if (!user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('tracks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (data && !error) {
      setTracks(data);
    }
    setLoading(false);
  };

  const filterAndSortTracks = () => {
    let filtered = [...tracks];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (track) =>
          track.title.toLowerCase().includes(query) ||
          track.tracking_number.toLowerCase().includes(query) ||
          track.description.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((track) => track.status === statusFilter);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter((track) => track.priority === priorityFilter);
    }

    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      } else {
        return a.title.localeCompare(b.title);
      }
    });

    setFilteredTracks(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div
        className="flex items-center justify-center py-12"
        role="status"
        aria-live="polite"
      >
        <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" aria-hidden="true"></div>
        <span className="sr-only">Loading tracks...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="search" className="sr-only">
              Search tracks
            </label>
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
                aria-hidden="true"
              />
              <input
                id="search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, tracking number, or description..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <div>
              <label htmlFor="status-filter" className="sr-only">
                Filter by status
              </label>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                aria-label="Filter by status"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label htmlFor="priority-filter" className="sr-only">
                Filter by priority
              </label>
              <select
                id="priority-filter"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                aria-label="Filter by priority"
              >
                <option value="all">All Priority</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <button
              onClick={() => setSortBy(sortBy === 'date' ? 'title' : 'date')}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 transition-colors"
              aria-label={`Sort by ${sortBy === 'date' ? 'title' : 'date'}`}
            >
              <ArrowUpDown className="w-5 h-5 text-gray-600" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {filteredTracks.length === 0 ? (
        <div className="bg-white rounded-xl p-12 border border-gray-200 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" aria-hidden="true" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No tracks found
          </h3>
          <p className="text-gray-600">
            {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all'
              ? 'Try adjusting your filters or search query'
              : 'Create your first track to get started'}
          </p>
        </div>
      ) : (
        <div
          className="grid grid-cols-1 lg:grid-cols-2 gap-4"
          role="list"
          aria-label="Track items"
        >
          {filteredTracks.map((track) => (
            <article
              key={track.id}
              className="bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer focus-within:ring-2 focus-within:ring-blue-500"
              onClick={() => onViewTrack(track.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onViewTrack(track.id);
                }
              }}
              tabIndex={0}
              role="button"
              aria-label={`View details for ${track.title}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-lg mb-1">
                    {track.title}
                  </h3>
                  <p className="text-sm text-gray-600 font-mono">
                    {track.tracking_number}
                  </p>
                </div>
                <div className="flex gap-2">
                  <span
                    className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(
                      track.status
                    )}`}
                  >
                    {track.status.replace('_', ' ')}
                  </span>
                  <span
                    className={`px-3 py-1 text-xs font-medium rounded-full border ${getPriorityColor(
                      track.priority
                    )}`}
                  >
                    {track.priority}
                  </span>
                </div>
              </div>

              {track.description && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {track.description}
                </p>
              )}

              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="w-4 h-4 mr-2" aria-hidden="true" />
                <span>Updated {formatDate(track.updated_at)}</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
