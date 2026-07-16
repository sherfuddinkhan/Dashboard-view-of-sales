import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Card, CardContent, CardHeader, CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, ShieldAlert, AlertCircle, DollarSign, Users } from 'lucide-react';
import { toast } from 'sonner';

const API_BASE_URL = '/api';

const FraudDetection = () => {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchFraudData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${API_BASE_URL}/fraud-detection`);
      
      setTransactions(response.data.transactions || []);
      setSummary(response.data.summary || {});
      setLastUpdated(new Date());
      
      toast.success('Fraud detection analysis updated');
    } catch (err) {
      console.error('Error fetching fraud data:', err);
      setError(err.response?.data?.error || 'Failed to load fraud detection data');
      toast.error('Failed to load fraud detection data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFraudData();
  }, []);

  const getRiskBadge = (score) => {
    if (score > 0.8) return { label: 'High', class: 'bg-red-100 text-red-700' };
    if (score > 0.5) return { label: 'Medium', class: 'bg-amber-100 text-amber-700' };
    return { label: 'Low', class: 'bg-emerald-100 text-emerald-700' };
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Fraud Detection</h2>
          <p className="text-muted-foreground mt-1">
            Isolation Forest • Real-time suspicious transaction monitoring
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <p className="text-sm text-muted-foreground">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
          <Button 
            onClick={fetchFraudData} 
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
            <CardTitle className="text-sm font-medium">Flagged Transactions</CardTitle>
            <ShieldAlert className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {summary.flagged_count?.toLocaleString() || '—'}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {summary.fraud_rate ? `${summary.fraud_rate}% of total` : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount at Risk</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${summary.amount_at_risk?.toLocaleString() || '—'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Anomaly Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {summary.avg_anomaly_score?.toFixed(3) || '—'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reviewed Today</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {summary.reviewed_today?.toLocaleString() || '—'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fraud Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Suspicious Transactions (Isolation Forest)</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="mt-4 text-muted-foreground">Running Isolation Forest anomaly detection...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Anomaly Score</TableHead>
                  <TableHead>Risk Level</TableHead>
                  <TableHead>Flags</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.length > 0 ? (
                  transactions.map((tx, index) => {
                    const risk = getRiskBadge(tx.anomaly_score);
                    return (
                      <TableRow key={index}>
                        <TableCell className="font-mono text-sm">{tx.transaction_id}</TableCell>
                        <TableCell>{tx.customer}</TableCell>
                        <TableCell className="font-semibold">
                          ${tx.amount.toLocaleString()}
                        </TableCell>
                        <TableCell className="font-medium">
                          {tx.anomaly_score.toFixed(3)}
                        </TableCell>
                        <TableCell>
                          <Badge className={risk.class}>
                            {risk.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {tx.flags?.join(', ') || '—'}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                      No suspicious transactions detected
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
          <p><strong>Isolation Forest:</strong> Unsupervised anomaly detection. Flags unusual order amounts, velocity, location mismatches, and unusual product combinations.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default FraudDetection;