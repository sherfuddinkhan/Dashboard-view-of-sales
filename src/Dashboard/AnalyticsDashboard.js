import React from 'react';

import CustomerSegmentation from "../Analytics/CustomerSegmentation";
import ProductRecommendation from "../Analytics/ProductRecommendation";
import SalesForecast from "../Analytics/SalesForecast";
import ReturnPrediction from "../Analytics/ReturnPrediction";
import FraudDetection from "../Analytics/FraudDetection";
import InventoryAnalysis from "../Analytics/InventoryAnalysis";
import RecommendationSystem from "../Analytics/RecommendationSystem";
import RFMAnalysis from "../Analytics/RFMAnalysis";

const AnalyticsDashboard = () => {
  return (
    <div className="p-6 space-y-10">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">AI Analytics Dashboard</h1>
        <p className="text-gray-600 text-lg">Machine Learning Insights from Your Amazon Data</p>
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