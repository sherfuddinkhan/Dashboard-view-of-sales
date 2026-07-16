import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { RefreshCw, Package, TrendingUp, AlertCircle, DollarSign } from 'lucide-react';

const API_BASE_URL = '/api';

const InventoryAnalysis = () => {
  const [inventory, setInventory] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchInventoryAnalysis = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${API_BASE_URL}/inventory-analysis`);
      setInventory(response.data.inventory || []);
      setSummary(response.data.summary || {});
      setLastUpdated(new Date());
    } catch (err) {
      setError('Failed to load inventory analysis');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventoryAnalysis();
  }, []);

  const getCategoryColor = (category) => {
    switch (category) {
      case 'A': return 'bg-emerald-100 text-emerald-700';
      case 'B': return 'bg-blue-100 text-blue-700';
      case 'C': return 'bg-amber-100 text-amber-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Inventory Analysis</h2>
          <p className="text-gray-600">ABC Analysis</p>
        </div>
        <button
          onClick={fetchInventoryAnalysis}
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
            <Package className="h-6 w-6 text-gray-400" />
            <div>
              <p className="text-gray-500">Total SKUs</p>
              <p className="text-4xl font-bold mt-1">{summary.total_skus?.toLocaleString() || '—'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <div className="flex items-center gap-3">
            <DollarSign className="h-6 w-6 text-emerald-600" />
            <div>
              <p className="text-gray-500">Category A Value</p>
              <p className="text-4xl font-bold text-emerald-600 mt-1">
                ₹{summary.category_a_value?.toLocaleString() || '—'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-gray-500">High Velocity Items</p>
          <p className="text-4xl font-bold mt-3">{summary.high_velocity_count?.toLocaleString() || '—'}</p>
        </div>
      </div>

      {/* ABC Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="p-6 border-b font-semibold">ABC Inventory Classification</div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4">Performing ABC Analysis...</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-4">Product</th>
                  <th className="text-left p-4">Category</th>
                  <th className="text-left p-4">Annual Value</th>
                  <th className="text-left p-4">% of Total</th>
                  <th className="text-left p-4">Units Sold</th>
                  <th className="text-left p-4">Stock Level</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item, i) => (
                  <tr key={i} className="border-t hover:bg-gray-50">
                    <td className="p-4 font-medium">{item.product}</td>
                    <td className="p-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(item.category)}`}>
                        {item.category}
                      </span>
                    </td>
                    <td className="p-4">₹{item.annual_value?.toLocaleString()}</td>
                    <td className="p-4">{item.value_percentage}%</td>
                    <td className="p-4">{item.units_sold?.toLocaleString()}</td>
                    <td className={`p-4 ${item.stock_level < 50 ? 'text-red-600 font-medium' : ''}`}>
                      {item.stock_level}
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

export default InventoryAnalysis;