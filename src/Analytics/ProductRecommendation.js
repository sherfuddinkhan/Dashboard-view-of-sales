import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { RefreshCw, ShoppingCart, TrendingUp, Target, AlertCircle } from 'lucide-react';


const ProductRecommendation = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const API_BASE_URL = 'http://127.0.0.1:5000/api';

  const fetchRecommendations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE_URL}/product-recommendations`);
      setRecommendations(res.data.recommendations || []);
      setSummary(res.data.summary || {});
      setLastUpdated(new Date());
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to load recommendations. Is Flask running?');
    } finally {
      loading && setLoading(false); // Quick safe check
      setLoading(false);
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  return (
    <div className="recommendation-container">
      {/* Header */}
      <div className="recommendation-header">
        <div>
          <h2 className="header-title">
            <Target className="icon-blue" /> Product Recommendations
          </h2>
          <p className="header-subtitle">Market Basket Analysis using Apriori Algorithm</p>
          {lastUpdated && (
            <p className="header-timestamp">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
        <button
          onClick={fetchRecommendations}
          disabled={loading}
          className="refresh-btn"
        >
          <RefreshCw className={`btn-icon ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Loading...' : 'Refresh Analysis'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="error-banner">
          <AlertCircle className="error-icon" /> {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="summary-grid">
        <div className="summary-card">
          <div className="card-header">
            <p className="card-label">Total Rules Found</p>
            <ShoppingCart className="icon-blue-small" />
          </div>
          <p className="card-value">{summary.total_rules ?? 0}</p>
        </div>

        <div className="summary-card">
          <div className="card-header">
            <p className="card-label">Highest Lift</p>
            <TrendingUp className="icon-emerald" />
          </div>
          <p className="card-value text-emerald">
            {summary.top_lift ? summary.top_lift.toFixed(2) : '—'}
          </p>
        </div>

        <div className="summary-card">
          <div className="card-header">
            <p className="card-label">Avg Confidence</p>
            <Target className="icon-purple" />
          </div>
          <p className="card-value text-purple">
            {summary.avg_confidence ? `${(summary.avg_confidence * 100).toFixed(0)}%` : '—'}
          </p>
        </div>
      </div>

      {/* Table Container */}
      <div className="table-card">
        <div className="table-header">
          <h3 className="table-title">Frequently Bought Together</h3>
          <p className="table-subtitle">If a customer buys antecedent, recommend consequent</p>
        </div>
        
        <div className="table-responsive">
          <table className="recommendation-table">
            <thead>
              <tr>
                <th>If Bought</th>
                <th>Then Recommend</th>
                <th>Support</th>
                <th>Confidence</th>
                <th>Lift</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="table-status-text text-light">
                    Analyzing transactions...
                  </td>
                </tr>
              ) : recommendations.length === 0 ? (
                <tr>
                  <td colSpan="5" className="table-status-text">
                    No strong associations found. Lower min_support in backend.
                  </td>
                </tr>
              ) : (
                recommendations.map((r, i) => (
                  <tr key={i} className="table-row">
                    <td>
                      <span className="badge-blue">
                        {Array.isArray(r.antecedent) ? r.antecedent.join(', ') : r.antecedent}
                      </span>
                    </td>
                    <td className="font-semibold text-dark">
                      {Array.isArray(r.consequent) ? r.consequent.join(', ') : r.consequent}
                    </td>
                    <td className="text-muted">
                      {r.support ? `${(r.support * 100).toFixed(1)}%` : '-'}
                    </td>
                    <td>
                      <span className="font-medium">{(r.confidence * 100).toFixed(1)}%</span>
                    </td>
                    <td className="font-bold text-emerald">
                      {r.lift?.toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductRecommendation;