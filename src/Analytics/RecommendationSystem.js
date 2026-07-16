import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { RefreshCw, Star, ShoppingCart, AlertCircle } from 'lucide-react';

const API_BASE_URL = '/api';

const RecommendationSystem = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${API_BASE_URL}/recommendation-system`);
      setRecommendations(response.data.recommendations || []);
      setSummary(response.data.summary || {});
      setLastUpdated(new Date());
    } catch (err) {
      setError('Failed to load recommendation system data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  return (
    <div className="p-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Recommendation System</h2>
          <p className="text-gray-600">Hybrid (Collaborative + Content-Based)</p>
        </div>
        <button
          onClick={fetchRecommendations}
          disabled={loading}
          className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded-lg flex items-center gap-3">
          <AlertCircle className="h-5 w-5" /> {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-gray-500">Total Recommendations</p>
          <p className="text-4xl font-bold mt-3">{summary.total_recommendations?.toLocaleString() || '—'}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-gray-500">Top Category</p>
          <p className="text-4xl font-bold text-emerald-600 mt-3">{summary.top_category || '—'}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-gray-500">Avg Confidence</p>
          <p className="text-4xl font-bold mt-3">
            {summary.avg_confidence ? `${summary.avg_confidence}%` : '—'}
          </p>
        </div>
      </div>

      {/* Recommendations Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="p-6 border-b font-semibold">Personalized Product Recommendations</div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4">Generating hybrid recommendations...</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-4">Product</th>
                  <th className="text-left p-4">Category</th>
                  <th className="text-left p-4">Score</th>
                  <th className="text-left p-4">Reason</th>
                  <th className="text-left p-4">Est. Conversion</th>
                </tr>
              </thead>
              <tbody>
                {recommendations.map((rec, i) => (
                  <tr key={i} className="border-t hover:bg-gray-50">
                    <td className="p-4 font-medium">{rec.product}</td>
                    <td className="p-4">{rec.category}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <Star className="h-5 w-5 text-yellow-400" />
                        {rec.score?.toFixed(2)}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-600 max-w-md">{rec.reason}</td>
                    <td className="p-4 font-medium">
                      {(rec.estimated_conversion * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecommendationSystem;