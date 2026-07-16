import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Card, CardContent, CardHeader, CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Star, ShoppingCart, Users, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const API_BASE_URL = '/api';

const RecommendationSystem = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${API_BASE_URL}/recommendation-system`);
      
      setRecommendations(response.data.recommendations || []);
      setSummary(response.data.summary || {});
      setLastUpdated(new Date());
      
      toast.success('Personalized recommendations updated');
    } catch (err) {
      console.error('Error fetching recommendation system data:', err);
      setError(err.response?.data?.error || 'Failed to load recommendations');
      toast.error('Failed to load recommendation system data');
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
          <h2 className="text-3xl font-bold tracking-tight">Recommendation System</h2>
          <p className="text-muted-foreground mt-1">
            Hybrid Model (Collaborative + Content-Based + Sales Trends)
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
            <CardTitle className="text-sm font-medium">Total Recommendations</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {summary.total_recommendations?.toLocaleString() || '—'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">
              {summary.top_category || '—'}
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
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {summary.active_users?.toLocaleString() || '—'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Personalized Product Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="mt-4 text-muted-foreground">Generating hybrid recommendations...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Est. Conversion</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recommendations.length > 0 ? (
                  recommendations.map((rec, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{rec.product}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{rec.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          {rec.score.toFixed(2)}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-md">
                        {rec.reason}
                      </TableCell>
                      <TableCell>
                        {(rec.estimated_conversion * 100).toFixed(1)}%
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">
                          <ShoppingCart className="h-4 w-4 mr-1" />
                          Promote
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                      No recommendations available
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
          <p><strong>Hybrid System:</strong> Combines Collaborative Filtering, Content-Based, and Trending products. Ideal for homepage, cart, and email campaigns.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default RecommendationSystem;