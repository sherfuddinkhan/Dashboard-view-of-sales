import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { RefreshCw, Users, TrendingUp, AlertCircle } from 'lucide-react';

const API_BASE_URL = '/api';

const CustomerSegmentation = () => {
  const [segments, setSegments] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchSegmentation = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${API_BASE_URL}/customer-segmentation`);
      
      setSegments(response.data.segments || []);
      setSummary(response.data.summary || {});
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching segmentation:', err);
      setError(err.response?.data?.error || 'Failed to load customer segmentation data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSegmentation();
  }, []);

  const getSegmentColor = (segment) => {
    const colors = {
      'High Value': 'bg-emerald-100 text-emerald-700',
      'Loyal': 'bg-blue-100 text-blue-700',
      'At Risk': 'bg-amber-100 text-amber-700',
      'Churn': 'bg-red-100 text-red-700',
      'New': 'bg-purple-100 text-purple-700',
    };
    return colors[segment] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Customer Segmentation</h2>
          <p className="text-gray-600 mt-1">
            K-Means clustering based on RFM metrics and purchase behavior
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <p className="text-sm text-gray-500">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
          <button
            onClick={fetchSegmentation}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center gap-3">
          <AlertCircle className="h-5 w-5" />
          <p>{error}</p>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow">
          <div className="flex justify-between items-center">
            <p className="text-gray-500 text-sm">Total Customers</p>
            <Users className="h-5 w-5 text-gray-400" />
          </div>
          <p className="text-4xl font-bold mt-3">
            {summary.total_customers?.toLocaleString() || '—'}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <div className="flex justify-between items-center">
            <p className="text-gray-500 text-sm">High Value</p>
            <TrendingUp className="h-5 w-5 text-emerald-600" />
          </div>
          <p className="text-4xl font-bold text-emerald-600 mt-3">
            {summary.high_value_percentage ? `${summary.high_value_percentage}%` : '—'}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-gray-500 text-sm">Avg Order Value</p>
          <p className="text-4xl font-bold mt-3">
            ${summary.avg_order_value?.toFixed(2) || '—'}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-gray-500 text-sm">Clusters</p>
          <p className="text-4xl font-bold mt-3">
            {summary.num_clusters || 5}
          </p>
        </div>
      </div>

      {/* Segments Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="p-6 border-b">
          <h3 className="font-semibold text-lg">Customer Segments</h3>
        </div>
        
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Running K-Means clustering...</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="text-left p-4">Segment</th>
                  <th className="text-left p-4">Customers</th>
                  <th className="text-left p-4">% of Total</th>
                  <th className="text-left p-4">Avg RFM Score</th>
                  <th className="text-left p-4">Avg Order Value</th>
                  <th className="text-left p-4">Characteristics</th>
                </tr>
              </thead>
              <tbody>
                {segments.length > 0 ? (
                  segments.map((segment, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getSegmentColor(segment.segment)}`}>
                          {segment.segment}
                        </span>
                      </td>
                      <td className="p-4 font-medium">{segment.count?.toLocaleString()}</td>
                      <td className="p-4">{segment.percentage}%</td>
                      <td className="p-4">{segment.avg_rfm_score?.toFixed(1)}</td>
                      <td className="p-4">${segment.avg_order_value?.toFixed(2)}</td>
                      <td className="p-4 text-sm text-gray-600 max-w-md">{segment.characteristics}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="p-12 text-center text-gray-500">
                      No segmentation data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Notes */}
      <div className="bg-gray-50 p-6 rounded-xl text-sm text-gray-600">
        <strong>How it works:</strong> Customers are clustered using K-Means on Recency, Frequency, Monetary (RFM) features.
      </div>
    </div>
  );
};

export default CustomerSegmentation;