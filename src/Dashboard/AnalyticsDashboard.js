import React from 'react';
import CustomerSegmentation from './CustomerSegmentation';
import ProductRecommendation from './ProductRecommendation';
import SalesForecast from './SalesForecast';
import ReturnPrediction from './ReturnPrediction';
import FraudDetection from './FraudDetection';
import InventoryAnalysis from './InventoryAnalysis';
import RecommendationSystem from './RecommendationSystem';
import RFMAnalysis from './RFMAnalysis';

const AnalyticsDashboard = () => {
  return (
    <div className="space-y-10 p-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-2">AI Analytics Dashboard</h1>
        <p className="text-muted-foreground">Machine Learning Insights from Your Amazon Data</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <CustomerSegmentation />
        <ProductRecommendation />
        <SalesForecast />
        <ReturnPrediction />
        <FraudDetection />
        <InventoryAnalysis />
        <RecommendationSystem />
        <RFMAnalysis />
      </div>
    </div>
  );
};

export default AnalyticsDashboard;