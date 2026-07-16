import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { RefreshCw, Users, Trophy, Target, AlertCircle } from 'lucide-react';

const API_BASE_URL = '/api';

const RFMAnalysis = () => {
  const [rfmData, setRfmData] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchRFM = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${API_BASE_URL}/rfm-analysis`);
      setRfmData(response.data.customers || []);
      setSummary(response.data.summary || {});
      setLastUpdated(new Date());
    } catch (err) {
      setError('Failed to load RFM analysis');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRFM();
  }, []);

  const getRFMScoreColor = (score) => {
    if (score >= 12) return 'bg-emerald-100 text-emerald-700';
    if (score >= 9) return 'bg-blue-100 text-blue-700';
    if (score >= 6) return 'bg-amber-100 text-amber-700';
    return 'bg-red-100 text-red-700';
  };

  return (
    <div className="p-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">RFM Analysis</h2>
          <p className="text-gray-600">Recency • Frequency • Monetary Value</p>
        </div>
        <button
          onClick={fetchRFM}
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
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-gray-400" />
            <div>
              <p className="text-gray-500">Total Customers</p>
              <p className="text-4xl font-bold mt-1">{summary.total_customers?.toLocaleString() || '—'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <div className="flex items-center gap-3">
            <Trophy className="h-6 w-6 text-amber-500" />
            <div>
              <p className="text-gray-500">Highest RFM Score</p>
              <p className="text-4xl font-bold text-amber-600 mt-1">{summary.highest_rfm || '—'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-gray-500">Avg Monetary Value</p>
          <p className="text-4xl font-bold mt-3">₹{summary.avg_monetary?.toLocaleString() || '—'}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-gray-500">Churn Risk</p>
          <p className="text-4xl font-bold text-red-600 mt-3">
            {summary.churn_risk_percentage ? `${summary.churn_risk_percentage}%` : '—'}
          </p>
        </div>
      </div>

      {/* RFM Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="p-6 border-b font-semibold">Customer RFM Breakdown</div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4">Calculating RFM scores...</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-4">Customer ID</th>
                  <th className="text-left p-4">Recency (days)</th>
                  <th className="text-left p-4">Frequency</th>
                  <th className="text-left p-4">Monetary (₹)</th>
                  <th className="text-left p-4">RFM Score</th>
                  <th className="text-left p-4">Segment</th>
                </tr>
              </thead>
              <tbody>
                {rfmData.map((customer, i) => (
                  <tr key={i} className="border-t hover:bg-gray-50">
                    <td className="p-4 font-mono">{customer.customer_id}</td>
                    <td className="p-4">{customer.recency}</td>
                    <td className="p-4 font-medium">{customer.frequency}</td>
                    <td className="p-4">₹{customer.monetary?.toLocaleString()}</td>
                    <td className="p-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getRFMScoreColor(customer.rfm_score)}`}>
                        {customer.rfm_score}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                        {customer.segment}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Notes */}
      <div className="bg-gray-50 p-6 rounded-xl text-sm text-gray-600">
        <strong>RFM Scoring:</strong> Recency (1-5) + Frequency (1-5) + Monetary (1-5). Higher score = more valuable customer.
      </div>
    </div>
  );
};

export default RFMAnalysis;