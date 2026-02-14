import { apiRequest } from "./query-client";
import { Lead, DailyStats, LeadStatus, Territory } from "./types";

export async function getLeads(): Promise<Lead[]> {
  const res = await apiRequest("GET", "/api/leads");
  return res.json();
}

export async function saveLead(lead: Omit<Lead, "id" | "createdAt" | "updatedAt">): Promise<Lead> {
  const res = await apiRequest("POST", "/api/leads", lead);
  return res.json();
}

export async function updateLead(id: string, updates: Partial<Lead>): Promise<Lead | null> {
  const res = await apiRequest("PUT", `/api/leads/${id}`, updates);
  return res.json();
}

export async function deleteLead(id: string): Promise<boolean> {
  await apiRequest("DELETE", `/api/leads/${id}`);
  return true;
}

export function computeTodayStats(leads: Lead[]): DailyStats {
  const today = new Date().toISOString().split("T")[0];
  const todayLeads = leads.filter((l) => {
    if (!l.knockedAt) return false;
    return l.knockedAt.startsWith(today);
  });

  return {
    date: today,
    doorsKnocked: todayLeads.length,
    contacts: todayLeads.filter((l) =>
      ["callback", "appointment", "sold", "follow_up", "not_interested"].includes(l.status)
    ).length,
    appointments: todayLeads.filter((l) => l.status === "appointment").length,
    sales: todayLeads.filter((l) => l.status === "sold").length,
    notHome: todayLeads.filter((l) => l.status === "not_home").length,
    notInterested: todayLeads.filter((l) => l.status === "not_interested").length,
    callbacks: todayLeads.filter((l) => l.status === "callback").length,
  };
}

export function computeWeekStats(leads: Lead[]): DailyStats {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const weekLeads = leads.filter((l) => {
    if (!l.knockedAt) return false;
    return new Date(l.knockedAt) >= weekAgo;
  });

  return {
    date: "week",
    doorsKnocked: weekLeads.length,
    contacts: weekLeads.filter((l) =>
      ["callback", "appointment", "sold", "follow_up", "not_interested"].includes(l.status)
    ).length,
    appointments: weekLeads.filter((l) => l.status === "appointment").length,
    sales: weekLeads.filter((l) => l.status === "sold").length,
    notHome: weekLeads.filter((l) => l.status === "not_home").length,
    notInterested: weekLeads.filter((l) => l.status === "not_interested").length,
    callbacks: weekLeads.filter((l) => l.status === "callback").length,
  };
}

export function getStatusCounts(leads: Lead[]): Record<LeadStatus, number> {
  const counts: Record<LeadStatus, number> = {
    untouched: 0,
    not_home: 0,
    not_interested: 0,
    callback: 0,
    appointment: 0,
    sold: 0,
    follow_up: 0,
  };
  leads.forEach((l) => {
    counts[l.status]++;
  });
  return counts;
}

export async function getTerritories(): Promise<Territory[]> {
  const res = await apiRequest("GET", "/api/territories");
  return res.json();
}

export async function saveTerritory(
  territory: Omit<Territory, "id" | "createdAt" | "updatedAt">
): Promise<Territory> {
  const res = await apiRequest("POST", "/api/territories", territory);
  return res.json();
}

export async function updateTerritory(
  id: string,
  updates: Partial<Territory>
): Promise<Territory | null> {
  const res = await apiRequest("PUT", `/api/territories/${id}`, updates);
  return res.json();
}

export async function deleteTerritory(id: string): Promise<boolean> {
  await apiRequest("DELETE", `/api/territories/${id}`);
  return true;
}
