import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { RefreshCw, Package, ShoppingCart, TrendingUp, AlertTriangle, AlertCircle } from 'lucide-react';

const API_BASE_URL = '/api'; // Node.js API

const AmazonDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${API_BASE_URL}/dashboard`);
      setData(response.data);
      setLastUpdated(new Date());
    } catch (err) {
      setError('Failed to load Amazon dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-800">Amazon Dashboard</h1>
          <p className="text-gray-600">Real-time operational data from Amazon Seller Account</p>
        </div>
        <button
          onClick={fetchDashboard}
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow">
          <div className="flex justify-between items-center">
            <p className="text-gray-500">Total Products</p>
            <Package className="h-6 w-6 text-gray-400" />
          </div>
          <p className="text-4xl font-bold mt-3">{data?.summary?.totalProducts?.toLocaleString() || 0}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <div className="flex justify-between items-center">
            <p className="text-gray-500">Total Orders</p>
            <ShoppingCart className="h-6 w-6 text-gray-400" />
          </div>
          <p className="text-4xl font-bold mt-3">{data?.summary?.totalOrders?.toLocaleString() || 0}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <div className="flex justify-between items-center">
            <p className="text-gray-500">Revenue</p>
            <TrendingUp className="h-6 w-6 text-emerald-600" />
          </div>
          <p className="text-4xl font-bold mt-3 text-emerald-600">
            ₹{data?.summary?.revenue?.toLocaleString() || 0}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <div className="flex justify-between items-center">
            <p className="text-gray-500">Returns</p>
            <AlertTriangle className="h-6 w-6 text-red-500" />
          </div>
          <p className="text-4xl font-bold mt-3 text-red-600">
            {data?.summary?.returns?.toLocaleString() || 0}
          </p>
        </div>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Products Table */}
        <div className="bg-white rounded-xl shadow">
          <div className="p-6 border-b font-semibold">Products</div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-4">ASIN</th>
                  <th className="text-left p-4">Name</th>
                  <th className="text-left p-4">Price</th>
                  <th className="text-left p-4">Stock</th>
                </tr>
              </thead>
              <tbody>
                {data?.products?.slice(0, 8).map((p, i) => (
                  <tr key={i} className="border-t hover:bg-gray-50">
                    <td className="p-4 font-mono text-sm">{p.asin}</td>
                    <td className="p-4">{p.name}</td>
                    <td className="p-4">₹{p.price}</td>
                    <td className="p-4">{p.stock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Orders Table */}
        <div className="bg-white rounded-xl shadow">
          <div className="p-6 border-b font-semibold">Recent Orders</div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-4">Order ID</th>
                  <th className="text-left p-4">Amount</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {data?.orders?.slice(0, 8).map((o, i) => (
                  <tr key={i} className="border-t hover:bg-gray-50">
                    <td className="p-4 font-mono">{o.orderId}</td>
                    <td className="p-4">₹{o.amount}</td>
                    <td className="p-4">{o.status}</td>
                    <td className="p-4">{o.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AmazonDashboard;