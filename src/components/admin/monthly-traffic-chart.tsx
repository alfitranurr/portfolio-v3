'use client'

import * as React from 'react'
import { Calendar, TrendingUp, Loader2, Users, Eye } from 'lucide-react'
import { getMonthlyVisitorStatsAction, getAvailableYearsAction } from '@/app/admin/actions'
import { MonthlyVisitorStats } from '@/lib/data-service'

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
]

interface MonthlyTrafficChartProps {
  refreshTrigger?: number
}

export function MonthlyTrafficChart({ refreshTrigger }: MonthlyTrafficChartProps) {
  const [selectedYear, setSelectedYear] = React.useState<number>(new Date().getFullYear())
  const [availableYears, setAvailableYears] = React.useState<number[]>([new Date().getFullYear()])
  const [chartData, setChartData] = React.useState<MonthlyVisitorStats[]>([])
  const [isMissingFunction, setIsMissingFunction] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(true)
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null)
  const [totalViewsInYear, setTotalViewsInYear] = React.useState(0)
  const [totalVisitorsInYear, setTotalVisitorsInYear] = React.useState(0)

  // Fetch available years on mount
  React.useEffect(() => {
    async function loadYears() {
      try {
        const res = await getAvailableYearsAction()
        if (res.success && res.data && res.data.length > 0) {
          setAvailableYears(res.data)
          // Set initial year to the latest available year
          const latestYear = res.data[0]
          setSelectedYear(latestYear)
        } else {
          // Fallback to current year
          const currentYear = new Date().getFullYear()
          setAvailableYears([currentYear, currentYear - 1])
          setSelectedYear(currentYear)
        }
      } catch (err) {
        console.error('Failed to load available years:', err)
      }
    }
    loadYears()
  }, [])

  // Fetch monthly stats when selectedYear changes
  React.useEffect(() => {
    async function loadStats() {
      setIsLoading(true)
      try {
        const res = await getMonthlyVisitorStatsAction(selectedYear)
        if (res.success && res.data) {
          setChartData(res.data.stats)
          setTotalViewsInYear(Number(res.data.yearlyViews ?? 0))
          setTotalVisitorsInYear(Number(res.data.yearlyVisitors ?? 0))
          setIsMissingFunction(!!res.data.isMissingFunction)
        } else {
          // Fallback empty data
          setChartData(Array.from({ length: 12 }, (_, i) => ({
            month: i + 1,
            views: 0,
            visitors: 0
          })))
          setTotalViewsInYear(0)
          setTotalVisitorsInYear(0)
          setIsMissingFunction(false)
        }
      } catch (err) {
        console.error('Failed to load monthly traffic stats:', err)
      } finally {
        setIsLoading(false)
      }
    }
    loadStats()
  }, [selectedYear, refreshTrigger])

  // Calculate SVG Dimensions & Scales
  const svgWidth = 1000
  const svgHeight = 300
  const paddingLeft = 60
  const paddingRight = 30
  const paddingTop = 30
  const paddingBottom = 40

  const chartWidth = svgWidth - paddingLeft - paddingRight
  const chartHeight = svgHeight - paddingTop - paddingBottom

  // Find max value for Y scaling
  const maxVal = React.useMemo(() => {
    if (chartData.length === 0) return 100
    const maxDataVal = Math.max(
      ...chartData.map(d => Math.max(d.views, d.visitors))
    )
    // Round to a nice number with buffer
    return Math.max(Math.ceil(maxDataVal * 1.15 / 10) * 10, 10)
  }, [chartData])

  // Helpers to get X and Y coordinates
  const getX = (index: number) => {
    return paddingLeft + (index * (chartWidth / 11))
  }

  const getY = (value: number) => {
    const ratio = maxVal > 0 ? value / maxVal : 0
    return svgHeight - paddingBottom - (ratio * chartHeight)
  }

  // Generate SVG path for a line
  const generateLinePath = (dataKey: 'views' | 'visitors') => {
    if (chartData.length === 0) return ''
    return chartData.map((d, i) => {
      const x = getX(i)
      const y = getY(d[dataKey])
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
    }).join(' ')
  }

  // Generate SVG path for filled area under the line
  const generateAreaPath = (dataKey: 'views' | 'visitors') => {
    if (chartData.length === 0) return ''
    const linePath = generateLinePath(dataKey)
    const startX = getX(0)
    const endX = getX(chartData.length - 1)
    const bottomY = svgHeight - paddingBottom
    return `${linePath} L ${endX} ${bottomY} L ${startX} ${bottomY} Z`
  }

  const viewsLinePath = generateLinePath('views')
  const viewsAreaPath = generateAreaPath('views')
  const visitorsLinePath = generateLinePath('visitors')
  const visitorsAreaPath = generateAreaPath('visitors')

  // Total metrics are fetched directly from database query responses to avoid double counting unique visitors

  return (
    <div className="p-6 rounded-3xl glass-panel border border-slate-200/10 dark:border-slate-800/10 relative overflow-hidden group">
      {/* Header details */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="text-base font-extrabold text-foreground">Grafik Kunjungan Bulanan</h3>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Analisis data page views dan unique visitors per bulan.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>Filter Tahun:</span>
          </span>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-3 py-1.5 rounded-xl bg-white/5 dark:bg-black/20 border border-slate-300 dark:border-slate-800/30 text-foreground text-xs focus:outline-none focus:border-primary/50 transition-all font-semibold cursor-pointer"
          >
            {availableYears.map((year) => (
              <option key={year} value={year} className="dark:bg-slate-900 text-foreground">
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats Summary Panel */}
      <div className="grid grid-cols-2 gap-4 mb-6 p-4 rounded-2xl bg-white/5 border border-slate-200/5 dark:border-slate-800/5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Total Views ({selectedYear})</span>
            <h4 className="text-lg font-black text-purple-400 mt-0.5">{totalViewsInYear.toLocaleString()}</h4>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Total Unique Visitors ({selectedYear})</span>
            <h4 className="text-lg font-black text-cyan-400 mt-0.5">{totalVisitorsInYear.toLocaleString()}</h4>
          </div>
        </div>
      </div>

      {/* Chart Wrapper */}
      <div className="relative w-full">
        {isLoading ? (
          <div className="w-full h-[220px] sm:h-[300px] flex flex-col items-center justify-between py-12 bg-black/5 dark:bg-black/10 backdrop-blur-xs rounded-2xl border border-white/5">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <span className="text-xs text-muted-foreground font-medium">Memuat data grafik...</span>
          </div>
        ) : isMissingFunction ? (
          <div className="p-5 rounded-2xl border border-amber-500/20 bg-amber-500/10 text-amber-200 text-xs md:text-sm space-y-3 animate-fade-in">
            <div className="flex items-center gap-2 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
              <span>Fungsi Analisis Bulanan Belum Aktif</span>
            </div>
            <p className="text-amber-200/80 leading-relaxed">
              Fungsi agregasi database <code>get_monthly_analytics</code> atau <code>get_available_years</code> belum dibuat di Supabase Anda. Silakan buka SQL Editor di dashboard Supabase Anda, lalu salin dan jalankan perintah berikut:
            </p>
            <pre className="p-4 rounded-xl bg-black/40 border border-white/5 text-amber-300 font-mono overflow-x-auto text-[10px] md:text-[11px] whitespace-pre select-all max-h-[200px]">
{`-- Buat Fungsi Agregasi Bulanan
DROP FUNCTION IF EXISTS public.get_monthly_analytics(INT);
CREATE OR REPLACE FUNCTION public.get_monthly_analytics(target_year INT)
RETURNS TABLE (
  month_num INT,
  views_count BIGINT,
  visitors_count BIGINT,
  yearly_views BIGINT,
  yearly_visitors BIGINT
) AS $$
DECLARE
  y_views BIGINT;
  y_visitors BIGINT;
BEGIN
  -- Hitung total tahunan secara akurat
  SELECT COUNT(*), COUNT(DISTINCT visitor_id)
  INTO y_views, y_visitors
  FROM public.page_views
  WHERE EXTRACT(YEAR FROM created_at) = target_year;

  RETURN QUERY
  SELECT 
    m.month::INT AS month_num,
    COALESCE(COUNT(p.id), 0)::BIGINT AS views_count,
    COALESCE(COUNT(DISTINCT p.visitor_id), 0)::BIGINT AS visitors_count,
    y_views AS yearly_views,
    y_visitors AS yearly_visitors
  FROM generate_series(1, 12) m(month)
  LEFT JOIN public.page_views p ON EXTRACT(MONTH FROM p.created_at) = m.month 
                                AND EXTRACT(YEAR FROM p.created_at) = target_year
  GROUP BY m.month, y_views, y_visitors
  ORDER BY month_num;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Buat Fungsi Ambil Tahun yang Tersedia
CREATE OR REPLACE FUNCTION public.get_available_years()
RETURNS TABLE (
  year_val INT
) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT EXTRACT(YEAR FROM created_at)::INT AS year_val
  FROM public.page_views
  ORDER BY year_val DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

REVOKE EXECUTE ON FUNCTION public.get_monthly_analytics(INT) FROM public;
GRANT EXECUTE ON FUNCTION public.get_monthly_analytics(INT) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.get_available_years() FROM public;
GRANT EXECUTE ON FUNCTION public.get_available_years() TO authenticated;`}
            </pre>
            <p className="text-[11px] text-amber-200/60 italic font-medium">
              *Catatan: Setelah menjalankan skrip di atas, silakan muat ulang halaman ini.
            </p>
          </div>
        ) : (
          <div className="relative w-full h-[220px] sm:h-[300px]">
            <svg 
              viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
              className="w-full h-full overflow-visible select-none"
            >
              <defs>
                {/* Views Gradient */}
                <linearGradient id="views-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a855f7" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#a855f7" stopOpacity="0.0" />
                </linearGradient>
                {/* Visitors Gradient */}
                <linearGradient id="visitors-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Gridlines */}
              {Array.from({ length: 5 }).map((_, i) => {
                const val = (maxVal / 4) * i
                const y = getY(val)
                return (
                  <g key={i} className="opacity-40 dark:opacity-20">
                    <line
                      x1={paddingLeft}
                      y1={y}
                      x2={svgWidth - paddingRight}
                      y2={y}
                      stroke="#94a3b8"
                      strokeWidth="1"
                      strokeDasharray="4,6"
                    />
                    <text
                      x={paddingLeft - 10}
                      y={y + 4}
                      textAnchor="end"
                      className="fill-muted-foreground text-[11px] font-bold"
                    >
                      {Math.round(val)}
                    </text>
                  </g>
                )
              })}

              {/* Areas */}
              <path d={viewsAreaPath} fill="url(#views-gradient)" />
              <path d={visitorsAreaPath} fill="url(#visitors-gradient)" />

              {/* Lines */}
              <path
                d={viewsLinePath}
                fill="none"
                stroke="#a855f7"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="drop-shadow-[0_2px_8px_rgba(168,85,247,0.3)]"
              />
              <path
                d={visitorsLinePath}
                fill="none"
                stroke="#06b6d4"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="drop-shadow-[0_2px_8px_rgba(6,182,212,0.3)]"
              />

              {/* X Axis labels */}
              {chartData.map((d, i) => {
                const x = getX(i)
                return (
                  <text
                    key={i}
                    x={x}
                    y={svgHeight - paddingBottom + 22}
                    textAnchor="middle"
                    className="fill-muted-foreground text-[11px] font-bold"
                  >
                    {MONTH_NAMES[i]}
                  </text>
                )
              })}

              {/* Hover Crosshair and Markers */}
              {hoveredIndex !== null && chartData[hoveredIndex] && (
                <g>
                  {/* Vertical line crosshair */}
                  <line
                    x1={getX(hoveredIndex)}
                    y1={paddingTop}
                    x2={getX(hoveredIndex)}
                    y2={svgHeight - paddingBottom}
                    stroke="#94a3b8"
                    strokeWidth="1.5"
                    strokeDasharray="3,3"
                    className="opacity-70"
                  />

                  {/* Views Marker */}
                  <circle
                    cx={getX(hoveredIndex)}
                    cy={getY(chartData[hoveredIndex].views)}
                    r="6.5"
                    fill="#a855f7"
                    stroke="#ffffff"
                    strokeWidth="2.5"
                    className="shadow-sm"
                  />

                  {/* Visitors Marker */}
                  <circle
                    cx={getX(hoveredIndex)}
                    cy={getY(chartData[hoveredIndex].visitors)}
                    r="6.5"
                    fill="#06b6d4"
                    stroke="#ffffff"
                    strokeWidth="2.5"
                    className="shadow-sm"
                  />
                </g>
              )}

              {/* Hover Interaction Areas */}
              {chartData.map((_, i) => {
                const x = getX(i)
                const triggerWidth = chartWidth / 11
                return (
                  <rect
                    key={i}
                    x={x - triggerWidth / 2}
                    y={paddingTop}
                    width={triggerWidth}
                    height={chartHeight}
                    fill="transparent"
                    className="cursor-crosshair"
                    onMouseEnter={() => setHoveredIndex(i)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  />
                )
              })}
            </svg>

            {/* Custom Tooltip element overlay */}
            {hoveredIndex !== null && chartData[hoveredIndex] && (
              <div
                style={{
                  position: 'absolute',
                  left: `${((getX(hoveredIndex) - paddingLeft) / chartWidth) * 90 + 5}%`,
                  top: '10%',
                  transform: hoveredIndex > 8 ? 'translateX(-105%)' : hoveredIndex < 3 ? 'translateX(10%)' : 'translateX(-50%)',
                  pointerEvents: 'none',
                }}
                className="z-30 p-4 rounded-2xl glass-panel border border-slate-200/20 dark:border-slate-800/20 shadow-xl min-w-[140px] space-y-2 animate-fade-in text-xs"
              >
                <div className="font-extrabold text-foreground border-b border-white/10 pb-1 flex justify-between items-center">
                  <span>{MONTH_NAMES[hoveredIndex]} {selectedYear}</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between items-center gap-4">
                    <span className="text-purple-400 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                      Views:
                    </span>
                    <span className="font-black text-foreground">{chartData[hoveredIndex].views}</span>
                  </div>
                  <div className="flex justify-between items-center gap-4">
                    <span className="text-cyan-400 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      Visitors:
                    </span>
                    <span className="font-black text-foreground">{chartData[hoveredIndex].visitors}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
