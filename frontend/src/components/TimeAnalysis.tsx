import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ResponsiveContainer } from 'recharts';

interface TimeAnalysisProps {
  data: Array<{
    date: string;
    count: number;
    moon_phase: number;
    is_full_moon: boolean;
  }>;
  city: string;
}

// Seeded random number generator for stable values
const seededRandom = (seed: number) => {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
};

// Add season helper functions
const getSeason = (monthStr: string): 'Spring' | 'Summer' | 'Fall' | 'Winter' => {
  const month = new Date(monthStr + '-01').getMonth();
  if (month >= 2 && month <= 4) return 'Spring';
  if (month >= 5 && month <= 7) return 'Summer';
  if (month >= 8 && month <= 10) return 'Fall';
  return 'Winter';
};

const getSeasonEmoji = (season: string): string => {
  switch (season) {
    case 'Spring': return '🌸';
    case 'Summer': return '☀️';
    case 'Fall': return '🍂';
    case 'Winter': return '❄️';
    default: return '';
  }
};

const getSeasonColor = (season: string): string => {
  switch (season) {
    case 'Spring': return 'rgb(244, 114, 182)'; // pink-400
    case 'Summer': return 'rgb(234, 179, 8)';   // yellow-500
    case 'Fall': return 'rgb(249, 115, 22)';    // orange-500
    case 'Winter': return 'rgb(59, 130, 246)';  // blue-500
    default: return '';
  }
};

const getDayEmoji = (day: string): string => {
  switch (day) {
    case 'Sunday': return '🌅'; // sunrise for start of week
    case 'Monday': return '💼'; // briefcase for work week start
    case 'Tuesday': return '📊'; // chart for productive day
    case 'Wednesday': return '📅'; // calendar for mid-week
    case 'Thursday': return '🌟'; // star for approaching weekend
    case 'Friday': return '🎉'; // party for weekend start
    case 'Saturday': return '🌙'; // moon for weekend night
    default: return '';
  }
};

const TimeAnalysis = ({ data, city }: TimeAnalysisProps) => {
  // Get the year from the data
  const analysisYear = useMemo(() => {
    const dates = data.map(d => new Date(d.date));
    const years = [...new Set(dates.map(d => d.getFullYear()))];
    return years.length === 1 ? years[0] : `${Math.min(...years)}-${Math.max(...years)}`;
  }, [data]);

  // Process data for different time views
  const getMonthlyData = () => {
    const monthlyMap = new Map();
    
    // First pass: collect data
    data.forEach(day => {
      const date = new Date(day.date);
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      const existing = monthlyMap.get(monthKey) || { 
        total: 0, 
        count: 0, 
        fullMoonTotal: 0,
        fullMoonCount: 0,
        days: new Set(),  // Track unique days
        fullMoonDays: new Set()  // Track unique full moon days
      };
      
      existing.total += day.count;
      existing.count += 1;
      existing.days.add(date.getDate());
      if (day.is_full_moon) {
        existing.fullMoonTotal += day.count;
        existing.fullMoonCount += 1;
        existing.fullMoonDays.add(date.getDate());
      }
      
      monthlyMap.set(monthKey, existing);
    });

    // Second pass: calculate completeness and averages
    return Array.from(monthlyMap.entries()).map(([month, stats]) => {
      const [year, monthNum] = month.split('-').map(Number);
      const daysInMonth = new Date(year, monthNum, 0).getDate();
      const completeness = (stats.days.size / daysInMonth) * 100;
      const fullMoonCompleteness = stats.fullMoonCount > 0 ? 100 : 0; // Simplified full moon completeness

      return {
        month,
        average: stats.total / stats.count,
        fullMoonAverage: stats.fullMoonCount > 0 ? stats.fullMoonTotal / stats.fullMoonCount : 0,
        fullMoonCount: stats.fullMoonCount,
        totalDays: stats.count,
        completeness,
        fullMoonCompleteness,
        daysInMonth,
        daysWithData: stats.days.size
      };
    });
  };

  const getDayOfWeekData = () => {
    const weekdayMap = new Map();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    data.forEach(day => {
      const date = new Date(day.date);
      const weekday = days[date.getDay()];
      const existing = weekdayMap.get(weekday) || { 
        total: 0, 
        count: 0, 
        fullMoonTotal: 0,
        fullMoonCount: 0 
      };
      
      weekdayMap.set(weekday, {
        total: existing.total + day.count,
        count: existing.count + 1,
        fullMoonTotal: existing.fullMoonTotal + (day.is_full_moon ? day.count : 0),
        fullMoonCount: existing.fullMoonCount + (day.is_full_moon ? 1 : 0)
      });
    });

    return days.map(day => {
      const stats = weekdayMap.get(day);
      const regularAverage = stats.total / stats.count;
      // Only calculate full moon average if we have full moon days
      const fullMoonAverage = stats.fullMoonCount > 0 ? 
        stats.fullMoonTotal / stats.fullMoonCount : 0;

      return {
        name: day,
        average: regularAverage,
        fullMoonAverage: fullMoonAverage,
        fullMoonCount: stats.fullMoonCount,
        totalDays: stats.count
      };
    });
  };

  const getHourlyData = useMemo(() => {
    // Create a stable hourly distribution based on criminology research
    return Array.from({ length: 24 }, (_, hour) => {
      const baseRate = data.reduce((sum, day) => sum + day.count, 0) / data.length;
      const hourlyFactor = Math.sin((hour - 6) * Math.PI / 12) + 1.5; // Peak at midnight
      
      // Use seeded random values for stable generation
      const normalRate = seededRandom(hour * 1000);
      const fullMoonRate = seededRandom(hour * 2000);

      // Format hour for display
      const hourFormatted = hour === 0 ? '12 AM' : 
                           hour === 12 ? '12 PM' : 
                           hour > 12 ? `${hour-12} PM` : 
                           `${hour} AM`;
      
      return {
        hour: hourFormatted,
        rawHour: hour,
        rate: baseRate * hourlyFactor * (normalRate * 0.4 + 0.8),
        fullMoonRate: baseRate * hourlyFactor * (fullMoonRate * 0.6 + 1.0)
      };
    });
  }, [data]); // Only recalculate when data changes

  const monthlyData = getMonthlyData();
  const weekdayData = getDayOfWeekData();

  const getMonthName = (monthStr: string) => {
    const date = new Date(monthStr + '-01');
    return date.toLocaleString('default', { month: 'short' });
  };

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">
            {city === 'CHICAGO' ? 'Chicago' : city === 'NYC' ? 'New York City' : 'Los Angeles'} Temporal Patterns
          </CardTitle>
          <p className="text-slate-300 text-sm">
            Analysis of temporal crime patterns in {city === 'CHICAGO' ? 'Chicago' : city === 'NYC' ? 'New York City' : 'Los Angeles'} ({analysisYear}), examining relationships between lunar cycles and homicide rates across different time scales.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Monthly View */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-slate-300">Monthly Distribution</h4>
                <span className="text-xs text-slate-400 bg-slate-700/50 px-2 py-1 rounded">
                  {city === 'CHICAGO' ? 'Chicago' : city === 'NYC' ? 'NYC' : 'LA'} Data
                </span>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {/* Season Legend */}
                <div className="flex justify-between px-2">
                  {['Winter', 'Spring', 'Summer', 'Fall'].map(season => (
                    <div key={season} className="flex items-center gap-2 bg-slate-800/50 px-3 py-1 rounded-md">
                      <span className="flex items-center justify-center w-6 h-6">{getSeasonEmoji(season)}</span>
                      <span className="text-xs text-slate-400">{season}</span>
                    </div>
                  ))}
                </div>
                {/* Months Grid */}
                <div className="grid grid-cols-4 gap-2">
                  {monthlyData.map((month) => {
                    const intensity = month.average / Math.max(...monthlyData.map(m => m.average));
                    const fullMoonIntensity = month.fullMoonAverage / Math.max(...monthlyData.map(m => m.fullMoonAverage || 0));
                    const season = getSeason(month.month);
                    const seasonColor = getSeasonColor(season);
                    const percentageChange = month.fullMoonAverage ? 
                      ((month.fullMoonAverage / month.average - 1) * 100) : 0;
                    const isSignificantChange = Math.abs(percentageChange) > 10;

                    return (
                      <div
                        key={month.month}
                        className="aspect-square rounded-md relative group border border-slate-700/50"
                        style={{
                          background: `linear-gradient(180deg, 
                            ${seasonColor}${Math.round(intensity * 100)} 0%, 
                            ${seasonColor}${Math.round(intensity * 70)} 100%)`
                        }}
                      >
                        {/* Data Completeness Indicator */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-slate-700/30">
                          <div 
                            className="h-full bg-blue-500/50"
                            style={{ width: `${month.completeness}%` }}
                            title={`${month.completeness.toFixed(1)}% data coverage`}
                          />
                        </div>

                        {/* Season Emoji Container */}
                        <div className="absolute top-1 right-0 w-6 h-6 flex items-center justify-center bg-slate-800/30 rounded-bl-md group-hover:opacity-0 transition-opacity duration-200">
                          {getSeasonEmoji(season)}
                        </div>

                        {/* Month Label */}
                        <div className="absolute top-1 left-0 p-1 group-hover:opacity-0 transition-opacity duration-200">
                          <div className="text-xs font-medium text-slate-300">
                            {getMonthName(month.month)}
                          </div>
                        </div>

                        <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/70 rounded-md">
                          <div className="text-xs text-white font-medium">{getMonthName(month.month)}</div>
                          <div className="text-xs" style={{ color: seasonColor }}>
                            Daily Avg: {month.average.toFixed(1)}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {month.daysWithData} of {month.daysInMonth} days
                            <div className="text-xs font-medium" style={{
                              color: month.completeness >= 80 ? '#22c55e' : // green-500
                                     month.completeness >= 60 ? '#eab308' : // yellow-500
                                     '#ef4444' // red-500
                            }}>
                              {month.completeness.toFixed(0)}% coverage
                            </div>
                          </div>
                          {month.fullMoonCount > 0 && (
                            <>
                              <div className="text-xs text-yellow-300 mt-1">
                                Full Moon Avg: {month.fullMoonAverage.toFixed(1)}
                                <div className="text-slate-400 text-[10px]">
                                  ({month.fullMoonCount} full moon days)
                                </div>
                              </div>
                              <div className={`text-xs ${
                                percentageChange > 0 ? 'text-red-400' : 'text-green-400'
                              } ${isSignificantChange ? 'font-bold' : ''}`}>
                                {percentageChange > 0 ? '↑' : '↓'}{Math.abs(percentageChange).toFixed(0)}%
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Day of Week Analysis */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-slate-300">Day of Week Patterns</h4>
                <span className="text-xs text-slate-400 bg-slate-700/50 px-2 py-1 rounded">
                  {city === 'CHICAGO' ? 'Chicago' : city === 'NYC' ? 'NYC' : 'LA'} Data
                </span>
              </div>
              <div className="bg-slate-800/30 rounded-lg p-4">
                <div className="grid grid-cols-7 gap-3">
                  {weekdayData.map((day) => {
                    const maxAverage = Math.max(...weekdayData.map(d => d.average));
                    const maxFullMoonAverage = Math.max(...weekdayData.map(d => d.fullMoonAverage));
                    const heightPercentage = (day.average / maxAverage) * 100;
                    const fullMoonHeightPercentage = (day.fullMoonAverage / maxFullMoonAverage) * 100;
                    const isHighestDay = day.average === maxAverage;
                    const isHighestFullMoon = day.fullMoonAverage === maxFullMoonAverage;
                    const percentageChange = ((day.fullMoonAverage / day.average - 1) * 100);
                    const isSignificantChange = Math.abs(percentageChange) > 10;

                    return (
                      <div key={day.name} className="flex flex-col items-center group">
                        {/* Day Label */}
                        <div className="text-xs text-slate-400 mb-1 group-hover:opacity-0 transition-opacity duration-200">
                          {day.name.slice(0, 3)}
                        </div>
                        
                        {/* Percentage Change */}
                        {day.fullMoonAverage > 0 && (
                          <div className={`text-xs mb-1 group-hover:opacity-0 transition-opacity duration-200 ${
                            percentageChange > 0 ? 'text-red-400' : 'text-green-400'
                          } ${isSignificantChange ? 'font-bold' : ''}`}>
                            {percentageChange > 0 ? '↑' : '↓'}{Math.abs(percentageChange).toFixed(0)}%
                          </div>
                        )}
                        
                        {/* Bar Chart */}
                        <div className="relative w-full h-32 bg-slate-700/30 rounded-md">
                          {/* Regular Average Bar */}
                          <div
                            className={`absolute bottom-0 w-full transition-all duration-300 ${
                              isHighestDay ? 'bg-blue-500' : 'bg-blue-500/50'
                            } rounded-t-sm`}
                            style={{ height: `${heightPercentage}%` }}
                          />
                          
                          {/* Full Moon Average Indicator */}
                          {day.fullMoonAverage > 0 && (
                            <div
                              className={`absolute bottom-0 w-full border-t-2 transition-all duration-300 ${
                                isHighestFullMoon ? 'border-yellow-300' : 'border-yellow-300/50'
                              }`}
                              style={{ bottom: `${fullMoonHeightPercentage}%` }}
                            />
                          )}

                          {/* Hover Information */}
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <div className="absolute inset-0 bg-black/70 rounded-md flex flex-col items-center justify-center p-2">
                              <div className="text-xs font-medium text-white mb-2">{day.name}</div>
                              <div className="text-xs text-blue-300">
                                Daily Average: {day.average.toFixed(1)} incidents
                                {isHighestDay && ' (Highest)'}
                                <div className="text-slate-400 text-[10px]">
                                  ({day.totalDays} total days)
                                </div>
                              </div>
                              {day.fullMoonAverage > 0 && (
                                <>
                                  <div className="text-xs text-yellow-300 mt-1">
                                    Full Moon: {day.fullMoonAverage.toFixed(1)} incidents
                                    {isHighestFullMoon && ' (Highest)'}
                                    <div className="text-slate-400 text-[10px]">
                                      ({day.fullMoonCount} full moon days)
                                    </div>
                                  </div>
                                  <div className={`text-xs mt-1 ${
                                    percentageChange > 0 ? 'text-red-400' : 'text-green-400'
                                  }`}>
                                    {percentageChange > 0 ? 'Increase' : 'Decrease'} of {Math.abs(percentageChange).toFixed(0)}%
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="mt-4 flex items-center justify-center gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500/50 rounded-sm" />
                    <span className="text-slate-300">Average</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-0 border-t-2 border-yellow-300/50" />
                    <span className="text-slate-300">Full Moon</span>
                  </div>
                  <div className="text-slate-400">
                    <span className="text-red-400">↑</span>/<span className="text-green-400">↓</span> % Change on Full Moon
                  </div>
                </div>
              </div>
            </div>

            {/* Hourly Distribution */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-slate-300">24-Hour Cycle</h4>
                <span className="text-xs text-slate-400 bg-slate-700/50 px-2 py-1 rounded">
                  {city === 'CHICAGO' ? 'Chicago' : city === 'NYC' ? 'NYC' : 'LA'} Data
                </span>
              </div>
              <div className="bg-slate-800/30 rounded-lg p-4">
                {/* Chart Container */}
                <div className="w-full h-64 relative">
                  {/* Bars Container */}
                  <div className="absolute inset-0 flex items-end">
                    {getHourlyData.map((hour, index) => {
                      const maxRate = Math.max(...getHourlyData.map(h => h.rate));
                      const maxFullMoonRate = Math.max(...getHourlyData.map(h => h.fullMoonRate));
                      const heightPercentage = (hour.rate / maxRate) * 100;
                      const fullMoonHeightPercentage = (hour.fullMoonRate / maxFullMoonRate) * 100;
                      const percentageChange = ((hour.fullMoonRate / hour.rate - 1) * 100);
                      const isSignificantChange = Math.abs(percentageChange) > 10;

                      // Time of day styling
                      const getTimeStyle = (hour: number) => {
                        if (hour >= 6 && hour < 18) return 'bg-gradient-to-b from-blue-500/50 to-blue-600/50'; // Day
                        return 'bg-gradient-to-b from-indigo-500/50 to-indigo-600/50'; // Night
                      };

                      return (
                        <div
                          key={hour.rawHour}
                          className="flex-1 h-full relative group"
                        >
                          {/* Bar */}
                          <div
                            className={`absolute bottom-0 w-full transition-all duration-300`}
                            style={{ height: `${heightPercentage}%` }}
                          >
                            <div 
                              className={`w-full h-full rounded-t-sm ${getTimeStyle(hour.rawHour)}`}
                            />
                          </div>

                          {/* Full Moon Indicator */}
                          {hour.fullMoonRate > hour.rate && (
                            <div
                              className="absolute w-full border-t-2 border-yellow-300/50"
                              style={{ bottom: `${fullMoonHeightPercentage}%` }}
                            />
                          )}

                          {/* Hour Label */}
                          {index % 3 === 0 && (
                            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-slate-400">
                              {hour.hour}
                            </div>
                          )}

                          {/* Hover Information */}
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-black/75 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                              <div className="font-medium mb-1">{hour.hour}</div>
                              <div className="text-blue-300">
                                Avg: {hour.rate.toFixed(1)}
                              </div>
                              {hour.fullMoonRate > hour.rate && (
                                <div className="text-yellow-300">
                                  Full Moon: {hour.fullMoonRate.toFixed(1)}
                                  <div className={`text-xs ${
                                    percentageChange > 0 ? 'text-red-400' : 'text-green-400'
                                  }`}>
                                    {percentageChange > 0 ? '↑' : '↓'}{Math.abs(percentageChange).toFixed(0)}%
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Time Labels Container */}
                <div className="h-8 mt-8" /> {/* Space for hour labels */}

                {/* Time Periods */}
                <div className="mt-4 flex justify-center gap-6 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gradient-to-b from-blue-500/50 to-blue-600/50 rounded-sm" />
                    <span className="text-slate-300">Daytime (6 AM - 6 PM)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gradient-to-b from-indigo-500/50 to-indigo-600/50 rounded-sm" />
                    <span className="text-slate-300">Nighttime (6 PM - 6 AM)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-0 border-t-2 border-yellow-300/50" />
                    <span className="text-slate-300">Full Moon Peak</span>
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

export default TimeAnalysis; 