import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Card, CardContent, CardHeader, CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Users, Trophy, Target, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

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
      
      toast.success('RFM Analysis updated successfully');
    } catch (err) {
      console.error('Error fetching RFM data:', err);
      setError(err.response?.data?.error || 'Failed to load RFM analysis');
      toast.error('Failed to load RFM analysis');
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
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">RFM Analysis</h2>
          <p className="text-muted-foreground mt-1">
            Recency • Frequency • Monetary Value • Customer Lifetime Segmentation
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <p className="text-sm text-muted-foreground">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
          <Button 
            onClick={fetchRFM} 
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
            <CardTitle className="text-sm font-medium">Top RFM Score</CardTitle>
            <Trophy className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">
              {summary.highest_rfm || '—'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Monetary Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${summary.avg_monetary?.toLocaleString() || '—'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Churn Risk</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {summary.churn_risk_percentage ? `${summary.churn_risk_percentage}%` : '—'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* RFM Table */}
      <Card>
        <CardHeader>
          <CardTitle>Customer RFM Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="mt-4 text-muted-foreground">Calculating RFM scores...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer ID</TableHead>
                  <TableHead>Recency (days)</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Monetary ($)</TableHead>
                  <TableHead>RFM Score</TableHead>
                  <TableHead>Segment</TableHead>
                  <TableHead>Action Priority</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rfmData.length > 0 ? (
                  rfmData.map((customer, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-mono text-sm">{customer.customer_id}</TableCell>
                      <TableCell>{customer.recency}</TableCell>
                      <TableCell className="font-medium">{customer.frequency}</TableCell>
                      <TableCell>${customer.monetary.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge className={getRFMScoreColor(customer.rfm_score)}>
                          {customer.rfm_score}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{customer.segment}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {customer.action_priority}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                      No RFM data available
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
          <p><strong>RFM Scoring:</strong> Recency (1-5), Frequency (1-5), Monetary (1-5). Higher score = more valuable customer.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default RFMAnalysis;