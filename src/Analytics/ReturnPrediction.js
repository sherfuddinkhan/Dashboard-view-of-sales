import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Card, CardContent, CardHeader, CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, AlertTriangle, ShieldCheck, AlertCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

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
      
      toast.success('Return predictions updated');
    } catch (err) {
      console.error('Error fetching return predictions:', err);
      setError(err.response?.data?.error || 'Failed to load return predictions');
      toast.error('Failed to load return predictions');
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
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Return Prediction</h2>
          <p className="text-muted-foreground mt-1">
            Decision Tree Model • Predict likelihood of returns per order
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <p className="text-sm text-muted-foreground">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
          <Button 
            onClick={fetchReturnPredictions} 
            disabled={loading}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Predicted Returns</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {summary.predicted_returns?.toLocaleString() || '—'}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Next 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Return Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {summary.avg_risk ? `${summary.avg_risk}%` : '—'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Risk Orders</CardTitle>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">
              {summary.high_risk_count?.toLocaleString() || '—'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Model Accuracy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {summary.accuracy ? `${summary.accuracy}%` : '—'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Predictions Table */}
      <Card>
        <CardHeader>
          <CardTitle>High-Risk Return Predictions</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="mt-4 text-muted-foreground">Running Decision Tree inference...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Return Probability</TableHead>
                  <TableHead>Risk Level</TableHead>
                  <TableHead>Reasons</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {predictions.length > 0 ? (
                  predictions.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-mono text-sm">{item.order_id}</TableCell>
                      <TableCell className="font-medium">{item.product}</TableCell>
                      <TableCell>{item.customer}</TableCell>
                      <TableCell className="font-semibold">
                        {(item.return_probability * 100).toFixed(1)}%
                      </TableCell>
                      <TableCell>
                        <Badge className={getRiskColor(item.risk_level)}>
                          {item.risk_level}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-xs">
                        {item.reasons}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                      No high-risk predictions at the moment
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Notes */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6 text-sm text-muted-foreground">
          <p><strong>Decision Tree Features:</strong> Product category, price, customer history, shipping method, review sentiment, and time since purchase.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReturnPrediction;