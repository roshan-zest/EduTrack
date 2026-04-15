import { NextResponse } from "next/server";
import { activityTrend, alerts, methodologyDistribution, performanceInsights } from "@/lib/mock-data";

export function GET() {
  return NextResponse.json({
    success: true,
    data: {
      performanceInsights,
      methodologyDistribution,
      activityTrend,
      alerts
    }
  });
}
