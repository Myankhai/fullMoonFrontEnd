import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, ZAxis } from 'recharts';
import ComparisonChart from './components/ComparisonChart';
import DistributionAnalysis from './components/DistributionAnalysis';
import StatisticsPanel from './components/StatisticsPanel';
import TimeAnalysis from './components/TimeAnalysis';
import GeographicalInsights from './components/GeographicalInsights';

interface DailyData {
  date: string;
  count: number;
  moon_phase: number;
  is_full_moon: boolean;
}

interface CityData {
  correlation: number;
  p_value: number;
  daily_data: DailyData[];
}

interface CombinedData {
  cities: {
    CHICAGO: CityData;
    NYC: CityData;
    LA: CityData;
  };
}

const App: React.FC = () => {
  const [data, setData] = useState<CombinedData | null>(null);
  const [selectedCity, setSelectedCity] = useState<'CHICAGO' | 'NYC' | 'LA'>('CHICAGO');
  const [showTable, setShowTable] = useState<boolean>(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  
  const getMoonPhaseEmoji = (phase: number): string => {
    if (phase >= 0 && phase < 0.125) return '🌑';
    if (phase < 0.25) return '🌒';
    if (phase < 0.375) return '🌓';
    if (phase < 0.625) return '🌔';
    if (phase < 0.75) return '🌕';
    if (phase < 0.875) return '🌖';
    if (phase < 0.95) return '🌗';
    return '🌘';
  };

  const getMoonPhaseName = (phase: number): string => {
    if (phase >= 0 && phase < 0.125) return 'New Moon';
    if (phase < 0.25) return 'Waxing Crescent';
    if (phase < 0.375) return 'First Quarter';
    if (phase < 0.625) return 'Waxing Gibbous';
    if (phase < 0.75) return 'Full Moon';
    if (phase < 0.875) return 'Waning Gibbous';
    if (phase < 0.95) return 'Last Quarter';
    return 'Waning Crescent';
  };

  // Generate fixed crater positions once when component mounts
  const [craterPattern] = useState(() => {
    const craters = [];
    
    // Mare (large dark areas)
    craters.push(
      `circle at 30% 30%, rgba(90, 90, 90, 0.4) 0%, rgba(128, 128, 128, 0.2) 15%, transparent 25%`,
      `circle at 60% 70%, rgba(90, 90, 90, 0.35) 0%, rgba(128, 128, 128, 0.2) 12%, transparent 20%`,
      `circle at 45% 45%, rgba(90, 90, 90, 0.3) 0%, rgba(128, 128, 128, 0.2) 8%, transparent 15%`
    );

    // Large craters with shadows
    for (let i = 0; i < 5; i++) {
      const x = Math.random() * 70 + 15;
      const y = Math.random() * 70 + 15;
      const size = Math.random() * 8 + 6;
      // Shadow
      craters.push(`circle at ${x}% ${y}%, rgba(60, 60, 60, 0.4) 0%, transparent ${size}%`);
      // Highlight
      craters.push(`circle at ${x - 1}% ${y - 1}%, rgba(255, 255, 255, 0.2) 0%, transparent ${size - 1}%`);
    }

    // Medium craters
    for (let i = 0; i < 8; i++) {
      const x = Math.random() * 80 + 10;
      const y = Math.random() * 80 + 10;
      const size = Math.random() * 4 + 3;
      craters.push(`circle at ${x}% ${y}%, rgba(80, 80, 80, 0.3) 0%, transparent ${size}%`);
    }

    return craters.map(crater => `radial-gradient(${crater})`).join(',');
  });

  // Calculate current moon phase based on scroll position
  const getMoonPhase = (progress: number) => {
    // Map scroll progress (0-1) to lunar phase (0-7)
    const phaseIndex = Math.floor(progress * 8);
    const phases = [
      'new-moon',          // 0
      'waxing-crescent',   // 1
      'first-quarter',     // 2
      'waxing-gibbous',    // 3
      'full-moon',         // 4
      'waning-gibbous',    // 5
      'third-quarter',     // 6
      'waning-crescent'    // 7
    ];
    return phases[Math.min(phaseIndex, 7)];
  };

  // Calculate shadow position and size based on moon phase
  const getMoonShadow = (phase: string, size: number): string => {
    switch (phase) {
      case 'new-moon':
        return `inset 0 0 0 ${size}px rgba(0, 0, 0, 0.95)`;
      case 'waxing-crescent':
        return `inset ${-size/2}px 0 ${size/2}px rgba(0, 0, 0, 0.95)`;
      case 'first-quarter':
        return `inset ${-size/2}px 0 ${size/2}px rgba(0, 0, 0, 0.95)`;
      case 'waxing-gibbous':
        return `inset ${-size/3}px 0 ${size/2}px rgba(0, 0, 0, 0.95)`;
      case 'full-moon':
        return 'none';
      case 'waning-gibbous':
        return `inset ${size/3}px 0 ${size/2}px rgba(0, 0, 0, 0.95)`;
      case 'third-quarter':
        return `inset ${size/2}px 0 ${size/2}px rgba(0, 0, 0, 0.95)`;
      case 'waning-crescent':
        return `inset ${size/2}px 0 ${size/2}px rgba(0, 0, 0, 0.95)`;
      default:
        return 'none';
    }
  };

  // Calculate moon glow based on phase and scroll position
  const getMoonGlow = (phase: string, size: number, progress: number): string => {
    const baseGlow = `0 0 ${size/3}px`;
    const intensity = (() => {
      switch (phase) {
        case 'new-moon': return 0.1;
        case 'waxing-crescent': return 0.3;
        case 'first-quarter': return 0.5;
        case 'waxing-gibbous': return 0.7;
        case 'full-moon': return 1.0;
        case 'waning-gibbous': return 0.7;
        case 'third-quarter': return 0.5;
        case 'waning-crescent': return 0.3;
        default: return 0.1;
      }
    })();
    // Create a more subtle glow effect that intensifies with scroll
    const scrollAdjustedIntensity = intensity * (0.2 + (progress * 0.8));
    const innerGlow = `0 0 ${size/6}px rgba(255, 255, 255, ${scrollAdjustedIntensity * 0.4})`;
    const outerGlow = `0 0 ${size/3}px rgba(255, 255, 255, ${scrollAdjustedIntensity * 0.2})`;
    return `${innerGlow}, ${outerGlow}`;
  };

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = window.scrollY;
      const progress = Math.min(scrolled / windowHeight, 1);
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Attempting to fetch data...');
        const response = await fetch(import.meta.env.BASE_URL + 'combined_analysis.json');
        if (!response.ok) {
          console.error('Response not OK:', response.status, response.statusText);
          throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
        }
        const jsonData = await response.json();
        console.log('Data fetched successfully');
        setData(jsonData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const moonSize = 500;
  const currentPhase = getMoonPhase(scrollProgress);
  const moonShadow = getMoonShadow(currentPhase, moonSize);
  const moonGlow = getMoonGlow(currentPhase, moonSize, scrollProgress);

  // Calculate base opacity that increases with scroll
  const getBaseOpacity = (progress: number) => {
    return 0.3 + (progress * 0.65); // Starts at 0.3, increases to 0.95
  };

  const moonBaseStyle = {
    position: 'fixed' as const,
    top: '50%',
    right: '10%',
    width: `${moonSize}px`,
    height: `${moonSize}px`,
    borderRadius: '50%',
    transform: 'translateY(-50%)',
    backgroundColor: '#fdf4e3',
    border: 'none',
    boxShadow: `${moonShadow}, ${moonGlow}`,
    opacity: getBaseOpacity(scrollProgress),
    zIndex: 1,
    pointerEvents: 'none' as const,
    transition: 'opacity 0.3s ease-out, box-shadow 0.3s ease-out',
  };

  const moonSurfaceStyle = {
    ...moonBaseStyle,
    backgroundColor: 'transparent',
    background: craterPattern,
    boxShadow: moonShadow,
    opacity: currentPhase === 'new-moon' ? 
      0.1 + (scrollProgress * 0.1) : // Very subtle during new moon
      Math.min(0.7, 0.3 + scrollProgress * 0.4), // More visible during other phases
    zIndex: 2,
    mixBlendMode: 'soft-light' as const,
    transition: 'opacity 0.3s ease-out, box-shadow 0.3s ease-out',
  };

  const containerStyle = {
    position: 'relative' as const,
    minHeight: '100vh',
    backgroundColor: 'black',
    overflow: 'hidden' as const,
  };

  const contentWrapperStyle = {
    position: 'relative' as const,
    zIndex: 10,
    minHeight: '100vh',
    overflowX: 'hidden' as const,
  };

  const contentStyle = {
    maxWidth: '100%',
    margin: '0 auto',
    padding: '2rem',
    position: 'relative' as const,
  };

  const overlayStyle = {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `
      radial-gradient(
        circle at 90% 50%,
        rgba(0, 0, 0, ${Math.max(0.05, 0.3 - scrollProgress * 0.2)}) 0%,
        rgba(0, 0, 0, ${Math.max(0.2, 0.7 - scrollProgress * 0.2)}) 70%
      )
    `,
    zIndex: 1,
    pointerEvents: 'none' as const,
    transition: 'background 0.3s ease-out',
  };

  if (!data) {
    return (
      <div style={containerStyle} className="flex items-center justify-center">
        <div className="text-2xl text-gray-100 relative z-10">
          Loading data... Please wait.
          <div className="text-sm mt-2 text-gray-400">
            If this persists, there might be an issue with data loading.
          </div>
        </div>
      </div>
    );
  }

  const currentCityData = data.cities[selectedCity];

  // Calculate statistics
  const fullMoonDays = currentCityData.daily_data.filter(day => day.is_full_moon);
  const nonFullMoonDays = currentCityData.daily_data.filter(day => !day.is_full_moon);
  
  const fullMoonAvg = fullMoonDays.reduce((sum, day) => sum + day.count, 0) / fullMoonDays.length;
  const nonFullMoonAvg = nonFullMoonDays.reduce((sum, day) => sum + day.count, 0) / nonFullMoonDays.length;
  const totalHomicides = currentCityData.daily_data.reduce((sum, day) => sum + day.count, 0);

  // Prepare scatter plot data
  const scatterData = currentCityData.daily_data.map(day => ({
    moonPhase: day.moon_phase,
    homicides: day.count,
    date: new Date(day.date).toLocaleDateString(),
    isFull: day.is_full_moon
  }));

  // Prepare monthly averages
  const monthlyData = currentCityData.daily_data.reduce((acc: any[], day) => {
    const date = new Date(day.date);
    const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    const existingMonth = acc.find(m => m.month === monthKey);
    
    if (existingMonth) {
      existingMonth.totalHomicides += day.count;
      existingMonth.days += 1;
    } else {
      acc.push({
        month: monthKey,
        totalHomicides: day.count,
        days: 1
      });
    }
    return acc;
  }, []).map(month => ({
    month: month.month,
    average: month.totalHomicides / month.days
  }));

  // Calculate the year range from the data
  const analysisYear = (() => {
    const dates = currentCityData.daily_data.map(d => new Date(d.date));
    const years = [...new Set(dates.map(d => d.getFullYear()))];
    return years.length === 1 ? years[0] : `${Math.min(...years)}-${Math.max(...years)}`;
  })();

  return (
    <div style={containerStyle}>
      <div style={moonBaseStyle} aria-hidden="true" />
      <div style={moonSurfaceStyle} aria-hidden="true" />
      <div style={overlayStyle} aria-hidden="true" />
      <div style={contentWrapperStyle}>
        <div style={contentStyle}>
          <header className="text-center mb-8">
            <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-400 mb-4">
              Moon Phase Impact Analysis
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Exploring the relationship between lunar cycles and homicide rates in major US cities ({analysisYear}). This analysis investigates whether full moon periods correlate with changes in violent crime patterns.
            </p>
          </header>

          <div className="max-w-7xl mx-auto space-y-12">
            {/* Introduction Section */}
            <section className="prose prose-invert max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-blue-300 mb-4">About This Analysis</h2>
              
              {/* Historical Context */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 mb-6">
                <h3 className="text-xl font-semibold text-white mb-3">Historical Context</h3>
                <p className="text-slate-300">
                  The belief in lunar influence on human behavior has deep historical roots, reflected in the 
                  very language we use today. The word "lunatic" originates from the Latin word "lunaticus," 
                  which translates to "moonstruck" or "of the moon." This etymology reveals centuries-old beliefs 
                  about the moon's influence on human behavior.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <div className="space-y-2">
                    <h4 className="text-lg font-medium text-blue-300">Medieval Understanding</h4>
                    <p className="text-sm text-slate-400">
                      In medieval Europe, the moon's phases were believed to directly influence mental states 
                      and behavior patterns. Those exhibiting erratic or violent tendencies were often labeled 
                      as "moonstruck," reflecting a perceived connection between lunar cycles and human conduct.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-lg font-medium text-blue-300">Modern Investigation</h4>
                    <p className="text-sm text-slate-400">
                      While the term's meaning has evolved over centuries, the question of lunar influence 
                      remains a subject of scientific inquiry. Our analysis applies modern statistical methods 
                      to examine whether any measurable correlation exists between moon phases and violent behavior.
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-slate-300">
                This study examines the potential influence of lunar cycles on homicide rates in Chicago, New York City, and Los Angeles. 
                While ancient beliefs about the moon's influence on human behavior were based on observation and folklore, 
                our analysis applies rigorous statistical methods to investigate any measurable correlations between lunar 
                phases and violent crime patterns.
              </p>

              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 mt-6">
                <h3 className="text-xl font-semibold text-white mb-3">Key Questions Explored</h3>
                <ul className="space-y-2 text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>Do homicide rates show statistically significant variations during full moon periods?</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>Are patterns consistent across different urban environments?</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>How do temporal factors interact with lunar phases?</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>Can modern data analysis support or refute historical beliefs about lunar influence?</span>
                  </li>
                </ul>
              </div>

              <div className="bg-slate-700/30 rounded-lg p-4 mt-6">
                <p className="text-sm text-slate-400 italic">
                  Note: This analysis approaches the subject from a purely statistical perspective, 
                  examining correlations without implying causation. While historical beliefs about lunar 
                  influence are fascinating, our focus is on measurable patterns in modern crime data.
                </p>
              </div>
            </section>

            {/* City Selection */}
            <div className="flex flex-col items-center gap-4 mb-8">
              <h3 className="text-xl font-semibold text-white">Select a City for Detailed Analysis</h3>
              <select
                className="p-3 rounded-lg bg-gray-800 text-gray-100 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value as 'CHICAGO' | 'NYC' | 'LA')}
              >
                <option value="CHICAGO">Chicago</option>
                <option value="NYC">New York City</option>
                <option value="LA">Los Angeles</option>
              </select>
            </div>

            {/* Geographical Insights */}
            <section>
              <div className="max-w-4xl mx-auto mb-6">
                <h2 className="text-3xl font-bold text-blue-300 mb-4">Geographical Comparison</h2>
                <p className="text-slate-300">
                  By comparing Chicago, New York City, and Los Angeles, we can identify whether lunar effects on homicide rates 
                  are consistent across different urban environments. This comparison accounts for variations in 
                  population size, urban density, and local factors that might influence crime patterns.
                </p>
              </div>
              <GeographicalInsights data={data.cities} />
            </section>

            {/* Statistical Analysis */}
            <section>
              <div className="max-w-4xl mx-auto mb-6">
                <h2 className="text-3xl font-bold text-blue-300 mb-4">Statistical Analysis</h2>
                <p className="text-slate-300">
                  Our statistical analysis examines the correlation between moon phases and homicide rates, 
                  using rigorous methods to determine whether any observed patterns are statistically significant. 
                  The analysis includes measures of effect size, confidence intervals, and significance testing.
                </p>
              </div>
              <StatisticsPanel city={selectedCity} data={data.cities[selectedCity]} />
            </section>

            {/* Distribution Analysis */}
            <section>
              <div className="max-w-4xl mx-auto mb-6">
                <h2 className="text-3xl font-bold text-blue-300 mb-4">Distribution Patterns</h2>
                <p className="text-slate-300">
                  This section visualizes how homicide rates are distributed across different moon phases, 
                  helping to identify any clustering or patterns that might suggest a lunar influence. 
                  The analysis includes both raw numbers and normalized rates to account for varying time periods.
                </p>
              </div>
              <DistributionAnalysis city={selectedCity} data={data.cities[selectedCity]} />
            </section>

            {/* Temporal Analysis */}
            <section>
              <div className="max-w-4xl mx-auto mb-6">
                <h2 className="text-3xl font-bold text-blue-300 mb-4">Temporal Patterns</h2>
                <p className="text-slate-300">
                  Understanding how lunar effects interact with temporal patterns is crucial for this analysis. 
                  We examine variations across different time scales - monthly, weekly, and daily - to identify 
                  any recurring patterns or notable correlations with moon phases.
                </p>
              </div>
              <TimeAnalysis data={data.cities[selectedCity].daily_data} city={selectedCity} />
            </section>

            {/* Conclusion Section */}
            <section className="mb-12">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold text-blue-300 mb-4">Key Findings & Conclusions</h2>
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 space-y-6">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-slate-700/30 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                        <span className="text-xl">🏙️</span> Chicago Impact
                      </h3>
                      {(() => {
                        const chicagoStats = (() => {
                          const fullMoonDays = data.cities.CHICAGO.daily_data.filter(day => day.is_full_moon);
                          const nonFullMoonDays = data.cities.CHICAGO.daily_data.filter(day => !day.is_full_moon);
                          const fullMoonAvg = fullMoonDays.reduce((sum, day) => sum + day.count, 0) / fullMoonDays.length;
                          const nonFullMoonAvg = nonFullMoonDays.reduce((sum, day) => sum + day.count, 0) / nonFullMoonDays.length;
                          const percentDiff = ((fullMoonAvg - nonFullMoonAvg) / nonFullMoonAvg) * 100;
                          return { percentDiff, fullMoonAvg, nonFullMoonAvg };
                        })();
                        return (
                          <>
                            <p className="text-slate-300 text-sm">
                              {chicagoStats.percentDiff > 0 ? 
                                `${chicagoStats.percentDiff.toFixed(1)}% higher homicide rate` :
                                `${Math.abs(chicagoStats.percentDiff).toFixed(1)}% lower homicide rate`} during full moon periods
                            </p>
                            <div className="mt-2 text-xs text-slate-400">
                              Full Moon: {chicagoStats.fullMoonAvg.toFixed(2)} avg/day<br />
                              Other Days: {chicagoStats.nonFullMoonAvg.toFixed(2)} avg/day
                            </div>
                          </>
                        );
                      })()}
                    </div>

                    <div className="bg-slate-700/30 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                        <span className="text-xl">🗽</span> NYC Impact
                      </h3>
                      {(() => {
                        const nycStats = (() => {
                          const fullMoonDays = data.cities.NYC.daily_data.filter(day => day.is_full_moon);
                          const nonFullMoonDays = data.cities.NYC.daily_data.filter(day => !day.is_full_moon);
                          const fullMoonAvg = fullMoonDays.reduce((sum, day) => sum + day.count, 0) / fullMoonDays.length;
                          const nonFullMoonAvg = nonFullMoonDays.reduce((sum, day) => sum + day.count, 0) / nonFullMoonDays.length;
                          const percentDiff = ((fullMoonAvg - nonFullMoonAvg) / nonFullMoonAvg) * 100;
                          return { percentDiff, fullMoonAvg, nonFullMoonAvg };
                        })();
                        return (
                          <>
                            <p className="text-slate-300 text-sm">
                              {nycStats.percentDiff > 0 ? 
                                `${nycStats.percentDiff.toFixed(1)}% higher homicide rate` :
                                `${Math.abs(nycStats.percentDiff).toFixed(1)}% lower homicide rate`} during full moon periods
                            </p>
                            <div className="mt-2 text-xs text-slate-400">
                              Full Moon: {nycStats.fullMoonAvg.toFixed(2)} avg/day<br />
                              Other Days: {nycStats.nonFullMoonAvg.toFixed(2)} avg/day
                            </div>
                          </>
                        );
                      })()}
                    </div>

                    <div className="bg-slate-700/30 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                        <span className="text-xl">🌴</span> LA Impact
                      </h3>
                      {(() => {
                        const laStats = (() => {
                          const fullMoonDays = data.cities.LA.daily_data.filter(day => day.is_full_moon);
                          const nonFullMoonDays = data.cities.LA.daily_data.filter(day => !day.is_full_moon);
                          const fullMoonAvg = fullMoonDays.reduce((sum, day) => sum + day.count, 0) / fullMoonDays.length;
                          const nonFullMoonAvg = nonFullMoonDays.reduce((sum, day) => sum + day.count, 0) / nonFullMoonDays.length;
                          const percentDiff = ((fullMoonAvg - nonFullMoonAvg) / nonFullMoonAvg) * 100;
                          return { percentDiff, fullMoonAvg, nonFullMoonAvg };
                        })();
                        return (
                          <>
                            <p className="text-slate-300 text-sm">
                              {laStats.percentDiff > 0 ? 
                                `${laStats.percentDiff.toFixed(1)}% higher homicide rate` :
                                `${Math.abs(laStats.percentDiff).toFixed(1)}% lower homicide rate`} during full moon periods
                            </p>
                            <div className="mt-2 text-xs text-slate-400">
                              Full Moon: {laStats.fullMoonAvg.toFixed(2)} avg/day<br />
                              Other Days: {laStats.nonFullMoonAvg.toFixed(2)} avg/day
                            </div>
                            <div className="mt-3 text-xs text-blue-300/80 bg-blue-950/30 p-2 rounded">
                              <span className="font-medium">Coastal Factor:</span> As the only coastal city in the study, LA's lunar effects may be amplified by tidal forces and maritime conditions, potentially explaining its distinct pattern compared to inland cities Chicago and NYC.
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Statistical Summary */}
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white mb-3">Overall Impact</h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <span className="text-blue-400 mt-1">•</span>
                        <p className="text-slate-300 text-sm">
                          {(() => {
                            const cityStats = {
                              CHICAGO: data.cities.CHICAGO.p_value < 0.05,
                              NYC: data.cities.NYC.p_value < 0.05,
                              LA: data.cities.LA.p_value < 0.05
                            };
                            const significantCount = Object.values(cityStats).filter(Boolean).length;
                            return significantCount === 0 ? 
                              "No cities showed statistically significant changes during full moon periods." :
                              significantCount === 3 ?
                              "All three cities showed statistically significant changes during full moon periods." :
                              `${significantCount} out of 3 cities showed statistically significant changes during full moon periods.`;
                          })()}
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-blue-400 mt-1">•</span>
                        <p className="text-slate-300 text-sm">
                          {(() => {
                            const stats = {
                              CHICAGO: (() => {
                                const fullMoonDays = data.cities.CHICAGO.daily_data.filter(day => day.is_full_moon);
                                const nonFullMoonDays = data.cities.CHICAGO.daily_data.filter(day => !day.is_full_moon);
                                const fullMoonAvg = fullMoonDays.reduce((sum, day) => sum + day.count, 0) / fullMoonDays.length;
                                const nonFullMoonAvg = nonFullMoonDays.reduce((sum, day) => sum + day.count, 0) / nonFullMoonDays.length;
                                return ((fullMoonAvg - nonFullMoonAvg) / nonFullMoonAvg) * 100;
                              })(),
                              NYC: (() => {
                                const fullMoonDays = data.cities.NYC.daily_data.filter(day => day.is_full_moon);
                                const nonFullMoonDays = data.cities.NYC.daily_data.filter(day => !day.is_full_moon);
                                const fullMoonAvg = fullMoonDays.reduce((sum, day) => sum + day.count, 0) / fullMoonDays.length;
                                const nonFullMoonAvg = nonFullMoonDays.reduce((sum, day) => sum + day.count, 0) / nonFullMoonDays.length;
                                return ((fullMoonAvg - nonFullMoonAvg) / nonFullMoonAvg) * 100;
                              })(),
                              LA: (() => {
                                const fullMoonDays = data.cities.LA.daily_data.filter(day => day.is_full_moon);
                                const nonFullMoonDays = data.cities.LA.daily_data.filter(day => !day.is_full_moon);
                                const fullMoonAvg = fullMoonDays.reduce((sum, day) => sum + day.count, 0) / fullMoonDays.length;
                                const nonFullMoonAvg = nonFullMoonDays.reduce((sum, day) => sum + day.count, 0) / nonFullMoonDays.length;
                                return ((fullMoonAvg - nonFullMoonAvg) / nonFullMoonAvg) * 100;
                              })()
                            };
                            const maxCity = Object.entries(stats).reduce((a, b) => Math.abs(a[1]) > Math.abs(b[1]) ? a : b);
                            return `Most pronounced effect observed in ${maxCity[0] === 'CHICAGO' ? 'Chicago' : maxCity[0] === 'NYC' ? 'New York City' : 'Los Angeles'} with a ${maxCity[1] > 0 ? 'positive' : 'negative'} ${Math.abs(maxCity[1]).toFixed(1)}% difference.`;
                          })()}
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-blue-400 mt-1">•</span>
                        <p className="text-slate-300 text-sm">
                          These findings suggest that while lunar cycles may correlate with variations in homicide rates, the effect varies significantly by geographic location and urban environment.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Methodology Note */}
                  <div className="text-xs text-slate-400 italic border-t border-slate-700 pt-4">
                    Note: This analysis is based on {data.cities[selectedCity].daily_data.length} days of data from {
                      selectedCity === 'CHICAGO' ? 'Chicago' : 
                      selectedCity === 'NYC' ? 'New York City' : 
                      'Los Angeles'}, utilizing rigorous statistical methods while acknowledging the complex nature of crime patterns.
                  </div>
                </div>
              </div>
            </section>

            {/* Technical Implementation */}
            <section className="mb-12">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold text-blue-300 mb-4">Technical Implementation</h2>
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-3">Data Processing Pipeline</h3>
                    <p className="text-slate-300">
                      This project utilizes Python for data processing and analysis, with the PyEphem library 
                      performing precise astronomical calculations for moon phases. The data pipeline processes 
                      crime statistics from three major sources:
                    </p>
                    <ul className="mt-4 space-y-3">
                      <li className="flex items-start gap-2 text-slate-300">
                        <span className="text-blue-400 mt-1">•</span>
                        <span>Chicago Data Portal's crime statistics API</span>
                      </li>
                      <li className="flex items-start gap-2 text-slate-300">
                        <span className="text-blue-400 mt-1">•</span>
                        <span>NYC OpenData's crime data API</span>
                      </li>
                      <li className="flex items-start gap-2 text-slate-300">
                        <span className="text-blue-400 mt-1">•</span>
                        <span>Los Angeles Open Data Portal (data.lacity.org)</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-white mb-3">Frontend Visualization</h3>
                    <p className="text-slate-300">
                      The frontend is built with React and TypeScript, featuring interactive data visualizations 
                      that allow users to explore the relationships between lunar cycles and crime rates. The 
                      interface is designed to be both informative and intuitive, making complex statistical 
                      data accessible to a general audience.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-white mb-3">Open Source</h3>
                    <p className="text-slate-300">
                      This project is open source and all analysis can be independently verified. To explore 
                      the data processing methodology, review the code, or recreate these findings:
                    </p>
                    <a 
                      href="https://github.com/Myankhai/fullMoonMoreHomicides" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="inline-block mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
                    >
                      View Project on GitHub
                    </a>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
