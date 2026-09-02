import { NextResponse } from "next/server";

// In-memory / cache fallback for terminal and API ballot interactions
let inMemoryBallots: Array<{
  id: string;
  title: string;
  department: string;
  ward: string;
  description: string;
  yesVotes: number;
  noVotes: number;
  status: "Active Ballot" | "Approved" | "Rejected";
  daysLeft: number;
  budgetEstimate: string;
}> = [];

export async function GET() {
  return NextResponse.json({
    status: "success",
    count: inMemoryBallots.length,
    ballots: inMemoryBallots,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, department, ward, description, budgetEstimate, daysLeft } = body;

    if (!title || !description || !ward) {
      return NextResponse.json(
        { error: "Title, description, and ward/PIN code are required fields." },
        { status: 400 }
      );
    }

    const ballot = {
      id: `poll-${Date.now()}`,
      title: String(title),
      department: department || "General Infrastructure",
      ward: String(ward),
      description: String(description),
      yesVotes: 0,
      noVotes: 0,
      status: "Active Ballot" as const,
      daysLeft: Number(daysLeft) || 14,
      budgetEstimate: budgetEstimate || "₹ 45.0 Lakhs",
    };

    inMemoryBallots.unshift(ballot);

    return NextResponse.json(
      {
        message: "Consensus Ballot created successfully",
        ballot,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to process ballot creation request" },
      { status: 500 }
    );
  }
}
