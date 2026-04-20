import { curriculumCatalog, teachingLogs } from "@/lib/mock-data";
import { CurriculumCatalog, TeachingLog } from "@/lib/types";

export type DevAccessRequest = {
  id: string;
  user_id: string | null;
  email: string;
  access_code: string;
  desired_role: "admin" | "teacher";
  status: "pending" | "approved" | "rejected";
  note?: string | null;
  created_at: string;
  updated_at?: string;
  approved_by?: string | null;
  approved_at?: string | null;
  rejected_by?: string | null;
  rejected_at?: string | null;
};

let catalogState: CurriculumCatalog = structuredClone(curriculumCatalog);
let logsState: TeachingLog[] = structuredClone(teachingLogs);
let accessRequestsState: DevAccessRequest[] = [];

export function getDevCatalog() {
  return structuredClone(catalogState);
}

export function setDevCatalog(nextCatalog: CurriculumCatalog) {
  catalogState = structuredClone(nextCatalog);
  return getDevCatalog();
}

export function getDevLogs() {
  return structuredClone(logsState);
}

export function addDevLog(log: TeachingLog) {
  logsState = [structuredClone(log), ...logsState];
  return structuredClone(log);
}

export function getDevAccessRequests(): DevAccessRequest[] {
  return structuredClone(accessRequestsState);
}

export function upsertDevAccessRequest(request: DevAccessRequest): DevAccessRequest {
  const nextRequest = structuredClone(request);
  const existingIndex = accessRequestsState.findIndex((item) => item.email.toLowerCase() === nextRequest.email.toLowerCase());

  if (existingIndex >= 0) {
    accessRequestsState = accessRequestsState.map((item, index) => (index === existingIndex ? nextRequest : item));
  } else {
    accessRequestsState = [nextRequest, ...accessRequestsState];
  }

  return structuredClone(nextRequest);
}

export function updateDevAccessRequest(requestId: string, updates: Partial<DevAccessRequest>): DevAccessRequest | null {
  let updatedRequest: DevAccessRequest | null = null;

  accessRequestsState = accessRequestsState.map((item) => {
    if (item.id !== requestId) {
      return item;
    }

    updatedRequest = { ...item, ...updates };
    return structuredClone(updatedRequest);
  });

  return updatedRequest ? structuredClone(updatedRequest) : null;
}
