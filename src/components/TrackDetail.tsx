import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  MessageSquare,
  Plus,
  Trash2,
  Edit,
} from 'lucide-react';

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

interface TrackUpdate {
  id: string;
  status: string;
  message: string;
  location: string;
  created_at: string;
}

interface TrackDetailProps {
  trackId: string;
  onBack: () => void;
}

export function TrackDetail({ trackId, onBack }: TrackDetailProps) {
  const { user } = useAuth();
  const [track, setTrack] = useState<Track | null>(null);
  const [updates, setUpdates] = useState<TrackUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [updateForm, setUpdateForm] = useState({
    status: '',
    message: '',
    location: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    status: '',
    priority: '',
  });

  useEffect(() => {
    loadTrackDetails();
  }, [trackId]);

  const loadTrackDetails = async () => {
    if (!user) return;

    setLoading(true);

    const { data: trackData } = await supabase
      .from('tracks')
      .select('*')
      .eq('id', trackId)
      .eq('user_id', user.id)
      .maybeSingle();

    const { data: updatesData } = await supabase
      .from('track_updates')
      .select('*')
      .eq('track_id', trackId)
      .order('created_at', { ascending: false });

    if (trackData) {
      setTrack(trackData);
      setEditForm({
        title: trackData.title,
        description: trackData.description,
        status: trackData.status,
        priority: trackData.priority,
      });
      setUpdateForm({ ...updateForm, status: trackData.status });
    }

    if (updatesData) {
      setUpdates(updatesData);
    }

    setLoading(false);
  };

  const handleAddUpdate = async () => {
    if (!user || !track) return;

    const { error } = await supabase.from('track_updates').insert({
      track_id: trackId,
      status: updateForm.status,
      message: updateForm.message,
      location: updateForm.location,
      user_id: user.id,
    });

    if (!error) {
      await supabase
        .from('tracks')
        .update({ status: updateForm.status })
        .eq('id', trackId);

      setUpdateForm({ status: updateForm.status, message: '', location: '' });
      setShowUpdateForm(false);
      loadTrackDetails();
    }
  };

  const handleUpdateTrack = async () => {
    if (!user) return;

    const { error } = await supabase
      .from('tracks')
      .update({
        title: editForm.title,
        description: editForm.description,
        status: editForm.status,
        priority: editForm.priority,
      })
      .eq('id', trackId);

    if (!error) {
      setIsEditing(false);
      loadTrackDetails();
    }
  };

  const handleDeleteTrack = async () => {
    if (!user || !confirm('Are you sure you want to delete this track?')) return;

    const { error } = await supabase.from('tracks').delete().eq('id', trackId);

    if (!error) {
      onBack();
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
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

  if (loading) {
    return (
      <div
        className="flex items-center justify-center py-12"
        role="status"
        aria-live="polite"
      >
        <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" aria-hidden="true"></div>
        <span className="sr-only">Loading track details...</span>
      </div>
    );
  }

  if (!track) {
    return (
      <div className="bg-white rounded-xl p-12 border border-gray-200 text-center">
        <p className="text-gray-600">Track not found</p>
        <button
          onClick={onBack}
          className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
        >
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg px-3 py-2"
          aria-label="Go back to track list"
        >
          <ArrowLeft className="w-5 h-5" aria-hidden="true" />
          <span>Back to Tracks</span>
        </button>

        <div className="flex gap-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            aria-label={isEditing ? 'Cancel editing' : 'Edit track'}
          >
            <Edit className="w-5 h-5" aria-hidden="true" />
            <span>{isEditing ? 'Cancel' : 'Edit'}</span>
          </button>
          <button
            onClick={handleDeleteTrack}
            className="flex items-center gap-2 px-4 py-2 text-red-700 hover:bg-red-50 rounded-lg border border-red-300 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
            aria-label="Delete track"
          >
            <Trash2 className="w-5 h-5" aria-hidden="true" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label
                htmlFor="edit-title"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Title
              </label>
              <input
                id="edit-title"
                type="text"
                value={editForm.title}
                onChange={(e) =>
                  setEditForm({ ...editForm, title: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label
                htmlFor="edit-description"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Description
              </label>
              <textarea
                id="edit-description"
                value={editForm.description}
                onChange={(e) =>
                  setEditForm({ ...editForm, description: e.target.value })
                }
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              ></textarea>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="edit-status"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Status
                </label>
                <select
                  id="edit-status"
                  value={editForm.status}
                  onChange={(e) =>
                    setEditForm({ ...editForm, status: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="edit-priority"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Priority
                </label>
                <select
                  id="edit-priority"
                  value={editForm.priority}
                  onChange={(e) =>
                    setEditForm({ ...editForm, priority: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleUpdateTrack}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              Save Changes
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {track.title}
              </h2>
              <p className="text-gray-600 font-mono text-sm mb-4">
                Tracking #{track.tracking_number}
              </p>
              {track.description && (
                <p className="text-gray-700">{track.description}</p>
              )}
            </div>

            <div className="flex flex-wrap gap-3 mb-6">
              <span
                className={`px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(
                  track.status
                )}`}
              >
                {track.status.replace('_', ' ')}
              </span>
              <span className="px-3 py-1 text-sm font-medium rounded-full border bg-gray-100 text-gray-800 border-gray-200">
                Priority: {track.priority}
              </span>
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-600 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" aria-hidden="true" />
                <span>Created {formatDateTime(track.created_at)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" aria-hidden="true" />
                <span>Updated {formatDateTime(track.updated_at)}</span>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Activity Timeline</h3>
          <button
            onClick={() => setShowUpdateForm(!showUpdateForm)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            aria-label={showUpdateForm ? 'Cancel adding update' : 'Add update'}
          >
            <Plus className="w-5 h-5" aria-hidden="true" />
            <span>Add Update</span>
          </button>
        </div>

        {showUpdateForm && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="update-status"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Status
                </label>
                <select
                  id="update-status"
                  value={updateForm.status}
                  onChange={(e) =>
                    setUpdateForm({ ...updateForm, status: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="update-message"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Message
                </label>
                <textarea
                  id="update-message"
                  value={updateForm.message}
                  onChange={(e) =>
                    setUpdateForm({ ...updateForm, message: e.target.value })
                  }
                  rows={3}
                  placeholder="Add a note about this update..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                ></textarea>
              </div>

              <div>
                <label
                  htmlFor="update-location"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Location
                </label>
                <input
                  id="update-location"
                  type="text"
                  value={updateForm.location}
                  onChange={(e) =>
                    setUpdateForm({ ...updateForm, location: e.target.value })
                  }
                  placeholder="Optional location information"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <button
                onClick={handleAddUpdate}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                Add Update
              </button>
            </div>
          </div>
        )}

        <div className="space-y-4" role="list" aria-label="Track updates timeline">
          {updates.length === 0 ? (
            <p className="text-center text-gray-600 py-8">
              No updates yet. Add the first update to track progress.
            </p>
          ) : (
            updates.map((update, index) => (
              <div
                key={update.id}
                className="flex gap-4 relative"
                role="listitem"
              >
                {index < updates.length - 1 && (
                  <div
                    className="absolute left-4 top-10 bottom-0 w-0.5 bg-gray-200"
                    aria-hidden="true"
                  ></div>
                )}
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center relative z-10">
                  <div className="w-2 h-2 bg-white rounded-full" aria-hidden="true"></div>
                </div>
                <div className="flex-1 pb-6">
                  <div className="flex items-center gap-3 mb-1">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(
                        update.status
                      )}`}
                    >
                      {update.status.replace('_', ' ')}
                    </span>
                    <span className="text-sm text-gray-600">
                      {formatDateTime(update.created_at)}
                    </span>
                  </div>
                  {update.message && (
                    <p className="text-gray-700 mb-2 flex items-start gap-2">
                      <MessageSquare className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
                      {update.message}
                    </p>
                  )}
                  {update.location && (
                    <p className="text-gray-600 text-sm flex items-center gap-2">
                      <MapPin className="w-4 h-4" aria-hidden="true" />
                      {update.location}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
