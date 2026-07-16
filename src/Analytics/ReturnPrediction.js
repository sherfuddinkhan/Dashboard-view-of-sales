import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { RefreshCw, AlertTriangle, AlertCircle } from 'lucide-react';

const API_BASE_URL = '/api';

const ReturnPrediction = () => {
  const [predictions, setPredictions] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchReturnPredictions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${API_BASE_URL}/return-prediction`);
      setPredictions(response.data.predictions || []);
      setSummary(response.data.summary || {});
      setLastUpdated(new Date());
    } catch (err) {
      setError('Failed to load return predictions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturnPredictions();
  }, []);

  const getRiskColor = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-amber-100 text-amber-700';
      case 'low': return 'bg-emerald-100 text-emerald-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Return Prediction</h2>
          <p className="text-gray-600">Decision Tree Model</p>
        </div>
        <button
          onClick={fetchReturnPredictions}
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
          <p className="text-gray-500">Predicted Returns</p>
          <p className="text-4xl font-bold text-red-600 mt-3">
            {summary.predicted_returns?.toLocaleString() || '—'}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-gray-500">High Risk Orders</p>
          <p className="text-4xl font-bold text-amber-600 mt-3">
            {summary.high_risk_count?.toLocaleString() || '—'}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-gray-500">Avg Return Risk</p>
          <p className="text-4xl font-bold mt-3">
            {summary.avg_risk ? `${summary.avg_risk}%` : '—'}
          </p>
        </div>
      </div>

      {/* Predictions Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="p-6 border-b font-semibold">High-Risk Return Predictions</div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4">Analyzing return risk...</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-4">Order ID</th>
                  <th className="text-left p-4">Product</th>
                  <th className="text-left p-4">Probability</th>
                  <th className="text-left p-4">Risk Level</th>
                  <th className="text-left p-4">Reasons</th>
                </tr>
              </thead>
              <tbody>
                {predictions.map((item, i) => (
                  <tr key={i} className="border-t hover:bg-gray-50">
                    <td className="p-4 font-mono">{item.order_id}</td>
                    <td className="p-4">{item.product}</td>
                    <td className="p-4 font-semibold">{(item.return_probability * 100).toFixed(1)}%</td>
                    <td className="p-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm ${getRiskColor(item.risk_level)}`}>
                        {item.risk_level}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-600">{item.reasons}</td>
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

export default ReturnPrediction;