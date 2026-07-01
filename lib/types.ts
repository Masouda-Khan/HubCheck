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
}

export interface LocationWithData extends Location {
  score: number | null;
  latestRating: number | null;
  averageRating: number | null;
  inspectionCount: number;
  latestInspection: Inspection | null;
  leaders: Assignment[];
  members: Assignment[];
}
