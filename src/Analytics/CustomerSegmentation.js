import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Card, CardContent, CardHeader, CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Users, TrendingUp, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const API_BASE_URL = '/api'; // Adjust based on your Flask proxy/setup

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
      
      toast.success('Customer segments updated successfully');
    } catch (err) {
      console.error('Error fetching segmentation:', err);
      setError(err.response?.data?.error || 'Failed to load customer segmentation data');
      toast.error('Failed to load segmentation data');
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
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Customer Segmentation</h2>
          <p className="text-muted-foreground mt-1">
            K-Means clustering based on RFM metrics and purchase behavior
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <p className="text-sm text-muted-foreground">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
          <Button 
            onClick={fetchSegmentation} 
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
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {summary.total_customers?.toLocaleString() || '—'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">
              {summary.high_value_percentage ? `${summary.high_value_percentage}%` : '—'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {summary.high_value_count || 0} customers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${summary.avg_order_value?.toFixed(2) || '—'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clusters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {summary.num_clusters || 5}
            </div>
            <p className="text-xs text-muted-foreground">K-Means</p>
          </CardContent>
        </Card>
      </div>

      {/* Segments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Segments</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="mt-4 text-muted-foreground">Running K-Means clustering...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Segment</TableHead>
                  <TableHead>Customers</TableHead>
                  <TableHead>% of Total</TableHead>
                  <TableHead>Avg RFM Score</TableHead>
                  <TableHead>Avg Order Value</TableHead>
                  <TableHead>Characteristics</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {segments.length > 0 ? (
                  segments.map((segment, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Badge className={getSegmentColor(segment.segment)}>
                          {segment.segment}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {segment.count.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {segment.percentage}%
                      </TableCell>
                      <TableCell>{segment.avg_rfm_score?.toFixed(1)}</TableCell>
                      <TableCell>${segment.avg_order_value?.toFixed(2)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-md">
                        {segment.characteristics}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No segmentation data available
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
          <p><strong>How it works:</strong> Customers are clustered using K-Means on Recency, Frequency, Monetary (RFM) features + purchase patterns. Data is processed on the Flask backend.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerSegmentation;