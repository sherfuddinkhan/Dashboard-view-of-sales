import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { RefreshCw, Target } from 'lucide-react';

const ProductRecommendation = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const API_BASE_URL = '/api';

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE_URL}/product-recommendations`);
      setRecommendations(res.data.recommendations || []);
      setSummary(res.data.summary || {});
      setLastUpdated(new Date());
    } catch (err) {
      setError('Failed to load recommendations');
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
          <h2 className="text-3xl font-bold">Product Recommendations</h2>
          <p className="text-gray-600">Apriori Algorithm</p>
        </div>
        <button onClick={fetchRecommendations} disabled={loading}
          className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-4 rounded-lg">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-gray-500">Total Rules</p>
          <p className="text-4xl font-bold mt-2">{summary.total_rules || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-gray-500">Top Lift</p>
          <p className="text-4xl font-bold text-emerald-600 mt-2">{summary.top_lift?.toFixed(2) || '—'}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="p-6 border-b font-semibold">Frequently Bought Together</div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-4">If Bought</th>
                <th className="text-left p-4">Then Recommend</th>
                <th className="text-left p-4">Confidence</th>
                <th className="text-left p-4">Lift</th>
              </tr>
            </thead>
            <tbody>
              {recommendations.map((r, i) => (
                <tr key={i} className="border-t hover:bg-gray-50">
                  <td className="p-4">{r.antecedent}</td>
                  <td className="p-4 font-medium">{r.consequent}</td>
                  <td className="p-4">{(r.confidence * 100).toFixed(1)}%</td>
                  <td className="p-4 font-bold text-emerald-600">{r.lift.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductRecommendation;