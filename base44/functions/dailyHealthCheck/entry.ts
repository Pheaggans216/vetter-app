import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const results = [];
  const errors = [];

  const check = async (name, fn) => {
    try {
      const start = Date.now();
      await fn(base44);
      results.push({ name, status: "ok", ms: Date.now() - start });
    } catch (e) {
      errors.push({ name, status: "error", message: e.message });
    }
  };

  await check("VettingRequests readable", async (b) => {
    await b.asServiceRole.entities.VettingRequest.list('-created_date', 1);
  });

  await check("VetterProfiles readable", async (b) => {
    await b.asServiceRole.entities.VetterProfile.list('-created_date', 1);
  });

  await check("Reports readable", async (b) => {
    await b.asServiceRole.entities.Report.list('-created_date', 1);
  });

  await check("Conversations readable", async (b) => {
    await b.asServiceRole.entities.Conversation.list('-created_date', 1);
  });

  await check("Payments readable", async (b) => {
    await b.asServiceRole.entities.Payment.list('-created_date', 1);
  });

  await check("Referrals readable", async (b) => {
    await b.asServiceRole.entities.Referral.list('-created_date', 1);
  });

  const allPassed = errors.length === 0;
  const summary = {
    timestamp: new Date().toISOString(),
    passed: results.length,
    failed: errors.length,
    status: allPassed ? "HEALTHY" : "DEGRADED",
    results,
    errors,
  };

  console.log(`[Health Check] ${summary.status} — ${summary.passed} passed, ${summary.failed} failed`);
  if (!allPassed) {
    console.error("[Health Check] Failures:", JSON.stringify(errors, null, 2));
  }

  return Response.json(summary, { status: allPassed ? 200 : 500 });
});