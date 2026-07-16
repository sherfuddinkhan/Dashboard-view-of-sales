import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Card, CardContent, CardHeader, CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, ShoppingCart, TrendingUp, AlertCircle, Target } from 'lucide-react';
import { toast } from 'sonner';

const API_BASE_URL = '/api';

const ProductRecommendation = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${API_BASE_URL}/product-recommendations`);
      
      setRecommendations(response.data.recommendations || []);
      setSummary(response.data.summary || {});
      setLastUpdated(new Date());
      
      toast.success('Product recommendations updated');
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError(err.response?.data?.error || 'Failed to load recommendations');
      toast.error('Failed to load product recommendations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Product Recommendations</h2>
          <p className="text-muted-foreground mt-1">
            Apriori Algorithm — Frequently bought together &amp; Association Rules
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <p className="text-sm text-muted-foreground">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
          <Button 
            onClick={fetchRecommendations} 
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
            <CardTitle className="text-sm font-medium">Total Rules</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {summary.total_rules?.toLocaleString() || '—'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Lift</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">
              {summary.top_lift?.toFixed(2) || '—'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Confidence</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {summary.avg_confidence ? `${summary.avg_confidence}%` : '—'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Support Threshold</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {summary.min_support ? `${(summary.min_support * 100).toFixed(1)}%` : '1%'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Top Association Rules (Frequently Bought Together)</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="mt-4 text-muted-foreground">Mining association rules with Apriori...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Antecedent (If Bought)</TableHead>
                  <TableHead>Consequent (Then Recommend)</TableHead>
                  <TableHead>Support</TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead>Lift</TableHead>
                  <TableHead>Strength</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recommendations.length > 0 ? (
                  recommendations.map((rule, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {rule.antecedent}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{rule.consequent}</Badge>
                      </TableCell>
                      <TableCell>{(rule.support * 100).toFixed(2)}%</TableCell>
                      <TableCell>{(rule.confidence * 100).toFixed(1)}%</TableCell>
                      <TableCell className="font-semibold text-emerald-600">
                        {rule.lift.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={
                            rule.lift > 2 ? 'bg-emerald-100 text-emerald-700' : 
                            rule.lift > 1.5 ? 'bg-amber-100 text-amber-700' : 
                            'bg-gray-100 text-gray-700'
                          }
                        >
                          {rule.lift > 2 ? 'Strong' : rule.lift > 1.5 ? 'Good' : 'Moderate'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                      No association rules found. Try lowering support threshold in backend.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Usage Note */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6 text-sm text-muted-foreground">
          <p><strong>Tip:</strong> Use these rules for bundling, "Customers who bought X also bought Y", and cross-selling campaigns.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductRecommendation;