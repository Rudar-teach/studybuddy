export interface User {
  id: string;
  email: string;
  name: string;
  password: string;
  avatar?: string;
  bio: string;
  subjects: string[];
  skills: Skill[];
  availability: AvailabilitySlot[];
  learningGoals: string[];
  year: string;
  major: string;
  createdAt: string;
  lastActiveAt?: string;
  blocklist?: string[];
}

export interface Skill {
  name: string;
  level: "beginner" | "intermediate" | "advanced" | "expert";
}

export interface AvailabilitySlot {
  day: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
  startTime: string;
  endTime: string;
}

export interface StudyGroup {
  id: string;
  name: string;
  description: string;
  subject: string;
  members: string[];
  creatorId: string;
  maxMembers: number;
  schedule: Schedule[];
  goals: string[];
  createdAt: string;
}

export interface Schedule {
  day: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
  time: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  creatorId: string;
  collaborators: string[];
  status: "open" | "in-progress" | "completed";
  createdAt: string;
}

export interface CollaborationRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  type: "study-group" | "project-partner";
  targetId: string;
  message: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  groupId: string;
  content: string;
  createdAt: string;
}

export type ChatMessage = Message;

// ===== Sessions / resources / check-ins / reports (features 5, 6, 7, 9) =====
export interface GroupSession {
  id: string;
  groupId: string;
  day: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
  time: string;
  topic: string;
  link: string;
  hostId: string;
  rsvps: string[];
  createdAt: string;
}

export interface GroupResource {
  id: string;
  groupId: string;
  title: string;
  url: string;
  type: "link" | "file" | "note";
  note?: string;
  addedBy: string;
  createdAt: string;
}

export interface GroupCheckin {
  id: string;
  groupId: string;
  userId: string;
  status: "done" | "in-progress" | "blocked";
  note: string;
  createdAt: string;
}

export interface UserReport {
  id: string;
  reporterId: string;
  reportedUserId: string;
  reason: string;
  details: string;
  createdAt: string;
}

export interface MatchScore {
  userId: string;
  score: number;
  reasons: string[];
}

export interface Notification {
  userId: string;
  score: number;
  reasons: string[];
}

export type UserRole = "student" | "mentor";
