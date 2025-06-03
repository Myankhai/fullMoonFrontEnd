import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";

interface CityData {
  correlation: number;
  p_value: number;
  daily_data: Array<{
    date: string;
    count: number;
    moon_phase: number;
    is_full_moon: boolean;
  }>;
}

interface GeographicalInsightsProps {
  data: {
    CHICAGO: CityData;
    NYC: CityData;
    LA: CityData;
  };
}

const GeographicalInsights = ({ data }: GeographicalInsightsProps) => {
  const calculateCityStats = (cityData: CityData) => {
    const fullMoonDays = cityData.daily_data.filter(day => day.is_full_moon);
    const nonFullMoonDays = cityData.daily_data.filter(day => !day.is_full_moon);
    
    const fullMoonAvg = fullMoonDays.reduce((sum, day) => sum + day.count, 0) / fullMoonDays.length;
    const nonFullMoonAvg = nonFullMoonDays.reduce((sum, day) => sum + day.count, 0) / nonFullMoonDays.length;
    const totalIncidents = cityData.daily_data.reduce((sum, day) => sum + day.count, 0);
    
    return {
      fullMoonAvg,
      nonFullMoonAvg,
      totalIncidents,
      effectSize: ((fullMoonAvg - nonFullMoonAvg) / nonFullMoonAvg) * 100,
      significance: cityData.p_value < 0.05
    };
  };

  const chicagoStats = calculateCityStats(data.CHICAGO);
  const nycStats = calculateCityStats(data.NYC);
  const laStats = calculateCityStats(data.LA);

  const maxTotal = Math.max(chicagoStats.totalIncidents, nycStats.totalIncidents, laStats.totalIncidents);
  const maxEffect = Math.max(
    Math.abs(chicagoStats.effectSize), 
    Math.abs(nycStats.effectSize),
    Math.abs(laStats.effectSize)
  );

  const renderCityCard = (cityName: string, stats: ReturnType<typeof calculateCityStats>) => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">{cityName}</h3>
        <Badge variant={stats.significance ? "destructive" : "secondary"}>
          {stats.significance ? "Significant" : "Not Significant"}
        </Badge>
      </div>
      
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-300">Total Incidents</span>
            <span className="text-white font-mono">{stats.totalIncidents}</span>
          </div>
          <Progress 
            value={(stats.totalIncidents / maxTotal) * 100} 
            className="h-2"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-slate-700/50 rounded-lg">
            <div className="text-sm text-slate-300 mb-1">Full Moon Avg</div>
            <div className="text-lg font-bold text-white">
              {stats.fullMoonAvg.toFixed(2)}
            </div>
          </div>
          <div className="p-3 bg-slate-700/50 rounded-lg">
            <div className="text-sm text-slate-300 mb-1">Other Days Avg</div>
            <div className="text-lg font-bold text-white">
              {stats.nonFullMoonAvg.toFixed(2)}
            </div>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-300">Effect Size</span>
            <span className={`font-mono ${stats.effectSize > 0 ? 'text-red-400' : 'text-green-400'}`}>
              {stats.effectSize > 0 ? '+' : ''}{stats.effectSize.toFixed(1)}%
            </span>
          </div>
          <Progress 
            value={(Math.abs(stats.effectSize) / maxEffect) * 100}
            className={`h-2 ${stats.effectSize > 0 ? 'bg-red-900/20' : 'bg-green-900/20'}`}
          />
        </div>
      </div>
    </div>
  );

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Geographical Comparison</CardTitle>
        <p className="text-slate-300 text-sm">
          Analyzing lunar effects across different urban environments
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* City Cards */}
          {renderCityCard("Chicago", chicagoStats)}
          {renderCityCard("New York City", nycStats)}
          {renderCityCard("Los Angeles", laStats)}

          {/* Comparative Analysis */}
          <div className="md:col-span-3 mt-6 p-4 bg-slate-700/30 rounded-lg">
            <h4 className="text-lg font-semibold text-white mb-4">Key Insights</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="text-sm text-slate-300">Population Factor</div>
                <div className="text-2xl font-bold text-white">
                  {(Math.max(nycStats.totalIncidents, laStats.totalIncidents) / 
                    Math.min(chicagoStats.totalIncidents, nycStats.totalIncidents, laStats.totalIncidents)).toFixed(2)}×
                </div>
                <div className="text-xs text-slate-400">
                  Highest vs lowest incident ratio
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm text-slate-300">Effect Consistency</div>
                <div className="text-2xl font-bold text-white">
                  {(Math.max(
                    Math.abs(nycStats.effectSize - chicagoStats.effectSize),
                    Math.abs(nycStats.effectSize - laStats.effectSize),
                    Math.abs(chicagoStats.effectSize - laStats.effectSize)
                  )).toFixed(1)}%
                </div>
                <div className="text-xs text-slate-400">
                  Maximum effect size difference
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm text-slate-300">Statistical Power</div>
                <div className="text-2xl font-bold text-white">
                  {(chicagoStats.significance && nycStats.significance && laStats.significance) ? 100 : 
                   (chicagoStats.significance ? 33.33 : 0) + 
                   (nycStats.significance ? 33.33 : 0) + 
                   (laStats.significance ? 33.33 : 0)}%
                </div>
                <div className="text-xs text-slate-400">
                  Combined significance level
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GeographicalInsights; 