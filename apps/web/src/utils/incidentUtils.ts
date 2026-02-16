import type { IncidentBundle } from "@meshlens/shared";

export const CORRELATION_WINDOW_MS = 30 * 60 * 1000; // 30 minutes

export function correlateIncidents(
  incidents: IncidentBundle[]
): IncidentBundle[][] {
  const sorted = [...incidents].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
  const groups: IncidentBundle[][] = [];
  const used = new Set<string>();

  for (const inc of sorted) {
    if (used.has(inc.id)) continue;
    const group: IncidentBundle[] = [inc];
    used.add(inc.id);
    const services = new Set(inc.affectedServices);
    const groupTimes: number[] = [new Date(inc.createdAt).getTime()];
    let changed = true;
    while (changed) {
      changed = false;
      for (const other of sorted) {
        if (used.has(other.id)) continue;
        const t1 = new Date(other.createdAt).getTime();
        const sharesService = other.affectedServices.some((s) =>
          services.has(s)
        );
        const withinWindow = groupTimes.some(
          (t) => Math.abs(t1 - t) <= CORRELATION_WINDOW_MS
        );
        if (sharesService && withinWindow) {
          group.push(other);
          used.add(other.id);
          other.affectedServices.forEach((s) => services.add(s));
          groupTimes.push(t1);
          changed = true;
        }
      }
    }
    groups.push(group);
  }
  return groups.filter((g) => g.length > 0);
}

export function groupByService(
  incidents: IncidentBundle[]
): Map<string, IncidentBundle[]> {
  const map = new Map<string, IncidentBundle[]>();
  for (const inc of incidents) {
    const services =
      inc.affectedServices.length > 0
        ? inc.affectedServices
        : ["(no services)"];
    for (const svc of services) {
      const list = map.get(svc) ?? [];
      if (!list.some((i) => i.id === inc.id)) list.push(inc);
      map.set(svc, list);
    }
  }
  return map;
}
