import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAnalytics } from "@/hooks/useAnalytics";
import { 
  Users, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  DollarSign,
  Activity,
  PieChart as PieChartIcon,
  BarChart3,
  UserPlus,
  Repeat
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from "recharts";

const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--success))",
  "hsl(var(--warning))",
  "hsl(var(--accent))",
  "hsl(var(--destructive))",
];

const Analytics = () => {
  const { patientStats, visitTrends, revenueStats, topDiagnoses, retentionStats } = useAnalytics();

  const patientGrowth = patientStats.lastMonth > 0
    ? ((patientStats.thisMonth - patientStats.lastMonth) / patientStats.lastMonth * 100).toFixed(0)
    : 0;

  const revenueGrowth = revenueStats.lastMonth > 0
    ? ((revenueStats.thisMonth - revenueStats.lastMonth) / revenueStats.lastMonth * 100).toFixed(0)
    : 0;

  const retentionData = [
    { name: "New Patients", value: retentionStats.newPatients, color: CHART_COLORS[0] },
    { name: "Returning", value: retentionStats.returning, color: CHART_COLORS[1] },
  ];

  return (
    <DashboardLayout
      title="Analytics & Insights"
      description="Track your practice performance and patient trends"
    >
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Patients</p>
                <p className="text-3xl font-bold text-foreground">{patientStats.total}</p>
                <div className="flex items-center gap-1 mt-1">
                  {Number(patientGrowth) >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-success" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-destructive" />
                  )}
                  <span className={Number(patientGrowth) >= 0 ? "text-success text-sm" : "text-destructive text-sm"}>
                    {patientGrowth}% from last month
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                <p className="text-3xl font-bold text-foreground">৳{revenueStats.thisMonth.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-1">
                  {Number(revenueGrowth) >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-success" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-destructive" />
                  )}
                  <span className={Number(revenueGrowth) >= 0 ? "text-success text-sm" : "text-destructive text-sm"}>
                    {revenueGrowth}% from last month
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">New This Month</p>
                <p className="text-3xl font-bold text-foreground">{patientStats.thisMonth}</p>
                <p className="text-sm text-muted-foreground mt-1">patients registered</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                <UserPlus className="w-6 h-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Outstanding Dues</p>
                <p className="text-3xl font-bold text-foreground">৳{revenueStats.outstanding.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground mt-1">to collect</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 mb-8">
        {/* Visit Trends Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Patient Visits (Last 30 Days)
                </CardTitle>
                <CardDescription>Daily patient visit trends</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {visitTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={visitTrends}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="visits" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No visit data yet</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Patient Retention */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Repeat className="h-5 w-5 text-success" />
              Patient Retention
            </CardTitle>
            <CardDescription>New vs returning patients this month</CardDescription>
          </CardHeader>
          <CardContent>
            {(retentionStats.newPatients > 0 || retentionStats.returning > 0) ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={retentionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {retentionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-6 mt-4">
                  {retentionData.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm text-muted-foreground">
                        {item.name}: {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <PieChartIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No data yet</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-success" />
              Revenue Trend
            </CardTitle>
            <CardDescription>Daily revenue over the last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            {visitTrends.length > 0 && visitTrends.some(v => v.revenue > 0) ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={visitTrends.filter((_, i) => i % 3 === 0)}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `৳${value}`}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`৳${value.toLocaleString()}`, "Revenue"]}
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }}
                  />
                  <Bar 
                    dataKey="revenue" 
                    fill="hsl(var(--success))" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No revenue data yet</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Diagnoses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Common Diagnoses
            </CardTitle>
            <CardDescription>Most frequently recorded diagnoses</CardDescription>
          </CardHeader>
          <CardContent>
            {topDiagnoses.length > 0 ? (
              <div className="space-y-3">
                {topDiagnoses.map((d, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-2 h-8 rounded-full"
                        style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                      />
                      <span className="font-medium text-foreground">{d.name}</span>
                    </div>
                    <Badge variant="secondary">{d.count} cases</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No diagnosis data yet</p>
                  <p className="text-sm">Record visits with diagnoses to see trends</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
