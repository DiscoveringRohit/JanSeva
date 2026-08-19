"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/context/app-context";
import { AiReportWizard } from "@/components/report/ai-report-wizard";
import { ShieldAlert } from "lucide-react";

export default function ReportPage() {
  const { user } = useApp();

  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  return (
    <div className="py-2">
      <AiReportWizard />
    </div>
  );
}
