#!/usr/bin/env node

/**
 * CLI utility to create and query Consensus Ballots & Budget Initiatives
 * Usage: node scripts/create-ballot.js "Title" "Department" "Ward/PIN" "Description" "Budget" "Days"
 */

const title = process.argv[2] || "Solar Street Lighting & Automated Pumping Backup";
const department = process.argv[3] || "Electricity & Lighting";
const ward = process.argv[4] || "751024";
const description = process.argv[5] || "Install high-efficiency solar lighting grids along major ward collector corridors with battery storage.";
const budgetEstimate = process.argv[6] || "₹ 48.0 Lakhs";
const daysLeft = parseInt(process.argv[7], 10) || 14;

async function run() {
  console.log("🚀 Creating Consensus Ballot from Terminal...");
  console.log(`- Title: ${title}`);
  console.log(`- Department: ${department}`);
  console.log(`- Ward/PIN: ${ward}`);
  console.log(`- Budget: ${budgetEstimate}`);

  try {
    const res = await fetch("http://localhost:3000/api/ballots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        department,
        ward,
        description,
        budgetEstimate,
        daysLeft,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error("❌ Failed to create ballot:", data);
      process.exit(1);
    }

    console.log("✅ Ballot successfully published!");
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("❌ Connection error:", err.message);
    process.exit(1);
  }
}

run();
