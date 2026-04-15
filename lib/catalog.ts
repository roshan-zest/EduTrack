import { curriculumCatalog } from "@/lib/mock-data";
import { CurriculumCatalog } from "@/lib/types";

export const CURRICULUM_STORAGE_KEY = "edutrack-curriculum-catalog";

export function getDefaultCatalog(): CurriculumCatalog {
  return curriculumCatalog;
}

export function readCatalogFromStorage(): CurriculumCatalog {
  if (typeof window === "undefined") {
    return getDefaultCatalog();
  }

  const storedCatalog = window.localStorage.getItem(CURRICULUM_STORAGE_KEY);
  if (!storedCatalog) {
    return getDefaultCatalog();
  }

  try {
    return JSON.parse(storedCatalog) as CurriculumCatalog;
  } catch {
    return getDefaultCatalog();
  }
}

export function writeCatalogToStorage(catalog: CurriculumCatalog) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(CURRICULUM_STORAGE_KEY, JSON.stringify(catalog));
}

export async function fetchCatalog(): Promise<{ data: CurriculumCatalog; source: string }> {
  try {
    const response = await fetch("/api/catalog", { cache: "no-store" });
    if (!response.ok) {
      throw new Error("Unable to load catalog");
    }

    const payload = (await response.json()) as { data: CurriculumCatalog; source: string };
    writeCatalogToStorage(payload.data);
    return payload;
  } catch {
    return {
      data: readCatalogFromStorage(),
      source: "local-cache"
    };
  }
}

export async function saveCatalog(catalog: CurriculumCatalog): Promise<{ data: CurriculumCatalog; source: string }> {
  try {
    const response = await fetch("/api/catalog", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(catalog)
    });

    if (!response.ok) {
      throw new Error("Unable to save catalog");
    }

    const payload = (await response.json()) as { data: CurriculumCatalog; source: string };
    writeCatalogToStorage(payload.data);
    return payload;
  } catch {
    writeCatalogToStorage(catalog);
    return {
      data: catalog,
      source: "local-cache"
    };
  }
}
