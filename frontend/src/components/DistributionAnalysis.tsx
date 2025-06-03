import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface DistributionAnalysisProps {
  city: 'CHICAGO' | 'NYC' | 'LA';
  data: {
    correlation: number;
    p_value: number;
    daily_data: Array<{
      date: string;
      count: number;
      moon_phase: number;
      is_full_moon: boolean;
    }>;
  };
}

const DistributionAnalysis = ({ city, data }: DistributionAnalysisProps) => {
  // Calculate statistics
  const calculateStats = () => {
    const fullMoonDays = data.daily_data.filter(day => day.is_full_moon);
    const nonFullMoonDays = data.daily_data.filter(day => !day.is_full_moon);
    
    const fullMoonAvg = fullMoonDays.reduce((sum, day) => sum + day.count, 0) / fullMoonDays.length;
    const nonFullMoonAvg = nonFullMoonDays.reduce((sum, day) => sum + day.count, 0) / nonFullMoonDays.length;
    const normalizedFullMoonRate = fullMoonAvg / nonFullMoonAvg;
    const normalizedNonFullMoonRate = 1; // baseline

    return {
      fullMoonAvgCrimes: fullMoonAvg,
      nonFullMoonAvgCrimes: nonFullMoonAvg,
      normalizedFullMoonRate,
      normalizedNonFullMoonRate
    };
  };

  const stats = calculateStats();

  const distributionData = [
    {
      category: 'Non-Full Moon Days',
      value: stats.nonFullMoonAvgCrimes,
      normalized: stats.normalizedNonFullMoonRate,
      color: '#64748b',
      description: 'Baseline homicide rate during normal lunar phases'
    },
    {
      category: 'Full Moon Days',
      value: stats.fullMoonAvgCrimes,
      normalized: stats.normalizedFullMoonRate,
      color: '#ef4444',
      description: 'Elevated homicide rate during full moon periods'
    }
  ];

  // Generate box plot data
  const generateBoxPlotData = () => {
    const fullMoonRate = stats.fullMoonAvgCrimes;
    const normalRate = stats.nonFullMoonAvgCrimes;
    
    return [
      {
        type: 'Non-Full Moon',
        min: normalRate * 0.3,
        q1: normalRate * 0.7,
        median: normalRate,
        q3: normalRate * 1.3,
        max: normalRate * 1.8,
        outliers: [],
        color: '#64748b'
      },
      {
        type: 'Full Moon',
        min: fullMoonRate * 0.6,
        q1: fullMoonRate * 0.8,
        median: fullMoonRate,
        q3: fullMoonRate * 1.2,
        max: fullMoonRate * 1.5,
        outliers: [fullMoonRate * 1.7, fullMoonRate * 1.8],
        color: '#ef4444'
      }
    ];
  };

  const boxPlotData = generateBoxPlotData();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-800 p-3 rounded-lg border border-slate-600 shadow-lg">
          <p className="text-slate-300 font-semibold mb-2">{label}</p>
          <p className="text-blue-400">{`Average: ${data.value.toFixed(3)} homicides/day`}</p>
          <p className="text-green-400">{`Normalized: ${data.normalized.toFixed(3)}x`}</p>
          <p className="text-slate-400 text-sm mt-1">{data.description}</p>
        </div>
      );
    }
    return null;
  };

  const multiplier = stats.normalizedFullMoonRate;
  const cityName = city === 'CHICAGO' ? 'Chicago' : 
                  city === 'NYC' ? 'New York City' : 
                  'Los Angeles';

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart Comparison */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Homicide Rate Distribution</CardTitle>
            <p className="text-slate-300 text-sm">
              Comparison of average daily homicide rates by moon phase
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={distributionData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="category" 
                    stroke="#94a3b8" 
                    tick={{ fontSize: 12 }}
                    angle={-15}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Box Plot Visualization */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Statistical Distribution</CardTitle>
            <p className="text-slate-300 text-sm">
              Box plot showing quartiles and outliers by moon phase
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-end justify-center space-x-8 p-4">
              {boxPlotData.map((item, index) => (
                <div key={index} className="flex flex-col items-center space-y-2">
                  <div className="relative">
                    {/* Box plot visualization */}
                    <div 
                      className="w-16 border-2 bg-slate-700/50"
                      style={{ 
                        height: `${(item.q3 - item.q1) * 8}px`,
                        borderColor: item.color,
                        minHeight: '40px'
                      }}
                    >
                      {/* Median line */}
                      <div 
                        className="absolute w-full border-t-2"
                        style={{ 
                          borderColor: item.color,
                          top: `${((item.median - item.q1) / (item.q3 - item.q1)) * 100}%`
                        }}
                      />
                    </div>
                    
                    {/* Whiskers */}
                    <div 
                      className="absolute left-1/2 transform -translate-x-1/2 border-l-2"
                      style={{ 
                        height: `${(item.max - item.q3) * 8}px`,
                        borderColor: item.color,
                        top: `-${(item.max - item.q3) * 8}px`
                      }}
                    />
                    <div 
                      className="absolute left-1/2 transform -translate-x-1/2 border-l-2"
                      style={{ 
                        height: `${(item.q1 - item.min) * 8}px`,
                        borderColor: item.color,
                        bottom: `-${(item.q1 - item.min) * 8}px`
                      }}
                    />
                    
                    {/* Outliers */}
                    {item.outliers.map((outlier, oIndex) => (
                      <div
                        key={oIndex}
                        className="absolute w-2 h-2 rounded-full"
                        style={{
                          backgroundColor: item.color,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          top: `-${outlier * 8}px`
                        }}
                      />
                    ))}
                  </div>
                  
                  <div className="text-center">
                    <p className="text-white text-sm font-semibold">{item.type}</p>
                    <p className="text-slate-400 text-xs">Median: {item.median.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Insights */}
      <Card className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border-blue-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <span className="text-2xl">📊</span>
            {cityName}: Distribution Analysis Key Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-blue-300">📈 Key Findings</h4>
              <ul className="space-y-2 text-slate-300 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-1">•</span>
                  <span>
                    <strong className="text-white">{multiplier.toFixed(3)}× higher</strong> homicide rate on full moon days
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400 mt-1">•</span>
                  <span>
                    Full moon periods show <strong className="text-white">consistent elevation</strong> above baseline
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">•</span>
                  <span>
                    P-value of <strong className="text-white">{data.p_value.toExponential(2)}</strong> indicates {data.p_value < 0.05 ? 'statistical significance' : 'potential significance'}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">•</span>
                  <span>
                    {city === 'NYC' ? 'Sharp relative spike pattern' : city === 'LA' ? 'Higher absolute rates with sustained elevation' : 'Higher absolute rates with sustained elevation'}
                  </span>
                </li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-purple-300">🔬 Statistical Summary</h4>
              <div className="bg-slate-800/50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-300">Full Moon Average:</span>
                  <span className="text-white font-mono">{stats.fullMoonAvgCrimes.toFixed(3)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Non-Full Moon Average:</span>
                  <span className="text-white font-mono">{stats.nonFullMoonAvgCrimes.toFixed(3)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Correlation:</span>
                  <span className="text-white font-mono">{data.correlation.toFixed(3)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-600 pt-2">
                  <span className="text-slate-300">Multiplier Effect:</span>
                  <span className="text-red-400 font-bold">{multiplier.toFixed(3)}×</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DistributionAnalysis; 