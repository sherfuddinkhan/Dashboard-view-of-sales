import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Card, CardContent, CardHeader, CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, TrendingUp, Calendar, AlertCircle, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';

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
      
      toast.success('Sales forecast updated successfully');
    } catch (err) {
      console.error('Error fetching forecast:', err);
      setError(err.response?.data?.error || 'Failed to load sales forecast');
      toast.error('Failed to load sales forecast');
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
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Sales Forecast</h2>
          <p className="text-muted-foreground mt-1">
            XGBoost + Linear Regression • Next 30 &amp; 90 days prediction
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <p className="text-sm text-muted-foreground">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
          <Button 
            onClick={fetchForecast} 
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
            <CardTitle className="text-sm font-medium">Next 30 Days</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${summary.next_30_days?.toLocaleString() || '—'}
            </div>
            <p className={`text-sm mt-1 flex items-center gap-1 ${getTrendColor(summary.trend_30)}`}>
              <TrendingUp className="h-4 w-4" />
              {summary.trend_30 || '—'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next 90 Days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${summary.next_90_days?.toLocaleString() || '—'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">
              {summary.growth_rate ? `${summary.growth_rate}%` : '—'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Model Accuracy</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {summary.accuracy ? `${summary.accuracy}%` : '—'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Forecast Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Sales Forecast (Next 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="mt-4 text-muted-foreground">Training XGBoost model &amp; generating forecast...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Predicted Sales</TableHead>
                  <TableHead>Lower Bound</TableHead>
                  <TableHead>Upper Bound</TableHead>
                  <TableHead>Trend</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {forecast.length > 0 ? (
                  forecast.map((day, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{day.date}</TableCell>
                      <TableCell className="font-semibold">
                        ${day.predicted.toLocaleString()}
                      </TableCell>
                      <TableCell>${day.lower_bound?.toLocaleString()}</TableCell>
                      <TableCell>${day.upper_bound?.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge 
                          className={
                            day.trend === 'Up' ? 'bg-emerald-100 text-emerald-700' : 
                            'bg-red-100 text-red-700'
                          }
                        >
                          {day.trend}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                      No forecast data available
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
          <p><strong>Model:</strong> XGBoost (primary) with Linear Regression fallback. Trained on historical sales, seasonality, promotions, and external factors.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesForecast;