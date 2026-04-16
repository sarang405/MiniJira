import { TrendingUp, TrendingDown } from 'lucide-react';

const StatCard = ({ title, value, trend, trendValue, subtitle }) => (
  <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm">
    <div className="flex justify-between items-start mb-4">
      <span className="text-gray-500 font-medium">{title}</span>
      <div className={`flex items-center text-xs font-bold ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
        {trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
        <span className="ml-1">{trendValue}</span>
      </div>
    </div>
    <h3 className="text-3xl font-bold mb-1">{value}</h3>
    <p className="text-xs text-gray-400">{subtitle}</p>
  </div>
);

export default StatCard;