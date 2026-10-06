import type { User, MatchScore } from "@/types";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

export function calculateMatchScore(currentUser: User, candidate: User): MatchScore {
  const reasons: string[] = [];
  let score = 0;

  // 1. Subject overlap (30 points max)
  const sharedSubjects = currentUser.subjects.filter((s) => candidate.subjects.includes(s));
  const subjectScore = Math.min(30, sharedSubjects.length * 10);
  score += subjectScore;
  if (sharedSubjects.length > 0) {
    reasons.push(`Shared subjects: ${sharedSubjects.join(", ")}`);
  }

  // 2. Complementary skills (25 points max)
  const currentSkillNames = new Set(currentUser.skills.map((s) => s.name));
  const complementaryCount = candidate.skills.filter(
    (s) => !currentSkillNames.has(s.name)
  ).length;
  const skillScore = Math.min(25, complementaryCount * 5);
  score += skillScore;
  if (complementaryCount > 0) {
    const compSkills = candidate.skills
      .filter((s) => !currentSkillNames.has(s.name))
      .map((s) => s.name);
    reasons.push(`Complementary skills: ${compSkills.join(", ")}`);
  }

  // 3. Availability overlap (25 points max)
  const availabilityScore = calculateAvailabilityOverlap(
    currentUser.availability,
    candidate.availability
  );
  score += availabilityScore;
  if (availabilityScore > 0) {
    reasons.push("Schedule availability matches");
  }

  // 4. Learning goals alignment (20 points max)
  const sharedGoals = currentUser.learningGoals.filter((g) =>
    candidate.learningGoals.includes(g)
  );
  const goalScore = Math.min(20, sharedGoals.length * 7);
  score += goalScore;
  if (sharedGoals.length > 0) {
    reasons.push(`Aligned goals: ${sharedGoals.join(", ")}`);
  }

  return { userId: candidate.id, score: Math.min(100, score), reasons };
}

function calculateAvailabilityOverlap(
  a1: User["availability"],
  a2: User["availability"]
): number {
  if (a1.length === 0 || a2.length === 0) return 5;

  let overlapMinutes = 0;

  for (const slot1 of a1) {
    for (const slot2 of a2) {
      if (slot1.day === slot2.day) {
        const overlap = timeOverlapMinutes(slot1.startTime, slot1.endTime, slot2.startTime, slot2.endTime);
        overlapMinutes += overlap;
      }
    }
  }

  if (overlapMinutes >= 120) return 25;
  if (overlapMinutes >= 60) return 20;
  if (overlapMinutes >= 30) return 15;
  if (overlapMinutes > 0) return 10;
  return 5;
}

function timeOverlapMinutes(
  s1: string, e1: string, s2: string, e2: string
): number {
  const toMin = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };
  const start = Math.max(toMin(s1), toMin(s2));
  const end = Math.min(toMin(e1), toMin(e2));
  return Math.max(0, end - start);
}

export function getTopMatches(
  currentUser: User,
  allUsers: User[],
  limit = 10
): MatchScore[] {
  const others = allUsers.filter((u) => u.id !== currentUser.id);
  const scores = others
    .map((u) => calculateMatchScore(currentUser, u))
    .filter((s) => s.score > 20)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
  return scores;
}

export function getCompatibleStudyPartners(
  currentUser: User,
  allUsers: User[]
): { user: User; score: number; reasons: string[] }[] {
  const matches = getTopMatches(currentUser, allUsers);
  return matches.map((m) => {
    const user = allUsers.find((u) => u.id === m.userId)!;
    return { user, score: m.score, reasons: m.reasons };
  });
}
