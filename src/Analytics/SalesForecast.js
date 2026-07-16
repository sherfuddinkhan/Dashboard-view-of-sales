import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { RefreshCw, TrendingUp, Calendar, AlertCircle, BarChart3 } from 'lucide-react';

const API_BASE_URL = '/api';

const SalesForecast = () => {
  const [forecast, setForecast] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchForecast = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${API_BASE_URL}/sales-forecast`);
      setForecast(response.data.forecast || []);
      setSummary(response.data.summary || {});
      setLastUpdated(new Date());
    } catch (err) {
      setError('Failed to load sales forecast');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForecast();
  }, []);

  const getTrendColor = (trend) => {
    if (trend === 'Up') return 'text-emerald-600';
    if (trend === 'Down') return 'text-red-600';
    return 'text-amber-600';
  };

  return (
    <div className="p-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Sales Forecast</h2>
          <p className="text-gray-600">XGBoost + Linear Regression</p>
        </div>
        <button
          onClick={fetchForecast}
          disabled={loading}
          className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded-lg flex items-center gap-3">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow">
          <div className="flex justify-between">
            <p className="text-gray-500">Next 30 Days</p>
            <Calendar className="h-5 w-5 text-gray-400" />
          </div>
          <p className="text-4xl font-bold mt-3">
            ₹{summary.next_30_days?.toLocaleString() || '—'}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-gray-500">Next 90 Days</p>
          <p className="text-4xl font-bold mt-3">
            ₹{summary.next_90_days?.toLocaleString() || '—'}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-gray-500">Growth Rate</p>
          <p className="text-4xl font-bold text-emerald-600 mt-3">
            {summary.growth_rate ? `${summary.growth_rate}%` : '—'}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-gray-500">Model Accuracy</p>
          <p className="text-4xl font-bold mt-3">
            {summary.accuracy ? `${summary.accuracy}%` : '—'}
          </p>
        </div>
      </div>

      {/* Forecast Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="p-6 border-b font-semibold">Next 30 Days Sales Forecast</div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4">Generating forecast...</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-4">Date</th>
                  <th className="text-left p-4">Predicted Sales</th>
                  <th className="text-left p-4">Lower Bound</th>
                  <th className="text-left p-4">Upper Bound</th>
                  <th className="text-left p-4">Trend</th>
                </tr>
              </thead>
              <tbody>
                {forecast.map((day, i) => (
                  <tr key={i} className="border-t hover:bg-gray-50">
                    <td className="p-4">{day.date}</td>
                    <td className="p-4 font-semibold">₹{day.predicted?.toLocaleString()}</td>
                    <td className="p-4">₹{day.lower_bound?.toLocaleString()}</td>
                    <td className="p-4">₹{day.upper_bound?.toLocaleString()}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-sm ${day.trend === 'Up' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {day.trend}
                      </span>
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

export default SalesForecast;