import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { PieChart as PieChartIcon } from 'lucide-react';
import { CategoryData } from '../../types/subscription';

interface CategoryChartProps {
  data: CategoryData[];
}

const CategoryChart: React.FC<CategoryChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-8 shadow-lg border border-purple-100/50 hover:shadow-xl transition-all duration-300 group">
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Spending by Category</h3>
              <p className="text-gray-600">Distribution of your subscription costs</p>
            </div>
          </div>
        </div>
        <div className="h-80 flex items-center justify-center">
          <div className="text-center">
            <PieChartIcon className="w-20 h-20 text-gray-300 mx-auto mb-6" />
            <h4 className="text-lg font-semibold text-gray-900 mb-2">No category data available</h4>
            <p className="text-gray-500">Add subscriptions with categories to see the breakdown</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-8 shadow-lg border border-purple-100/50 hover:shadow-xl transition-all duration-300 group">
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Spending by Category</h3>
            <p className="text-gray-600">Distribution of your subscription costs</p>
          </div>
        </div>
      </div>
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50/30 to-violet-50/30 rounded-2xl"></div>
        <div className="relative h-80 p-4">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              {/* Dark center circle overlay */}
              <circle cx="50%" cy="50%" r="38%" fill="#1e1b4b" />
              
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={{ stroke: '#ffffff', strokeWidth: 1, opacity: 0.5 }}
                label={({ name, x, y }) => {
                  return (
                    <g>
                      <foreignObject
                        x={x - 60}
                        y={y - 15}
                        width={120}
                        height={30}
                        style={{ overflow: 'visible' }}
                      >
                        <div
                          style={{
                            backgroundColor: 'white',
                            borderRadius: '999px',
                            padding: '4px 12px',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            textAlign: 'center',
                            whiteSpace: 'nowrap',
                            color: '#1e1b4b',
                            border: '1px solid rgba(0,0,0,0.05)'
                          }}
                        >
                          {name}
                        </div>
                      </foreignObject>
                    </g>
                  );
                }}
                outerRadius={140}
                innerRadius={80}
                fill="#8884d8"
                dataKey="value"
                paddingAngle={2}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(139, 92, 246, 0.2)',
                  borderRadius: '999px',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                  padding: '12px 16px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default CategoryChart;