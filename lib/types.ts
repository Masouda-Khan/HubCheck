export interface Location {
  id: string;
  name: string;
  isActive: boolean;
}

export interface Student {
  id: string;
  name: string;
  isActive: boolean;
}

export interface Assignment {
  locationId: string;
  studentId: string;
  isLeader: boolean;
  studentName: string;
}

export interface Inspection {
  id: string;
  locationId: string;
  rating: number; // 1–5
  notes?: string;
  date: string; // YYYY-MM-DD
  inspectorName: string;
  photoUrls?: string[];
}

export interface Flag {
  id: string;
  locationId: string;
  reason: string;
  priority: "low" | "high" | "safety";
  flaggedBy: string;
  createdAt: string;
  resolved: boolean;
  volunteers: string[];
}

export interface Shoutout {
  id: string;
  locationId: string;
  message: string;
  givenBy: string;
  createdAt: string;
}

export interface ChecklistRun {
  id: string;
  locationId: string;
  date: string;
  completedBy: string;
  checkedItems: string[];
  totalItems: number;
}

export interface LocationWithData extends Location {
  latestRating: number | null;
  averageRating: number | null;
  inspectionCount: number;
  streak: number;
  latestInspection: Inspection | null;
  leaders: Assignment[];
  members: Assignment[];
}
