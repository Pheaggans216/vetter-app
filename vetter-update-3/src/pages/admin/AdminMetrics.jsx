import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from "recharts";
import { format, subDays, parseISO, startOfDay } from "date-fns";
import { categoryLabel } from "@/lib/vetterCategories";

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

      <InspectionInsights />

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
const PAID_STATUSES = ["payment_secured", "matching", "vetter_assigned", "in_progress", "report_ready", "completed"];

function InspectionInsights() {
  const { data: jobs = [] } = useQuery({ queryKey: ["admin-insights-jobs"], queryFn: () => base44.entities.VetterJob.list("-created_date", 1000) });
  const { data: reports = [] } = useQuery({ queryKey: ["admin-insights-reports"], queryFn: () => base44.entities.Report.list("-created_date", 1000) });

  const paidJobs = jobs.filter(j => PAID_STATUSES.includes(j.status) || j.payment_status === "held" || j.payment_status === "released");
  const grossBookings = paidJobs.reduce((s, j) => s + (j.total_price || 0), 0);
  const platformRevenue = paidJobs.reduce((s, j) => s + (j.platform_fee || 0), 0);
  const unpaidJobs = jobs.filter(j => j.status === "pending_payment").length;
  const refundsOwed = jobs.filter(j => j.status === "no_show" && j.refund_due > 0 && !j.refund_processed);
  const autoReleased = jobs.filter(j => j.auto_released).length;
  const escortRequests = jobs.filter(j => j.security_status === "requested");

  const verdicts = { buy: 0, negotiate: 0, pass: 0 };
  reports.forEach(r => { if (verdicts[r.recommendation] !== undefined) verdicts[r.recommendation]++; });
  const stolenFlags = reports.filter(r => r.stolen_check === "flagged").length;

  const priced = reports.filter(r => r.estimated_value && r.listed_price);
  const avgGap = priced.length
    ? Math.round(priced.reduce((s, r) => s + (r.listed_price - r.estimated_value) / r.listed_price, 0) / priced.length * 100)
    : null;

  const byCategory = {};
  reports.forEach(r => {
    const k = r.category || "other";
    byCategory[k] = byCategory[k] || { name: categoryLabel(k), inspections: 0, failed: 0 };
    byCategory[k].inspections++;
    if (r.recommendation === "pass") byCategory[k].failed++;
  });
  const categoryRows = Object.values(byCategory).sort((a, b) => b.inspections - a.inspections).slice(0, 8);

  const tiles = [
    { label: "Paid inspections", value: paidJobs.length },
    { label: "Gross bookings", value: `$${grossBookings.toLocaleString()}` },
    { label: "Vetter revenue (20%)", value: `$${platformRevenue.toLocaleString()}` },
    { label: "Started, not paid", value: unpaidJobs },
    { label: "Refunds owed (no-shows)", value: `$${refundsOwed.reduce((s, j) => s + j.refund_due, 0).toLocaleString()}` },
    { label: "Auto-released payouts", value: autoReleased },
    { label: "Reports filed", value: reports.length },
    { label: "Do-not-buy verdicts", value: verdicts.pass },
    { label: "Stolen-check flags", value: stolenFlags },
    { label: "Avg. listed above estimate", value: avgGap === null ? "—" : `${avgGap}%` },
  ];

  return (
    <div className="space-y-4">
      <p className="font-heading font-semibold text-foreground text-[15px]">Inspections & Revenue (all time)</p>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {tiles.map(t => (
          <div key={t.label} className="bg-card rounded-2xl border border-border/60 p-4">
            <p className="text-[11px] text-muted-foreground uppercase tracking-wide">{t.label}</p>
            <p className="text-[20px] font-heading font-bold text-foreground mt-1">{t.value}</p>
          </div>
        ))}
      </div>
      {escortRequests.length > 0 && <EscortRequests jobs={escortRequests} />}
      {refundsOwed.length > 0 && <RefundsOwed jobs={refundsOwed} />}
      <div className="bg-card rounded-2xl border border-border/60 p-5">
        <p className="font-heading font-semibold text-foreground text-[14px] mb-3">Inspections by category</p>
        {categoryRows.length === 0 ? (
          <p className="text-muted-foreground text-[13px]">No reports yet. Categories appear here as Vetters file reports.</p>
        ) : (
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-muted-foreground text-left">
                <th className="font-medium pb-2">Category</th>
                <th className="font-medium pb-2 text-right">Inspections</th>
                <th className="font-medium pb-2 text-right">Do not buy</th>
              </tr>
            </thead>
            <tbody>
              {categoryRows.map(r => (
                <tr key={r.name} className="border-t border-border/40">
                  <td className="py-2 text-foreground">{r.name}</td>
                  <td className="py-2 text-right tabular-nums">{r.inspections}</td>
                  <td className="py-2 text-right tabular-nums">{r.failed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function RefundsOwed({ jobs }) {
  const queryClient = useQueryClient();
  const markDone = useMutation({
    mutationFn: (id) => base44.entities.VetterJob.update(id, { refund_processed: true, payment_status: "partially_refunded" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-insights-jobs"] }),
  });
  return (
    <div className="bg-card rounded-2xl border border-amber-300 p-5">
      <p className="font-heading font-semibold text-foreground text-[14px]">Refunds to send</p>
      <p className="text-[12px] text-muted-foreground mb-3">Send each refund in your payment dashboard (Base44 Payments / Wix), then mark it done here.</p>
      <div className="space-y-2">
        {jobs.map(j => (
          <div key={j.id} className="flex items-center gap-3 text-[13px] border-t border-border/40 pt-2">
            <div className="flex-1 min-w-0">
              <p className="text-foreground truncate">{j.buyer_email}</p>
              <p className="text-[11px] text-muted-foreground">
                {j.no_show_reason === "item_not_there" ? "Item wasn't there" : "Seller didn't show"} · paid ${j.total_price} · trip fee ${j.trip_fee}
              </p>
            </div>
            <p className="font-semibold tabular-nums">${j.refund_due}</p>
            <button onClick={() => markDone.mutate(j.id)} disabled={markDone.isPending}
              className="text-[12px] px-3 py-1.5 rounded-lg border border-border hover:bg-muted">Mark refunded</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function EscortRequests({ jobs }) {
  const queryClient = useQueryClient();
  const setStatus = useMutation({
    mutationFn: ({ id, status }) => base44.entities.VetterJob.update(id, { security_status: status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-insights-jobs"] }),
  });
  return (
    <div className="bg-card rounded-2xl border border-primary/30 p-5">
      <p className="font-heading font-semibold text-foreground text-[14px]">Security escort requests</p>
      <p className="text-[12px] text-muted-foreground mb-3">Book through your licensed security partner, quote the buyer, then mark confirmed. Decline if no one is available.</p>
      <div className="space-y-2">
        {jobs.map(j => (
          <div key={j.id} className="flex items-center gap-3 text-[13px] border-t border-border/40 pt-2">
            <div className="flex-1 min-w-0">
              <p className="text-foreground truncate">{j.buyer_email}</p>
              <p className="text-[11px] text-muted-foreground">
                {[j.location_city, j.location_state].filter(Boolean).join(", ") || "Location not set"} · {j.tier} · ${j.total_price}
                {j.created_date ? ` · requested ${format(parseISO(j.created_date), "MMM d")}` : ""}
              </p>
            </div>
            <button onClick={() => setStatus.mutate({ id: j.id, status: "confirmed" })} disabled={setStatus.isPending}
              className="text-[12px] px-3 py-1.5 rounded-lg bg-primary text-primary-foreground">Confirm</button>
            <button onClick={() => setStatus.mutate({ id: j.id, status: "declined" })} disabled={setStatus.isPending}
              className="text-[12px] px-3 py-1.5 rounded-lg border border-border hover:bg-muted">Decline</button>
          </div>
        ))}
      </div>
    </div>
  );
}
