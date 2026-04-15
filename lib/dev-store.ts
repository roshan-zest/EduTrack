import { curriculumCatalog, teachingLogs } from "@/lib/mock-data";
import { CurriculumCatalog, TeachingLog } from "@/lib/types";

let catalogState: CurriculumCatalog = structuredClone(curriculumCatalog);
let logsState: TeachingLog[] = structuredClone(teachingLogs);

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
