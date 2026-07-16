import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Card, CardContent, CardHeader, CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Package, TrendingUp, AlertCircle, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

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
      
      toast.success('Inventory ABC analysis updated');
    } catch (err) {
      console.error('Error fetching inventory analysis:', err);
      setError(err.response?.data?.error || 'Failed to load inventory analysis');
      toast.error('Failed to load inventory analysis');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventoryAnalysis();
  }, []);

  const getCategoryBadge = (category) => {
    switch (category) {
      case 'A':
        return 'bg-emerald-100 text-emerald-700';
      case 'B':
        return 'bg-blue-100 text-blue-700';
      case 'C':
        return 'bg-amber-100 text-amber-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Inventory Analysis</h2>
          <p className="text-muted-foreground mt-1">
            ABC Analysis • Prioritize stock based on value and velocity
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <p className="text-sm text-muted-foreground">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
          <Button 
            onClick={fetchInventoryAnalysis} 
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
            <CardTitle className="text-sm font-medium">Total SKUs</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {summary.total_skus?.toLocaleString() || '—'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Category A Value</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">
              {summary.category_a_value ? `$${summary.category_a_value.toLocaleString()}` : '—'}
            </div>
            <p className="text-sm text-muted-foreground">
              {summary.category_a_percentage || 0}% of total value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Velocity Items</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {summary.high_velocity_count?.toLocaleString() || '—'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stockout Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">
              {summary.stockout_risk || '—'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ABC Analysis Table */}
      <Card>
        <CardHeader>
          <CardTitle>ABC Inventory Classification</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="mt-4 text-muted-foreground">Performing ABC Analysis...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Annual Value</TableHead>
                  <TableHead>% of Total Value</TableHead>
                  <TableHead>Units Sold</TableHead>
                  <TableHead>Stock Level</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventory.length > 0 ? (
                  inventory.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.product}</TableCell>
                      <TableCell>
                        <Badge className={getCategoryBadge(item.category)}>
                          {item.category}
                        </Badge>
                      </TableCell>
                      <TableCell>${item.annual_value.toLocaleString()}</TableCell>
                      <TableCell>{item.value_percentage}%</TableCell>
                      <TableCell>{item.units_sold.toLocaleString()}</TableCell>
                      <TableCell>
                        <span className={item.stock_level < 50 ? 'text-red-600' : ''}>
                          {item.stock_level}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {item.recommended_action}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                      No inventory data available
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
          <p><strong>ABC Logic:</strong> A = top 20% value (tight control), B = next 30%, C = remaining 50% (minimal control).</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default InventoryAnalysis;