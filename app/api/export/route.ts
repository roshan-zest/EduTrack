import { generateCSV, generateSummaryCSV } from "@/lib/export-utils";
import { getTeachingLogsData } from "@/lib/data-access";
import { requireAdminPage } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await requireAdminPage();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") ?? "logs"; // "logs" or "summary"
    const format = searchParams.get("format") ?? "csv"; // Only CSV for now

    if (format !== "csv") {
      return Response.json(
        { error: "Only CSV format is currently supported" },
        { status: 400 }
      );
    }

    if (!["logs", "summary"].includes(type)) {
      return Response.json(
        { error: "Invalid export type. Use 'logs' or 'summary'" },
        { status: 400 }
      );
    }

    const logResult = await getTeachingLogsData();
    const logs = logResult.data;

    let csvContent: string;
    let filename: string;

    if (type === "summary") {
      csvContent = generateSummaryCSV(logs);
      filename = `edutrack-summary-${new Date().toISOString().split("T")[0]}.csv`;
    } else {
      csvContent = generateCSV(logs);
      filename = `edutrack-logs-${new Date().toISOString().split("T")[0]}.csv`;
    }

    return new Response(csvContent, {
      headers: {
        "Content-Type": "text/csv;charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store, max-age=0"
      }
    });
  } catch (error) {
    console.error("Export error:", error);
    return Response.json(
      { error: "Failed to generate export" },
      { status: 500 }
    );
  }
}
