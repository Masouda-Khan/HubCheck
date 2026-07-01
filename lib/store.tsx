"use client";

import { createContext, useContext, useState, useMemo, ReactNode } from "react";
import { INSPECTIONS, LOCATIONS, SAMPLE_FLAGS, CHECKLIST_TEMPLATES, computeLocationData } from "./mock-data";
import type { Inspection, Flag, Shoutout, LocationWithData } from "./types";

interface Store {
  locationData: LocationWithData[];
  inspections: Inspection[];
  addInspection: (insp: Inspection) => void;
  flags: Flag[];
  addFlag: (flag: Flag) => void;
  resolveFlag: (id: string) => void;
  volunteerForFlag: (flagId: string, name: string) => void;
  shoutouts: Shoutout[];
  addShoutout: (s: Shoutout) => void;
  checklistTemplates: Record<string, string[]>;
  setChecklistItems: (locationId: string, items: string[]) => void;
}

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [inspections, setInspections] = useState<Inspection[]>(INSPECTIONS);
  const [flags, setFlags] = useState<Flag[]>(SAMPLE_FLAGS);
  const [shoutouts, setShoutouts] = useState<Shoutout[]>([]);
  const [checklistTemplates, setChecklistTemplates] = useState<Record<string, string[]>>(CHECKLIST_TEMPLATES);

  const locationData = useMemo(
    () => LOCATIONS.map((loc) => computeLocationData(loc, inspections)),
    [inspections]
  );

  function addInspection(insp: Inspection) {
    setInspections((prev) => [insp, ...prev]);
  }

  function addFlag(flag: Flag) {
    setFlags((prev) => [flag, ...prev]);
  }

  function resolveFlag(id: string) {
    setFlags((prev) => prev.map((f) => (f.id === id ? { ...f, resolved: true } : f)));
  }

  function volunteerForFlag(flagId: string, name: string) {
    setFlags((prev) =>
      prev.map((f) =>
        f.id === flagId && !f.volunteers.includes(name)
          ? { ...f, volunteers: [...f.volunteers, name] }
          : f
      )
    );
  }

  function addShoutout(s: Shoutout) {
    setShoutouts((prev) => [s, ...prev]);
  }

  function setChecklistItems(locationId: string, items: string[]) {
    setChecklistTemplates((prev) => ({ ...prev, [locationId]: items }));
  }

  return (
    <StoreContext.Provider
      value={{
        locationData, inspections, addInspection,
        flags, addFlag, resolveFlag, volunteerForFlag,
        shoutouts, addShoutout,
        checklistTemplates, setChecklistItems,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be inside StoreProvider");
  return ctx;
}
