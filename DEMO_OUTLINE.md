# Meshlens AI — Demo Video / GIF Outline

Use this checklist when recording your demo. Target: **60–90 seconds**.

---

## Step 1: Home → Dashboard (5–10 sec)

- Start at home page: https://meshlens-ai-api.vercel.app/
- Briefly show the intro (or skip past if it plays)
- Click **View Dashboard**

---

## Step 2: Dashboard overview (10–15 sec)

- Show the incident list (Config rollback, Memory leak, Network partition)
- Use **Severity** filter (e.g. High)
- Use **Status** filter (e.g. Open)
- Search for a service name
- Switch **View** to "Group by service" or "Correlated"

---

## Step 3: Incident detail + AI analysis (25–35 sec)

- Click an incident (e.g. "Config rollback failure")
- Scroll to show: affected services, dependency graph summary
- Click **Analyze with AI**
- Let the analysis load; show the root cause, recommendations, affected path
- Optionally: click **Export PDF** (brief show of download)

---

## Step 4: Service topology (10–15 sec)

- Go to **Service Map** (or Topology in nav)
- Show the dependency graph with nodes and failing edges
- If you have live Prometheus/Jaeger: show "Load live topology"

---

## Step 5: Timeline & SLO (5–10 sec)

- Open **Timeline**
- Show overlapping incidents on the timeline
- Open **SLO** and briefly show SLO vs actuals

---

## Step 6: Wrap-up (5 sec)

- Return to Dashboard or Home
- Optional: show **Settings** → TARS config, or **Import** → paste JSON

---

## Recording tips

- Use 1280×720 or 1920×1080
- Slow down when showing AI analysis loading
- Zoom in / fullscreen on key actions (Analyze with AI, Export PDF)
- Add a 1–2 line caption at the start: "Meshlens AI — incident debugger with AI root cause analysis"
