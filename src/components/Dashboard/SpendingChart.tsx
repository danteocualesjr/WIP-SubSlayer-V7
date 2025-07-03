import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Chart,
  AreaChart,
  LinearXAxis,
  LinearXAxisTickSeries,
  LinearXAxisTickLabel,
  LinearYAxis,
  LinearYAxisTickSeries,
  AreaSeries,
  Area,
  Gradient,
  GradientStop,
  GridlineSeries,
  Gridline,
  ChartDataTypes,
  ChartTooltip,
} from 'reaviz';
import { TrendingUp, TrendingDown, BarChart3, Activity, Zap } from 'lucide-react';
import { SpendingData } from '../../types/subscription';

interface SpendingChartProps {
  data: SpendingData[];
  loading?: boolean;
}

const SpendingChart: React.FC<SpendingChartProps> = ({ data, loading = false }) => {
  const [chartType, setChartType] = useState<'area' | 'bar'>('area');

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Monthly Spending Trend</h3>
          <p className="text-sm text-gray-600">Track your subscription costs over time</p>
        </div>
        <div className="h-80 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-purple-600/30 border-t-purple-600 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Monthly Spending Trend</h3>
          <p className="text-sm text-gray-600">Track your subscription costs over time</p>
        </div>
        <div className="h-80 flex items-center justify-center">
          <div className="text-center">
            <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No spending data available</p>
            <p className="text-sm text-gray-400">Add some subscriptions to see your spending trends</p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate trend metrics
  const currentMonth = data[data.length - 1]?.amount || 0;
  const previousMonth = data[data.length - 2]?.amount || 0;
  const changeAmount = currentMonth - previousMonth;
  const changePercentage = previousMonth > 0 ? ((changeAmount / previousMonth) * 100) : 0;
  const isPositive = changeAmount >= 0;

  // Calculate total and average
  const totalSpent = data.reduce((sum, item) => sum + item.amount, 0);
  const averageSpending = totalSpent / data.length;
  const highestMonth = Math.max(...data.map(item => item.amount));

  // Transform data for reaviz
  const chartData: ChartDataTypes[] = [{
    key: 'spending',
    data: data.map(item => ({
      key: item.month,
      data: item.amount
    }))
  }];

  return (
    <>
      <style jsx global>{`
        :root {
          --reaviz-tick-fill: #6B7280;
          --reaviz-gridline-stroke: rgba(156, 163, 175, 0.3);
        }
        .dark {
          --reaviz-tick-fill: #9CA3AF;
          --reaviz-gridline-stroke: rgba(75, 85, 99, 0.4);
        }
      `}</style>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white rounded-3xl p-8 shadow-lg border border-purple-100/50 hover:shadow-xl transition-all duration-300"
      >
        {/* Header with Chart Type Toggle */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-violet-600 rounded-2xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Monthly Spending Trend</h3>
            </div>
            <p className="text-gray-600">Track your subscription costs over time</p>
          </div>
          
          {/* Chart Type Selector */}
          <div className="flex bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setChartType('area')}
              className={`p-2 rounded-lg transition-all duration-200 ${
                chartType === 'area'
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Area Chart"
            >
              <Zap className="w-4 h-4" />
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`p-2 rounded-lg transition-all duration-200 ${
                chartType === 'bar'
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Bar Chart"
            >
              <BarChart3 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-2xl p-4 border border-purple-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Current Month</p>
                <p className="text-2xl font-bold text-purple-600">${currentMonth.toFixed(2)}</p>
              </div>
              <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${
                isPositive ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
              }`}>
                {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span>{Math.abs(changePercentage).toFixed(1)}%</span>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl p-4 border border-emerald-100"
          >
            <p className="text-sm text-gray-600 mb-1">Average</p>
            <p className="text-2xl font-bold text-emerald-600">${averageSpending.toFixed(2)}</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-4 border border-orange-100"
          >
            <p className="text-sm text-gray-600 mb-1">Highest Month</p>
            <p className="text-2xl font-bold text-orange-600">${highestMonth.toFixed(2)}</p>
          </motion.div>
        </div>

        {/* Chart Container */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="h-80 reaviz-chart-container"
        >
          <Chart
            height={320}
            data={chartData}
          >
            <AreaChart
              xAxis={
                <LinearXAxis
                  type="category"
                  tickSeries={
                    <LinearXAxisTickSeries
                      label={
                        <LinearXAxisTickLabel
                          fill="var(--reaviz-tick-fill)"
                          fontSize={12}
                          fontWeight={500}
                        />
                      }
                      tickSize={0}
                    />
                  }
                  axisLine={null}
                />
              }
              yAxis={
                <LinearYAxis
                  axisLine={null}
                  tickSeries={
                    <LinearYAxisTickSeries 
                      line={null} 
                      label={
                        <LinearXAxisTickLabel
                          format={(value) => `$${value}`}
                          fill="var(--reaviz-tick-fill)"
                          fontSize={12}
                          fontWeight={500}
                        />
                      }
                      tickSize={0}
                    />
                  }
                />
              }
              series={
                <AreaSeries
                  type="standard"
                  interpolation="smooth"
                  area={
                    <Area
                      gradient={
                        <Gradient
                          stops={[
                            <GradientStop key="start" offset="0%" stopColor="#8B5CF6" stopOpacity={0.8} />,
                            <GradientStop key="middle" offset="50%" stopColor="#3B82F6" stopOpacity={0.4} />,
                            <GradientStop key="end" offset="100%" stopColor="#3B82F6" stopOpacity={0.1} />,
                          ]}
                        />
                      }
                    />
                  }
                  line={{
                    stroke: '#8B5CF6',
                    strokeWidth: 3,
                  }}
                  symbols={{
                    fill: '#8B5CF6',
                    size: 6,
                    strokeWidth: 2,
                    stroke: '#ffffff',
                  }}
                />
              }
              gridlines={
                <GridlineSeries 
                  line={
                    <Gridline 
                      strokeColor="var(--reaviz-gridline-stroke)" 
                      strokeDasharray="2,4"
                    />
                  } 
                />
              }
            />
            <ChartTooltip />
          </Chart>
        </motion.div>

        {/* Insights */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-6 p-4 bg-gradient-to-r from-purple-50/50 to-violet-50/50 rounded-2xl border border-purple-100/50"
        >
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <Activity className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Spending Insight</h4>
              <p className="text-sm text-gray-600">
                {isPositive 
                  ? `Your spending increased by $${changeAmount.toFixed(2)} (${changePercentage.toFixed(1)}%) this month. Consider reviewing your active subscriptions.`
                  : changeAmount === 0
                    ? "Your spending remained stable this month. Great job maintaining consistent costs!"
                    : `Great news! You saved $${Math.abs(changeAmount).toFixed(2)} (${Math.abs(changePercentage).toFixed(1)}%) this month compared to last month.`
                }
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
};

export default SpendingChart;