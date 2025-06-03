import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface ComparisonChartProps {
  data: {
    CHICAGO: {
      correlation: number;
      p_value: number;
      daily_data: Array<{
        date: string;
        count: number;
        moon_phase: number;
        is_full_moon: boolean;
      }>;
    };
    NYC: {
      correlation: number;
      p_value: number;
      daily_data: Array<{
        date: string;
        count: number;
        moon_phase: number;
        is_full_moon: boolean;
      }>;
    };
  };
}

const ComparisonChart = ({ data }: ComparisonChartProps) => {
  // Calculate statistics for both cities
  const calculateCityStats = (cityData: ComparisonChartProps['data']['CHICAGO']) => {
    const fullMoonDays = cityData.daily_data.filter(day => day.is_full_moon);
    const nonFullMoonDays = cityData.daily_data.filter(day => !day.is_full_moon);
    
    const fullMoonAvg = fullMoonDays.reduce((sum, day) => sum + day.count, 0) / fullMoonDays.length;
    const nonFullMoonAvg = nonFullMoonDays.reduce((sum, day) => sum + day.count, 0) / nonFullMoonDays.length;
    const normalizedFullMoonRate = fullMoonAvg / nonFullMoonAvg;

    return {
      fullMoonAvgCrimes: fullMoonAvg,
      nonFullMoonAvgCrimes: nonFullMoonAvg,
      normalizedFullMoonRate
    };
  };

  const chicagoStats = calculateCityStats(data.CHICAGO);
  const nycStats = calculateCityStats(data.NYC);

  const comparisonData = [
    {
      metric: 'Full Moon Avg',
      Chicago: chicagoStats.fullMoonAvgCrimes,
      NYC: nycStats.fullMoonAvgCrimes,
      unit: 'homicides/day'
    },
    {
      metric: 'Non-Full Moon Avg',
      Chicago: chicagoStats.nonFullMoonAvgCrimes,
      NYC: nycStats.nonFullMoonAvgCrimes,
      unit: 'homicides/day'
    },
    {
      metric: 'Multiplier Effect',
      Chicago: chicagoStats.normalizedFullMoonRate,
      NYC: nycStats.normalizedFullMoonRate,
      unit: 'times higher'
    }
  ];

  const formatValue = (value: number, metric: string) => {
    if (metric === 'Multiplier Effect') {
      return value.toFixed(3);
    }
    return value.toFixed(2);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-800 p-3 rounded-lg border border-slate-600 shadow-lg">
          <p className="text-slate-300 mb-2 font-semibold">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.dataKey}: ${formatValue(entry.value, label)} ${data.unit}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="metric" 
              stroke="#94a3b8" 
              tick={{ fontSize: 12 }}
              angle={-15}
              textAnchor="end"
              height={60}
            />
            <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="Chicago" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="NYC" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Comparative Summary */}
      <Card className="bg-gradient-to-r from-blue-900/30 via-purple-900/30 to-violet-900/30 border-indigo-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <span className="text-indigo-400">⚖️</span>
            Comparative Analysis: NYC vs Chicago
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-800/50 p-6 rounded-lg border border-purple-700/50">
              <h3 className="text-lg font-semibold text-purple-300 mb-4 flex items-center gap-2">
                <span>🗽</span>
                New York City
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-300">Full Moon Rate:</span>
                  <span className="text-white font-mono">{nycStats.fullMoonAvgCrimes.toFixed(3)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Normal Rate:</span>
                  <span className="text-white font-mono">{nycStats.nonFullMoonAvgCrimes.toFixed(3)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-600 pt-2">
                  <span className="text-slate-300">Multiplier:</span>
                  <span className="text-red-400 font-bold text-lg">{nycStats.normalizedFullMoonRate.toFixed(3)}×</span>
                </div>
                <p className="text-sm text-slate-400 mt-3">
                  {nycStats.normalizedFullMoonRate > chicagoStats.normalizedFullMoonRate 
                    ? "Shows stronger lunar correlation with more pronounced spikes during full moons"
                    : "Demonstrates more moderate but consistent lunar influence"}
                </p>
              </div>
            </div>

            <div className="bg-slate-800/50 p-6 rounded-lg border border-blue-700/50">
              <h3 className="text-lg font-semibold text-blue-300 mb-4 flex items-center gap-2">
                <span>🏙️</span>
                Chicago
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-300">Full Moon Rate:</span>
                  <span className="text-white font-mono">{chicagoStats.fullMoonAvgCrimes.toFixed(3)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Normal Rate:</span>
                  <span className="text-white font-mono">{chicagoStats.nonFullMoonAvgCrimes.toFixed(3)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-600 pt-2">
                  <span className="text-slate-300">Multiplier:</span>
                  <span className="text-orange-400 font-bold text-lg">{chicagoStats.normalizedFullMoonRate.toFixed(3)}×</span>
                </div>
                <p className="text-sm text-slate-400 mt-3">
                  {chicagoStats.normalizedFullMoonRate > nycStats.normalizedFullMoonRate 
                    ? "Shows stronger lunar correlation with more pronounced spikes during full moons"
                    : "Demonstrates more moderate but consistent lunar influence"}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-indigo-900/30 rounded-lg border border-indigo-600/50">
            <h4 className="font-semibold text-indigo-300 mb-2">🧠 Key Interpretations</h4>
            <div className="text-sm text-slate-300 space-y-2">
              <p>
                <strong className="text-purple-300">NYC Pattern:</strong> Shows a {nycStats.normalizedFullMoonRate.toFixed(3)}× multiplier effect during full moons, with correlation coefficient of {data.NYC.correlation.toFixed(3)}.
              </p>
              <p>
                <strong className="text-blue-300">Chicago Pattern:</strong> Exhibits a {chicagoStats.normalizedFullMoonRate.toFixed(3)}× multiplier effect, with correlation coefficient of {data.CHICAGO.correlation.toFixed(3)}.
              </p>
              <p className="mt-3 p-2 bg-slate-800/50 rounded">
                <strong className="text-indigo-300">Statistical Significance:</strong> Both cities show p-values of {data.CHICAGO.p_value.toExponential(2)} (Chicago) and {data.NYC.p_value.toExponential(2)} (NYC), indicating {Math.min(data.CHICAGO.p_value, data.NYC.p_value) < 0.05 ? "statistically significant" : "potentially significant"} lunar influence on homicide rates.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComparisonChart; 