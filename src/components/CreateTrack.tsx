import { useState, FormEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';

interface CreateTrackProps {
  onBack: () => void;
}

export function CreateTrack({ onBack }: CreateTrackProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
  });

  const generateTrackingNumber = () => {
    const prefix = 'TRK';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setError(null);
    setLoading(true);

    try {
      const trackingNumber = generateTrackingNumber();

      const { error: insertError } = await supabase.from('tracks').insert({
        title: form.title,
        description: form.description,
        status: form.status,
        priority: form.priority,
        tracking_number: trackingNumber,
        user_id: user.id,
      });

      if (insertError) {
        setError(insertError.message);
      } else {
        onBack();
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg px-3 py-2"
          aria-label="Go back to track list"
        >
          <ArrowLeft className="w-5 h-5" aria-hidden="true" />
          <span>Back to Tracks</span>
        </button>
      </div>

      <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Create New Track
        </h2>

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

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Title <span className="text-red-600" aria-label="required">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
              placeholder="Enter a descriptive title"
              aria-required="true"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Description
            </label>
            <textarea
              id="description"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
              placeholder="Add any additional details or notes"
            ></textarea>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="status"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Initial Status
              </label>
              <select
                id="status"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow bg-white"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="priority"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Priority Level
              </label>
              <select
                id="priority"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow bg-white"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> A unique tracking number will be automatically
              generated when you create this track.
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onBack}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              aria-busy={loading}
            >
              {loading ? (
                <>
                  <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true"></span>
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" aria-hidden="true" />
                  <span>Create Track</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
