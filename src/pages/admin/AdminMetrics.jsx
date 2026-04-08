import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from "recharts";
import { format, subDays, parseISO, startOfDay } from "date-fns";

const SERVICE_PRICES = { standard_verification: 39, specialist_vetting: 89, secure_exchange_presence: 149 };

function buildDailyData(requests, days = 14) {
  const map = {};
  for (let i = days - 1; i >= 0; i--) {
    const d = format(subDays(new Date(), i), "MMM d");
    map[d] = { date: d, requests: 0, revenue: 0 };
  }
  requests.forEach(r => {
    if (!r.created_date) return;
    const d = format(parseISO(r.created_date), "MMM d");
    if (map[d]) {
      map[d].requests += 1;
      if (r.status === "completed") map[d].revenue += SERVICE_PRICES[r.service_type] || 39;
    }
  });
  return Object.values(map);
}

function buildServiceBreakdown(requests) {
  const map = { standard_verification: 0, specialist_vetting: 0, secure_exchange_presence: 0 };
  requests.forEach(r => { if (r.service_type && map[r.service_type] !== undefined) map[r.service_type]++; });
  return [
    { name: "Standard", count: map.standard_verification },
    { name: "Specialist", count: map.specialist_vetting },
    { name: "Secure Exchange", count: map.secure_exchange_presence },
  ];
}

export default function AdminMetrics() {
  const { data: requests = [] } = useQuery({ queryKey: ["admin-metrics-requests"], queryFn: () => base44.entities.VettingRequest.list("-created_date", 500) });
  const { data: vetters = [] } = useQuery({ queryKey: ["admin-metrics-vetters"], queryFn: () => base44.entities.VetterProfile.list() });

  const daily = buildDailyData(requests);
  const serviceBreakdown = buildServiceBreakdown(requests);
  const completed = requests.filter(r => r.status === "completed");
  const conversionRate = requests.length > 0 ? ((completed.length / requests.length) * 100).toFixed(1) : "0";
  const avgOrderValue = completed.length > 0
    ? Math.round(completed.reduce((s, r) => s + (SERVICE_PRICES[r.service_type] || 39), 0) / completed.length)
    : 0;
  const buyerCounts = {};
  requests.forEach(r => { if (r.buyer_email) buyerCounts[r.buyer_email] = (buyerCounts[r.buyer_email] || 0) + 1; });
  const repeatBuyerRate = Object.keys(buyerCounts).length > 0
    ? ((Object.values(buyerCounts).filter(c => c > 1).length / Object.keys(buyerCounts).length) * 100).toFixed(1)
    : "0";

  const topVetters = vetters.filter(v => v.rating && v.total_inspections > 0).sort((a, b) => (b.rating * b.total_inspections) - (a.rating * a.total_inspections)).slice(0, 5);

  return (
    <div className="p-7 space-y-8">
      <div>
        <h1 className="text-[22px] font-heading font-bold text-foreground">Platform Metrics</h1>
        <p className="text-muted-foreground text-[13px] mt-0.5">14-day performance overview.</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Conversion Rate", value: `${conversionRate}%` },
          { label: "Avg Order Value", value: `$${avgOrderValue}` },
          { label: "Repeat Buyer Rate", value: `${repeatBuyerRate}%` },
          { label: "Total Buyers", value: Object.keys(buyerCounts).length },
        ].map(k => (
          <div key={k.label} className="p-5 bg-card rounded-2xl border border-border/60 shadow-sm">
            <p className="text-[26px] font-heading font-bold text-foreground">{k.value}</p>
            <p className="text-[12px] text-muted-foreground">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Daily requests chart */}
      <div className="bg-card rounded-2xl border border-border/60 shadow-sm p-5">
        <p className="font-heading font-semibold text-foreground text-[14px] mb-5">Daily Requests (last 14 days)</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={daily} barSize={20}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", fontSize: 12 }} />
            <Bar dataKey="requests" fill="hsl(var(--primary))" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Revenue chart */}
      <div className="bg-card rounded-2xl border border-border/60 shadow-sm p-5">
        <p className="font-heading font-semibold text-foreground text-[14px] mb-5">Daily Revenue from Completed Jobs</p>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={daily}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} tickFormatter={v => `$${v}`} />
            <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", fontSize: 12 }} formatter={v => [`$${v}`, "Revenue"]} />
            <Line type="monotone" dataKey="revenue" stroke="hsl(var(--accent))" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Service breakdown + top vetters */}
      <div className="grid sm:grid-cols-2 gap-6">
        <div className="bg-card rounded-2xl border border-border/60 shadow-sm p-5">
          <p className="font-heading font-semibold text-foreground text-[14px] mb-5">Service Type Breakdown</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={serviceBreakdown} layout="vertical" barSize={16}>
              <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} width={100} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", fontSize: 12 }} />
              <Bar dataKey="count" fill="hsl(var(--chart-2))" radius={[0,4,4,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-2xl border border-border/60 shadow-sm p-5">
          <p className="font-heading font-semibold text-foreground text-[14px] mb-4">Top Vetters</p>
          {topVetters.length === 0 ? (
            <p className="text-muted-foreground text-[13px]">No rated Vetters yet.</p>
          ) : (
            <div className="space-y-3">
              {topVetters.map((v, i) => (
                <div key={v.id} className="flex items-center gap-3">
                  <span className="text-[12px] font-bold text-muted-foreground w-4">{i + 1}</span>
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
                    {v.avatar_url ? <img src={v.avatar_url} alt="" className="w-full h-full object-cover" /> : <span className="text-primary font-bold text-xs">{v.display_name?.[0]}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-foreground truncate">{v.display_name}</p>
                    <p className="text-[11px] text-muted-foreground">{v.total_inspections} jobs · ⭐ {v.rating?.toFixed(1)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}