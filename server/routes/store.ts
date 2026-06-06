import { Router, Request, Response } from "express";

// ── In-memory server-side store ──────────────────────────────────────────────
// Lives for the lifetime of the server process. All tabs/users share this state.

interface StoreState {
  grievances: any[];
  maintenanceReports: any[];
  lostItems: any[];
  foundItems: any[];
  notifications: any[];
  seeded: boolean;
}

const store: StoreState = {
  grievances: [],
  maintenanceReports: [],
  lostItems: [],
  foundItems: [],
  notifications: [],
  seeded: false,
};

export function createStoreRouter() {
  const router = Router();

  // ── Seed endpoint (called once by the first client to initialise mock data) ──
  router.post("/seed", (req: Request, res: Response) => {
    if (store.seeded) {
      return res.json({ seeded: false, message: "Already seeded" });
    }
    const { grievances, maintenanceReports, lostItems, foundItems, notifications } = req.body;
    if (grievances)        store.grievances        = grievances;
    if (maintenanceReports) store.maintenanceReports = maintenanceReports;
    if (lostItems)         store.lostItems         = lostItems;
    if (foundItems)        store.foundItems        = foundItems;
    if (notifications)     store.notifications     = notifications;
    store.seeded = true;
    res.json({ seeded: true });
  });

  // ── Status / health ──────────────────────────────────────────────────────────
  router.get("/status", (_req: Request, res: Response) => {
    res.json({
      seeded: store.seeded,
      counts: {
        grievances: store.grievances.length,
        maintenanceReports: store.maintenanceReports.length,
        lostItems: store.lostItems.length,
        foundItems: store.foundItems.length,
        notifications: store.notifications.length,
      },
    });
  });

  // ── Grievances ────────────────────────────────────────────────────────────────
  router.get("/grievances", (_req: Request, res: Response) => {
    res.json(store.grievances);
  });

  router.post("/grievances", (req: Request, res: Response) => {
    const item = req.body;
    // Prepend so newest shows first
    store.grievances = [item, ...store.grievances.filter((g) => g.id !== item.id)];
    res.json(item);
  });

  router.patch("/grievances/:id", (req: Request, res: Response) => {
    const { id } = req.params;
    store.grievances = store.grievances.map((g) =>
      g.id === id ? { ...g, ...req.body } : g
    );
    res.json({ ok: true });
  });

  // ── Bulk upsert (for initial sync from client localStorage) ─────────────────
  router.post("/grievances/bulk", (req: Request, res: Response) => {
    const items: any[] = req.body;
    const existingIds = new Set(store.grievances.map((g) => g.id));
    const newItems = items.filter((i) => !existingIds.has(i.id));
    store.grievances = [...store.grievances, ...newItems];
    res.json({ added: newItems.length });
  });

  // ── Maintenance ───────────────────────────────────────────────────────────────
  router.get("/maintenance", (_req: Request, res: Response) => {
    res.json(store.maintenanceReports);
  });

  router.post("/maintenance", (req: Request, res: Response) => {
    const item = req.body;
    store.maintenanceReports = [item, ...store.maintenanceReports.filter((r) => r.id !== item.id)];
    res.json(item);
  });

  router.patch("/maintenance/:id", (req: Request, res: Response) => {
    const { id } = req.params;
    store.maintenanceReports = store.maintenanceReports.map((r) =>
      r.id === id ? { ...r, ...req.body } : r
    );
    res.json({ ok: true });
  });

  router.post("/maintenance/bulk", (req: Request, res: Response) => {
    const items: any[] = req.body;
    const existingIds = new Set(store.maintenanceReports.map((r) => r.id));
    const newItems = items.filter((i) => !existingIds.has(i.id));
    store.maintenanceReports = [...store.maintenanceReports, ...newItems];
    res.json({ added: newItems.length });
  });

  // ── Lost items ────────────────────────────────────────────────────────────────
  router.get("/lost-items", (_req: Request, res: Response) => {
    res.json(store.lostItems);
  });

  router.post("/lost-items", (req: Request, res: Response) => {
    const item = req.body;
    store.lostItems = [item, ...store.lostItems.filter((i) => i.id !== item.id)];
    res.json(item);
  });

  router.post("/lost-items/bulk", (req: Request, res: Response) => {
    const items: any[] = req.body;
    const existingIds = new Set(store.lostItems.map((i) => i.id));
    const newItems = items.filter((i) => !existingIds.has(i.id));
    store.lostItems = [...store.lostItems, ...newItems];
    res.json({ added: newItems.length });
  });

  // ── Found items ───────────────────────────────────────────────────────────────
  router.get("/found-items", (_req: Request, res: Response) => {
    res.json(store.foundItems);
  });

  router.post("/found-items", (req: Request, res: Response) => {
    const item = req.body;
    store.foundItems = [item, ...store.foundItems.filter((i) => i.id !== item.id)];
    res.json(item);
  });

  router.post("/found-items/bulk", (req: Request, res: Response) => {
    const items: any[] = req.body;
    const existingIds = new Set(store.foundItems.map((i) => i.id));
    const newItems = items.filter((i) => !existingIds.has(i.id));
    store.foundItems = [...store.foundItems, ...newItems];
    res.json({ added: newItems.length });
  });

  // ── Notifications ─────────────────────────────────────────────────────────────
  router.get("/notifications", (_req: Request, res: Response) => {
    res.json(store.notifications);
  });

  router.post("/notifications", (req: Request, res: Response) => {
    const item = req.body;
    store.notifications = [item, ...store.notifications.filter((n) => n.id !== item.id)];
    res.json(item);
  });

  return router;
}
