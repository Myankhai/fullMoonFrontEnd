import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatisticsPanelProps {
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

const StatisticsPanel = ({ data, city }: StatisticsPanelProps) => {
  // Calculate statistics
  const calculateStats = () => {
    const fullMoonDays = data.daily_data.filter(day => day.is_full_moon);
    const nonFullMoonDays = data.daily_data.filter(day => !day.is_full_moon);
    
    const fullMoonAvg = fullMoonDays.reduce((sum, day) => sum + day.count, 0) / fullMoonDays.length;
    const nonFullMoonAvg = nonFullMoonDays.reduce((sum, day) => sum + day.count, 0) / nonFullMoonDays.length;
    const normalizedFullMoonRate = fullMoonAvg / nonFullMoonAvg;
    const normalizedNonFullMoonRate = 1; // baseline
    const percentDifference = ((fullMoonAvg - nonFullMoonAvg) / nonFullMoonAvg) * 100;

    return {
      fullMoonDays: fullMoonDays.length,
      nonFullMoonDays: nonFullMoonDays.length,
      fullMoonAvgCrimes: fullMoonAvg,
      nonFullMoonAvgCrimes: nonFullMoonAvg,
      normalizedFullMoonRate,
      normalizedNonFullMoonRate,
      percentDifference
    };
  };

  const stats = calculateStats();
  const cityName = city === 'CHICAGO' ? 'Chicago' : 
                  city === 'NYC' ? 'New York City' : 
                  'Los Angeles';

  const getTrendIcon = (difference: number) => {
    if (difference > 5) return <TrendingUp className="h-4 w-4 text-red-400" />;
    if (difference < -5) return <TrendingDown className="h-4 w-4 text-green-400" />;
    return <Minus className="h-4 w-4 text-slate-400" />;
  };

  const getTrendColor = (difference: number) => {
    if (difference > 5) return "text-red-400";
    if (difference < -5) return "text-green-400";
    return "text-slate-400";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* City Indicator Banner */}
      <div className="lg:col-span-2 bg-gradient-to-r from-slate-800 to-slate-700 rounded-lg p-4 mb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold text-white">{cityName} Statistical Analysis</span>
            <Badge variant="default" className="bg-blue-500/20 text-blue-400 border border-blue-500/50">
              {city}
            </Badge>
          </div>
          <div className="text-sm text-slate-400">
            Analyzing {data.daily_data.length} days of data
          </div>
        </div>
      </div>

      {/* Correlation Analysis */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Correlation Analysis</CardTitle>
            <Badge variant="default" className="bg-slate-600 text-slate-200">
              {city === 'CHICAGO' ? 'CHI' : city === 'NYC' ? 'NYC' : 'LA'}
            </Badge>
          </div>
          <p className="text-slate-300 text-sm">
            Statistical relationship between moon phases and {cityName} homicide rates
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-300">Correlation Coefficient</span>
              <span className="text-white font-mono">{data.correlation.toFixed(4)}</span>
            </div>
            <Progress 
              value={Math.abs(data.correlation) * 100} 
              className="h-2"
            />
            <div className="text-xs text-slate-400">
              {Math.abs(data.correlation) < 0.1 ? 'Weak' : 
               Math.abs(data.correlation) < 0.3 ? 'Moderate' : 'Strong'} correlation
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-300">P-Value</span>
              <span className="text-white font-mono">{data.p_value.toFixed(4)}</span>
            </div>
            <Badge variant={data.p_value < 0.05 ? "destructive" : "secondary"}>
              {data.p_value < 0.05 ? "Statistically Significant" : "Not Significant"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Full Moon vs Non-Full Moon */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Full Moon Effect</CardTitle>
            <Badge variant="default" className="bg-slate-600 text-slate-200">
              {city === 'CHICAGO' ? 'CHI' : city === 'NYC' ? 'NYC' : 'LA'}
            </Badge>
          </div>
          <p className="text-slate-300 text-sm">
            Comparison of {cityName} homicide rates during full moon vs other phases
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-slate-700/50 rounded-lg">
              <div className="text-2xl mb-1">🌕</div>
              <div className="text-sm text-slate-300">Full Moon Days</div>
              <div className="text-lg font-bold text-white">{stats.fullMoonDays}</div>
              <div className="text-xs text-slate-400">
                {stats.fullMoonAvgCrimes.toFixed(2)} avg/day
              </div>
            </div>
            <div className="text-center p-3 bg-slate-700/50 rounded-lg">
              <div className="text-2xl mb-1">🌑</div>
              <div className="text-sm text-slate-300">Other Days</div>
              <div className="text-lg font-bold text-white">{stats.nonFullMoonDays}</div>
              <div className="text-xs text-slate-400">
                {stats.nonFullMoonAvgCrimes.toFixed(2)} avg/day
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Difference</span>
              <div className={`flex items-center gap-1 ${getTrendColor(stats.percentDifference)}`}>
                {getTrendIcon(stats.percentDifference)}
                <span className="font-mono">
                  {stats.percentDifference > 0 ? '+' : ''}{stats.percentDifference.toFixed(1)}%
                </span>
              </div>
            </div>
            <Badge variant={data.p_value < 0.05 ? "destructive" : "secondary"}>
              P-value: {data.p_value.toFixed(4)}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Normalized Analysis */}
      <Card className="bg-slate-800/50 border-slate-700 lg:col-span-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Normalized Rate Analysis</CardTitle>
            <Badge variant="default" className="bg-slate-600 text-slate-200">
              {city === 'CHICAGO' ? 'CHI' : city === 'NYC' ? 'NYC' : 'LA'}
            </Badge>
          </div>
          <p className="text-slate-300 text-sm">
            {cityName} homicide rates adjusted for the proportion of days in each category
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium text-slate-300">Full Moon Period</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Normalized Rate</span>
                  <span className="text-white font-mono">
                    {stats.normalizedFullMoonRate.toFixed(2)}
                  </span>
                </div>
                <Progress 
                  value={stats.normalizedFullMoonRate * 80} 
                  className="h-2"
                />
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium text-slate-300">Non-Full Moon Period</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Normalized Rate</span>
                  <span className="text-white font-mono">
                    {stats.normalizedNonFullMoonRate.toFixed(2)}
                  </span>
                </div>
                <Progress 
                  value={stats.normalizedNonFullMoonRate * 80} 
                  className="h-2"
                />
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium text-slate-300">Summary</h4>
              <div className="p-3 bg-slate-700/50 rounded-lg">
                <div className="text-center">
                  <div className={`text-2xl font-bold ${getTrendColor(stats.percentDifference)}`}>
                    {stats.percentDifference > 0 ? '+' : ''}{stats.percentDifference.toFixed(1)}%
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    {stats.percentDifference > 0 ? 'Higher' : 'Lower'} on full moon
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatisticsPanel; 