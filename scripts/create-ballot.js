#!/usr/bin/env node

/**
 * CLI utility to create and query Consensus Ballots & Budget Initiatives directly in Django Backend Database
 * Usage: node scripts/create-ballot.js "Title" "Department" "Ward/PIN" "Description" "Budget" "Days"
 */

const title = process.argv[2] || "Solar Street Lighting & Automated Pumping Backup";
const department = process.argv[3] || "Electricity & Lighting";
const ward = process.argv[4] || "751024";
const description = process.argv[5] || "Install high-efficiency solar lighting grids along major ward collector corridors with battery storage.";
const budgetEstimate = process.argv[6] || "₹ 48.0 Lakhs";
const daysLeft = parseInt(process.argv[7], 10) || 14;

async function run() {
  console.log("🚀 Creating Consensus Ballot in Backend Database...");
  console.log(`- Title: ${title}`);
  console.log(`- Department: ${department}`);
  console.log(`- Ward/PIN: ${ward}`);
  console.log(`- Budget: ${budgetEstimate}`);

  const payload = {
    title,
    department,
    ward,
    description,
    budgetEstimate,
    daysLeft,
    status: "Active Ballot",
  };

  try {
    // 1. Post to Django backend database
    const backendRes = await fetch("http://127.0.0.1:8000/api/polls/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (backendRes.ok) {
      const data = await backendRes.json();
      console.log("✅ Ballot successfully created in Django Backend Database!");
      console.log(JSON.stringify(data, null, 2));
      return;
    }

    // 2. Fallback to Next.js route if Django is unreachable
    console.warn("⚠️ Django backend returned status", backendRes.status, "- Trying Next.js API route...");
    const res = await fetch("http://localhost:3000/api/ballots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error("❌ Failed to create ballot:", data);
      process.exit(1);
    }

    console.log("✅ Ballot created via Next.js API!");
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("❌ Connection error:", err.message);
    process.exit(1);
  }
}

run();

