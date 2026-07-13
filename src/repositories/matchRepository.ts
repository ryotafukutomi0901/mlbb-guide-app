import { COACH_REPORTS } from "@/data/coach";
import { MATCH_HISTORY, PLAYER_PROFILE } from "@/data/profile";
import type { CoachReport, MatchRecord, PlayerProfile } from "@/data/types";

export function getPlayerProfile(): PlayerProfile {
  return PLAYER_PROFILE;
}

export function getMatchHistory(): MatchRecord[] {
  return MATCH_HISTORY;
}

export function getMatchById(id: string): MatchRecord | undefined {
  return MATCH_HISTORY.find((m) => m.id === id);
}

export function getCoachReports(): CoachReport[] {
  return COACH_REPORTS;
}

export function getCoachReport(matchId: string): CoachReport | undefined {
  return COACH_REPORTS.find((r) => r.matchId === matchId);
}

export function getLatestCoachReport(): CoachReport {
  return COACH_REPORTS[0];
}
