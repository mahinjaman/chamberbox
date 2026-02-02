import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useFilteredAnalytics } from "@/hooks/useFilteredAnalytics";
import { useProfile } from "@/hooks/useProfile";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";
import { FeatureGate } from "@/components/common/FeatureGate";
import { AnalyticsFilters } from "@/components/analytics/AnalyticsFilters";
import { AnalyticsExport } from "@/components/analytics/AnalyticsExport";
import { subDays } from "date-fns";
import { 
  Users, 
  TrendingUp, 
  Calendar,
  DollarSign,
  Activity,
  PieChart as PieChartIcon,
  BarChart3,
  UserPlus,
  Loader2
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
  "#8b5cf6",
  "#06b6d4",
  "#ec4899",
];

const TRANSACTION_CATEGORIES = [
  "consultation",
  "procedure",
  "lab_test",
  "medicine",
  "supplies",
  "rent",
  "utilities",
  "salary",
  "equipment",
  "other",
];

const Analytics = () => {
  const { profile } = useProfile();
  const { canUseAnalytics } = useFeatureAccess();
  const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [category, setCategory] = useState<string>("all");

  const { data, isLoading } = useFilteredAnalytics({
    startDate,
    endDate,
    category: category === "all" ? undefined : category,
  });

  const handleReset = () => {
    setStartDate(subDays(new Date(), 30));
    setEndDate(new Date());
    setCategory("all");
  };

  // Check if user has access to analytics
  if (!canUseAnalytics()) {
    return (
      <DashboardLayout
        title="Analytics & Insights"
        description="Track your practice performance and patient trends"
      >
        <FeatureGate feature="analytics">
          <div />
        </FeatureGate>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Analytics & Insights"
      description="Track your practice performance and patient trends"
    >
      {/* Filters and Export */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <AnalyticsFilters
            startDate={startDate}
            endDate={endDate}
            category={category}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            onCategoryChange={setCategory}
            onReset={handleReset}
            categories={TRANSACTION_CATEGORIES}
          />
          <AnalyticsExport
            data={data}
            startDate={startDate}
            endDate={endDate}
            category={category}
            doctorName={profile?.full_name}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Patients</p>
                    <p className="text-3xl font-bold text-foreground">{data.patientStats.total}</p>
                    <p className="text-sm text-muted-foreground mt-1">in your practice</p>
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
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                    <p className="text-3xl font-bold text-foreground">৳{data.totalRevenue.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground mt-1">in selected period</p>
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
                    <p className="text-sm text-muted-foreground">New Patients</p>
                    <p className="text-3xl font-bold text-foreground">{data.patientStats.newInRange}</p>
                    <p className="text-sm text-muted-foreground mt-1">in selected period</p>
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
                    <p className="text-sm text-muted-foreground">Total Visits</p>
                    <p className="text-3xl font-bold text-foreground">{data.totalVisits}</p>
                    <p className="text-sm text-muted-foreground mt-1">in selected period</p>
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
                      Patient Visits
                    </CardTitle>
                    <CardDescription>Daily patient visit trends for selected period</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {data.visitTrends.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data.visitTrends}>
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
                      <p>No visit data for selected period</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Revenue by Category */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5 text-success" />
                  Revenue by Category
                </CardTitle>
                <CardDescription>Income distribution by category</CardDescription>
              </CardHeader>
              <CardContent>
                {data.revenueByCategory.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={data.revenueByCategory}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="amount"
                          nameKey="category"
                        >
                          {data.revenueByCategory.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: number) => [`৳${value.toLocaleString()}`, "Amount"]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-wrap justify-center gap-3 mt-4">
                      {data.revenueByCategory.slice(0, 4).map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                          />
                          <span className="text-xs text-muted-foreground capitalize">
                            {item.category}: ৳{item.amount.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <PieChartIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No revenue data for selected period</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2 mb-8">
            {/* Revenue Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-success" />
                  Revenue Trend
                </CardTitle>
                <CardDescription>Daily revenue for selected period</CardDescription>
              </CardHeader>
              <CardContent>
                {data.visitTrends.length > 0 && data.visitTrends.some(v => v.revenue > 0) ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={data.visitTrends.length > 60 ? data.visitTrends.filter((_, i) => i % 3 === 0) : data.visitTrends}>
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
                      <p>No revenue data for selected period</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Category Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Category Breakdown
                </CardTitle>
                <CardDescription>Income vs Expense by category</CardDescription>
              </CardHeader>
              <CardContent>
                {data.categoryBreakdown.length > 0 ? (
                  <div className="space-y-3 max-h-[250px] overflow-y-auto">
                    {data.categoryBreakdown.map((item, index) => (
                      <div key={index} className="p-3 rounded-lg bg-muted/30 border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-foreground capitalize">{item.category}</span>
                          <Badge variant={item.income - item.expense >= 0 ? "default" : "destructive"}>
                            Net: ৳{(item.income - item.expense).toLocaleString()}
                          </Badge>
                        </div>
                        <div className="flex gap-4 text-sm">
                          <span className="text-success">Income: ৳{item.income.toLocaleString()}</span>
                          <span className="text-destructive">Expense: ৳{item.expense.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No transaction data for selected period</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Top Diagnoses */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Common Diagnoses
              </CardTitle>
              <CardDescription>Most frequently recorded diagnoses in selected period</CardDescription>
            </CardHeader>
            <CardContent>
              {data.topDiagnoses.length > 0 ? (
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {data.topDiagnoses.map((d, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border">
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
                <div className="h-[150px] flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No diagnosis data for selected period</p>
                    <p className="text-sm">Record visits with diagnoses to see trends</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </DashboardLayout>
  );
};

export default Analytics;
