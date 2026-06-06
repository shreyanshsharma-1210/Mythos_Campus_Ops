# Campus Ops — The Real Master Plan
## *"We didn't build features. We built the nervous system of a campus."*

---

# THE REAL PROBLEM NOBODY TALKS ABOUT

Every college in India has the same 4 invisible crises happening simultaneously:

**Crisis 1:** A student submits a hostel complaint. It goes into a WhatsApp group. The warden screenshots it. Maybe acts on it in 3 days. Maybe not. There is zero accountability, zero tracking, zero data. The student feels helpless. The warden feels overwhelmed. Nobody wins.

**Crisis 2:** A girl loses her ID card the night before her placement interview. She posts in 6 different WhatsApp groups. Gets 200 "sorry yaar" replies. Nobody has it. She misses her interview. The ID was found and kept at the security desk 2 hours after she lost it — nobody connected the dots.

**Crisis 3:** A fresher wants to know if he can install an AC in his hostel room. He asks his senior. Senior says yes. He spends ₹18,000. The warden says it's against hostel rules page 12, clause 3b. He never knew. Nobody told him. The rulebook PDF exists — nobody reads a 47-page PDF.

**Crisis 4:** The electricity in Block C trips every Monday at 9 PM for 6 weeks straight. Every week, a student files a new complaint. Every week a different electrician "fixes" it. Nobody ever looks at the pattern. It trips again next Monday.

**These are not tech problems. These are coordination failures.**
**Campus Ops is the coordination layer that was always missing.**

---

# WHAT WE ARE ACTUALLY BUILDING

Four deeply connected modules that share one brain (GPT-4.1-mini), one design language, one dashboard, and one data layer. Not four separate tools. One OS.

```
┌─────────────────────────────────────────────────────────────┐
│                      Campus Ops                               │
│              "The Campus Nervous System"                    │
│                                                             │
│   🧠 AI Brain: GPT-4.1-mini (one shared intelligence)      │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  GRIEVANCE   │  │ MAINTENANCE  │  │   POLICY     │  │ LOST & FOUND │  │
│  │   TRIAGE     │  │  PREDICTOR   │  │  NAVIGATOR   │  │   MATCHER    │  │
│  │              │  │              │  │              │  │              │  │
│  │ Turns chaos  │  │ Turns repeat │  │ Turns 47-pg  │  │ Turns lost   │  │
│  │ into tickets │  │ breakdowns   │  │ PDF into a   │  │ items into   │  │
│  │ with SLA     │  │ into patterns│  │ conversation │  │ reunions     │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                             │
│              All feeding one unified dashboard              │
└─────────────────────────────────────────────────────────────┘
```

---

# MODULE 1: GRIEVANCE TRIAGE SYSTEM
## *"From WhatsApp chaos to accountable tickets in 10 seconds"*

### The Real Pain Point
Right now a student complaint journey looks like this:
Student types in WhatsApp → warden maybe reads it → maybe forwards → maybe acts → student follows up awkwardly → nothing gets resolved → student gives up → resentment builds.

There is no ticket number. No SLA. No escalation. No data. No accountability.

### What We Build

**Screen 1: GrievanceSubmit.tsx**

The student opens the app and sees a clean dark form. Not a boring form — a form that feels like filing a support ticket at a startup, not a government office.

Fields:
- Title (short, punchy)
- Category — but NOT a dropdown. A horizontal scroll of icon cards: 🏠 Hostel, 📚 Academic, 🍽 Canteen, 💡 Electrical, 🚿 Plumbing, 🔒 Security, 🏥 Medical, ⚖ Administration
- Description — multiline, character count, placeholder text that says "Be specific. The more detail you give, the faster AI can route this."
- Urgency — NOT a boring 1-5. Five emoji states: 😐 Can wait → 😟 Annoying → 😠 Affecting studies → 😤 Urgent → 🚨 Emergency
- Photo — optional drag-and-drop or tap to upload. Instantly previews with a subtle CSS treatment (high contrast, slight desaturation — makes it look "analyzed")
- Anonymous toggle — student can choose to submit anonymously. Builds psychological safety.

On Submit — The AI Moment:
- The form smoothly locks (fields fade to 60% opacity)
- A pulsing neural-network animation appears (CSS + SVG, no library needed)
- Text cycles: "Reading complaint..." → "Identifying department..." → "Assessing urgency..." → "Routing ticket..."
- 1.5 seconds later: result card slides up from bottom

Result Card shows:
- Auto-generated ticket ID (GRV-2024-0847)
- AI-detected department with confidence ("Routed to: Hostel Warden — 94% confidence")
- Urgency level with color coding
- Sentiment indicator: a small face icon (frustrated / neutral / distressed)
- Expected resolution time: "Based on similar complaints: 2-3 days"
- "Track this complaint" button

GPT Call — system prompt:
```
You are a student grievance classification AI at an Indian college campus.
Given a student complaint, return ONLY this JSON, nothing else:
{
  "department": "hostel_warden|academic_office|canteen|electrical|plumbing|security|medical|administration",
  "urgency": 1-5,
  "sentiment": "frustrated|distressed|neutral|angry|urgent",
  "category_confidence": 0-100,
  "root_cause_guess": "one sentence guess at underlying cause",
  "suggested_resolution": "one sentence suggested fix",
  "estimated_days": 1-7,
  "escalate_immediately": true|false,
  "summary": "one sentence plain English summary of complaint"
}
```

**Screen 2: GrievanceDashboard.tsx (Admin/Warden View)**

This is the screen that makes wardens actually want to use the system.

Layout: Split view
- Left 65%: Kanban board — New / Assigned / In Progress / Resolved / Escalated
- Right 35%: Live analytics panel

Each Kanban Card contains:
- Ticket ID + timestamp
- AI-generated one-line summary (not the raw complaint — the clean summary)
- Department tag with color coding
- Urgency bar (fills left to right, color shifts green→yellow→orange→red)
- Sentiment emoji
- SLA countdown timer (ticking live — if it goes red, card border pulses red)
- One-click assign to staff dropdown
- "View Full" expander

The analytics panel on the right shows live (mock data updating with setInterval):
- Today's complaint volume vs yesterday (trend arrow)
- Recharts donut chart: complaints by category
- Top 3 most complained-about issues this week
- Average resolution time this month
- Escalation rate percentage

The flashy moment: When a new complaint comes in (simulated every 30 seconds in demo), a notification dot appears on the dashboard tab, the new card slides into the kanban column with a smooth animation, and a subtle sound ping plays.

---

# MODULE 2: MAINTENANCE PREDICTOR
## *"Stop fixing the same broken thing every week"*

### The Real Pain Point
Block C electricity trips every Monday. Nobody notices because each complaint is filed separately by a different student. The maintenance log is a WhatsApp chat. There is no pattern recognition. There is no prediction.

The real insight: **Most maintenance failures are predictable. They repeat. Campus maintenance is reactive. We make it proactive.**

### What We Build

**Screen 1: MaintenanceReport.tsx**

Clean report form with one killer feature nobody else will have: **AI photo damage analysis**.

Fields:
- Location picker — a simplified SVG floor plan of a generic hostel block. Student taps their room. It highlights. No typing required.
- Issue category — icon grid: 💡 Electrical, 🚿 Plumbing, 🪑 Furniture, 🧱 Civil, ❄️ AC/Fan, 🚪 Door/Lock, 📶 WiFi, 🧹 Cleanliness
- Description — optional (many students won't type if they can tap)
- Photo upload — this is the star feature

Photo Upload Flow:
1. Student uploads/takes photo
2. Instantly apply CSS filters to make it look "AI processed": `filter: contrast(1.4) saturate(0.3) brightness(1.1)`
3. Overlay a scanning animation (horizontal line sweeping top to bottom, CSS keyframe)
4. Show "Analyzing damage..." for 1 second
5. GPT analyzes the description + filename/context
6. Severity meter animates from 0 to result (e.g. fills to 3/5 with orange color)
7. Show: Severity score, Category confirmed, Estimated repair time, Priority level

GPT Call:
```
You are a campus maintenance severity AI.
Given an issue description and location, return ONLY this JSON:
{
  "severity": 1-5,
  "category": "electrical|plumbing|furniture|civil|hvac|door|wifi|cleanliness",
  "priority": "critical|high|medium|low",
  "estimated_repair_hours": number,
  "requires_external_vendor": true|false,
  "safety_risk": true|false,
  "similar_issues_note": "one sentence about whether this is likely a recurring pattern",
  "recommended_action": "one sentence action for maintenance staff"
}
```

**Screen 2: MaintenanceDashboard.tsx — THE PATTERN DETECTOR**

This is the screen that solves the real problem — the one nobody else will build.

Layout: Three panels

**Panel 1 — Priority Queue (left, 40%)**
- Sorted by AI severity score (not by submission time — this is the key innovation)
- Each item shows: location, category icon, severity bar, safety risk badge (red if true), "Assign" button
- Filter: All / Critical / Requires Vendor / Safety Risk
- One-click status toggle: Pending → Assigned → Fixed

**Panel 2 — The Pattern Heatmap (center, 35%)**
- D3.js rendered grid of hostel blocks (8x4 grid of rectangles)
- Color intensity = complaint frequency (white → light purple → deep purple → red)
- Hover on a block: tooltip shows "Block C: 7 electrical complaints in 30 days"
- This is the visual that wins the hackathon. Judges will lean forward.
- Below it: small time-series line chart (Recharts) showing complaints per week per category
- The "prediction" label: if a block has 3+ same-category complaints in 14 days, it gets a ⚠️ "Pattern Detected" badge

**Panel 3 — Staff Board (right, 25%)**
- Staff cards with current workload (mock: 3 staff members)
- Each staff card: name, current tasks, availability status
- Auto-suggest assignment based on workload (frontend logic, no AI needed)

The demo moment: Show the heatmap. Block C is glowing red. Say "The AI detected 7 electrical complaints in Block C over 30 days. It flagged this as a systemic issue, not individual incidents. Maintenance is now scheduled proactively for Friday."

---

# MODULE 3: POLICY NAVIGATOR
## *"Every answer, straight from the rulebook, no bullshit"*

### The Real Pain Point
The college has a 47-page student handbook, a 23-page hostel rules document, a fee structure PDF, an exam policy document, and a disciplinary procedure guide. Nobody reads any of them. Students ask seniors who give wrong information. Students get penalized for rules they didn't know existed. This is genuinely unfair.

The solution is not a search bar. Search bars return pages, not answers.
**The solution is a conversation.**

### What We Build

**PolicyNavigator.tsx — Full Screen Chat Interface**

This screen should feel like talking to the smartest, most honest college admin in the world. One who actually read every document and will only tell you what's written.

Layout:
- Full screen dark chat interface
- Top bar: "Policy Navigator" + currently loaded document name + green "Document Loaded" badge
- Middle: conversation thread
- Bottom: input bar + voice button + suggested questions

Document Loading Flow:
1. First time user opens this screen: a centered card says "Upload a policy document to get started" with a drag-and-drop zone and a file picker
2. User uploads PDF
3. pdf.js reads it client-side, extracts raw text
4. Show: "Reading document... 47 pages extracted. Ready." with a page-flip animation
5. Document name appears in top bar badge
6. Suggested starter questions appear as chips: "What are hostel checkout timings?" / "What is the fine for late fee payment?" / "Can I have guests overnight?"

The Chat Experience:
- User message: right-aligned, dark bubble, white text
- AI message: left-aligned, slightly lighter background, with a small robot icon
- Every AI response has three sub-elements:
  1. The answer itself (clear, plain English)
  2. A SOURCE badge: 📄 Hostel Handbook — Section 4.2 (highlighted in amber)
  3. A CONFIDENCE bar (thin colored line under the response — green = high confidence)
- If the question is not in the document: the response says "This is not covered in the provided document" with a grey styling — distinct from a real answer
- "Was this helpful?" thumbs up/down under each response (stored in localStorage)

Voice Input:
- Mic button in input bar
- On click: button pulses red, "Listening..." text appears
- Uses Web Speech API (navigator.webkitSpeechRecognition)
- Transcribed text fills the input box automatically
- Student can review before sending

Suggested Questions (dynamic):
- After each answer, GPT returns 2 follow-up question suggestions
- They appear as clickable chips below the AI response
- This creates a natural exploration flow

GPT System Prompt:
```
You are a campus policy assistant. You have been given the following official document text.
Answer student questions ONLY using information from this document.
Be direct and clear. Students are asking because they genuinely don't know.
Format every response as JSON:
{
  "answer": "clear plain English answer",
  "source_section": "approximate section or page reference",
  "confidence": 0-100,
  "is_in_document": true|false,
  "follow_up_questions": ["question 1", "question 2"],
  "important_caveat": "any important warning or exception, or null"
}
[DOCUMENT TEXT BELOW]
{document_text}
```

The demo moment: Open the app, upload the hostel rules PDF, ask "Can I install an AC in my room?" — watch the AI pull the exact clause, cite page 12, show 96% confidence, and suggest the follow-up: "What is the process to apply for an AC exemption?"

---

# MODULE 4: LOST & FOUND MATCHER
## *"Every lost item has someone waiting for it"*

### The Real Pain Point
A lost item and its finder exist at the same time, in the same campus, but they never connect. The current system is posting in WhatsApp groups and hoping. The success rate is maybe 15%. The emotional cost of losing something important — an ID, a laptop, a wallet before an exam — is enormous.

The innovation: **AI that reads descriptions and photos and connects the dots automatically.**

### What We Build

**Screen 1: LostReport.tsx**

Not just a form. An intake experience.

Fields:
- Item type — large icon grid: 💳 ID Card, 💻 Laptop, 📱 Phone, 🔑 Keys, 👜 Bag, 👓 Glasses, 💰 Wallet, 📚 Books, ⌚ Watch, 🎧 Earphones, ➕ Other
- Item name + brand (text)
- Color (color picker — actual color swatches, not a text field)
- Description — "Describe anything unique about it: scratches, stickers, name written on it..."
- Last seen location — SVG campus map, tap to drop a pin
- Last seen time — time picker
- Photo upload — optional but prominently placed with text: "A photo increases match chances by 3x"
- Contact preference — notify via app / anonymous (only admin sees contact)

Photo Processing Visual:
When a photo is uploaded, run this visual sequence:
1. Original photo appears
2. CSS filter animation: photo briefly goes high-contrast black and white (edge detection aesthetic)
3. Colored highlight boxes appear over key areas (CSS overlays, positioned randomly but convincingly)
4. Text appears: "Extracting visual features..." → "Color profile analyzed" → "Shape detected" → "Ready"
5. Photo returns to normal with a subtle purple border = "AI indexed"
This is pure CSS/animation. No real OpenCV. Looks exactly like OpenCV.

**Screen 2: FoundReport.tsx**

Same flow as LostReport but with one addition:
- "Where did you find it?" — SVG campus map pin drop
- Condition: Good / Minor damage / Damaged
- "I have it with me" vs "I left it at Security Desk / Lost & Found Box"

**Screen 3: MatchFeed.tsx — THE MAIN SCREEN**

This is the emotional core of the entire module.

Layout: Feed of match cards

Each Match Card:
```
┌─────────────────────────────────────────────────────┐
│  MATCH FOUND                          87% MATCH     │
│  ─────────────────────────────────────────────────  │
│  LOST                    │  FOUND                   │
│  [photo or icon]         │  [photo or icon]         │
│  Blue wallet             │  Dark blue wallet        │
│  Near Library            │  Near Canteen            │
│  Yesterday 3 PM          │  Yesterday 6 PM          │
│  ─────────────────────────────────────────────────  │
│  AI says: "Both describe a blue wallet. Location    │
│  trajectory (library → canteen) is plausible.       │
│  High confidence match."                            │
│  ─────────────────────────────────────────────────  │
│  [  NOT MY ITEM  ]              [  CLAIM MATCH  ]   │
└─────────────────────────────────────────────────────┘
```

Confidence color coding:
- 85-100%: Green border, "HIGH CONFIDENCE" badge
- 60-84%: Amber border, "POSSIBLE MATCH" badge
- 40-59%: Grey border, "WEAK MATCH" badge

"Claim Match" flow:
1. Modal opens: "Confirm this is your item"
2. User confirms
3. System generates 6-digit OTP: "Your claim code: 847 291"
4. Instruction: "Show this code to the finder or security desk to collect your item"
5. Both parties notified (mock notification)
6. Item marked as "Pending Handover"

After handover confirmed: A small "Reunited ✓" celebration moment — confetti burst (CSS keyframe), card turns green, moves to "Resolved" section.

Karma Points (tie-in to existing Campus Ops RPG layer):
- Return an item: +50 XP, +10 Karma Points, "Good Samaritan" badge
- This is shown prominently to encourage returns
- Leaderboard of top item returners this month

GPT Match Call:
```
You are a lost and found matching AI on a college campus.
Given a lost item description and a found item description,
return ONLY this JSON:
{
  "match_score": 0-100,
  "match_reason": "one sentence explaining why these might be the same item",
  "key_matching_features": ["feature1", "feature2"],
  "confidence": "high|medium|low",
  "recommended_action": "claim|investigate_further|unlikely_match"
}
```

**Screen 4: HeatmapView.tsx**

D3.js SVG campus map showing where items are most commonly lost.

- Each zone is a colored region on the SVG
- Color intensity = items lost in that zone this month
- Click on a zone: sidebar panel slides in showing recent lost items in that zone
- Filter by item type: show only laptops lost, or only keys, etc.
- Time filter: last 7 days / 30 days / all time
- Insight callout box: "📍 Library Zone — Most items lost here (23 this month). Peak time: 6-9 PM"

---

# THE UNIFIED DASHBOARD
## *"Everything the campus needs, in one glance"*

This is the first screen in the video. It needs to make a judge's jaw drop in 10 seconds.

**Layout: Mission Control**

```
┌─────────────────────────────────────────────────────────────────┐
│  🏫 Campus Ops    [Grievance] [Maintenance] [Policy] [Lost+Found] │
├──────────┬──────────┬──────────┬──────────────────────────────  │
│  14      │  7       │  203     │  6                             │
│ Open     │ Critical │ Policy   │ Unmatched                      │
│ Grievance│ Repairs  │ Queries  │ Items                          │
│ ↑3 today │ ⚠ 2 urgent│ today   │ 2 matched today               │
├──────────┴──────────┴──────────┴──────────────────────────────  │
│                                                                  │
│  [GRIEVANCE KANBAN MINI]    [MAINTENANCE HEATMAP MINI]          │
│  Shows top 3 urgent cards   Shows hostel block colors           │
│                                                                  │
│  [RECENT MATCHES FEED]      [POLICY QUERIES TODAY]             │
│  Last 3 match cards         Last 3 questions asked             │
│                                                                  │
├──────────────────────────────────────────────────────────────── │
│  LIVE ACTIVITY FEED                                             │
│  🟢 2 min ago — Grievance GRV-0847 routed to Hostel Warden     │
│  🔵 5 min ago — Item match found: Blue wallet (87%)            │
│  🟡 8 min ago — Block C flagged: 7 electrical complaints       │
│  🟣 12 min ago — Policy query answered: AC rules               │
└──────────────────────────────────────────────────────────────── │
```

The live activity feed updates every 15 seconds with a new mock event (setInterval). Each new event slides in from the top with a smooth animation. This makes the demo feel alive even when nobody is interacting.

Stats cards have live sparkline charts (Recharts) showing the last 7 days trend.

The mini-heatmap in the dashboard is a real D3 component, same as the full page one, just scaled down.

---

# THE TECHNICAL ARCHITECTURE (Frontend Only)

```
src/
├── lib/
│   ├── openai.ts              ← single callGPT() function
│   ├── mockData.ts            ← all demo data, realistic and specific
│   ├── pdfExtract.ts          ← pdf.js wrapper, returns plain text
│   └── campusMap.ts           ← SVG campus map data + pin logic
│
├── components/
│   ├── AIBadge.tsx            ← confidence score badge (reused everywhere)
│   ├── AILoadingSequence.tsx  ← the neural network animation on processing
│   ├── HeatmapD3.tsx          ← reusable D3 heatmap, used in 2 modules
│   ├── KanbanBoard.tsx        ← reusable kanban, used in grievance
│   ├── CampusMapSVG.tsx       ← clickable SVG map, used in lost+found
│   ├── SeverityMeter.tsx      ← animated fill meter, used in maintenance
│   ├── MatchCard.tsx          ← the side-by-side match card component
│   ├── LiveFeed.tsx           ← the scrolling activity feed
│   └── ConfettiBurst.tsx      ← CSS confetti for item reunions
│
├── pages/
│   ├── Dashboard.tsx              ← mission control
│   ├── GrievanceSubmit.tsx        ← student complaint form
│   ├── GrievanceDashboard.tsx     ← admin kanban + analytics
│   ├── MaintenanceReport.tsx      ← student issue report
│   ├── MaintenanceDashboard.tsx   ← pattern detector + heatmap
│   ├── PolicyNavigator.tsx        ← PDF chat interface
│   ├── LostReport.tsx             ← lost item intake
│   ├── FoundReport.tsx            ← found item intake
│   ├── MatchFeed.tsx              ← AI match cards
│   └── HeatmapView.tsx            ← campus lost item map
│
└── .env.local
    └── VITE_OPENAI_API_KEY=sk-...
```

---

# THE MOCK DATA STRATEGY

Mock data must feel real. Not "Item 1, Item 2". Real names, real locations, real descriptions.

```typescript
// src/lib/mockData.ts

export const mockGrievances = [
  {
    id: "GRV-2024-0847",
    title: "Hot water not working in Block C bathrooms",
    department: "hostel_warden",
    urgency: 4,
    sentiment: "frustrated",
    summary: "Geysers in Block C have been non-functional for 5 days",
    submittedAt: "2024-01-15T07:23:00",
    status: "in_progress",
    slaDeadline: "2024-01-17T07:23:00",
    aiConfidence: 94,
    anonymous: false,
    studentBlock: "C",
    rootCause: "Likely main geyser circuit failure affecting entire block"
  },
  // ... 12 more realistic entries
];

export const mockMaintenanceIssues = [
  {
    id: "MNT-2024-0234",
    location: { block: "C", floor: 2, room: "C-214" },
    category: "electrical",
    severity: 4,
    description: "MCB trips every night around 9 PM. Has happened 6 times this month.",
    reportedAt: "2024-01-15T21:05:00",
    priority: "high",
    patternDetected: true,
    patternNote: "7 electrical complaints from Block C in 30 days",
    safetyRisk: true,
    status: "pending"
  },
  // ... 15 more with pattern data
];

export const mockLostItems = [
  {
    id: "LST-2024-1103",
    type: "wallet",
    description: "Black leather bifold wallet, SBI ATM card inside, small Spiderman sticker on back",
    color: "#1a1a1a",
    lastSeenLocation: { zone: "library", coordinates: { x: 340, y: 210 } },
    lastSeenTime: "2024-01-15T18:30:00",
    reportedAt: "2024-01-15T19:45:00",
    hasPhoto: true,
    status: "unmatched",
    urgency: "high",
    note: "Had my exam hall ticket inside. Exam tomorrow morning."
  },
  // ... 10 more with emotional detail
];
```

The emotional detail in mock data matters. "Had my exam hall ticket inside. Exam tomorrow morning." — when judges read this in the demo, they feel it.

---

# DESIGN SYSTEM

Every screen follows these exact rules. No exceptions.

**Colors:**
```
Background:     #0F0F1A  (deeper than the existing #1E1E2E — more dramatic)
Surface:        #1A1A2E
Surface Raised: #16213E
Accent Purple:  #6C63FF
Accent Blue:    #0F3460
Success Green:  #00D4AA
Warning Amber:  #FFB347
Danger Red:     #FF4757
Text Primary:   #FFFFFF
Text Secondary: #A0A0B8
Border:         #2A2A4A
```

**Motion principles:**
- Every data reveal: slide up + fade in, 300ms, ease-out
- Every AI processing state: pulsing glow on the element being analyzed
- Every state change (kanban move, status toggle): 200ms smooth transition
- Confetti on positive outcomes (item found, complaint resolved)
- Numbers always count up when they appear (from 0 to value, 800ms)

**Typography:**
- Use the existing Inter/system font
- Stats: 48px bold, white
- Labels: 12px uppercase, letter-spacing: 0.1em, secondary color
- Body: 14px, secondary color
- Headings: 20-24px semibold, white

**Component patterns:**
- Every card has a left colored border (4px) indicating status/priority
- Every AI-generated piece of content has a subtle ✦ AI icon prefix
- Every confidence score is shown as a thin colored progress bar, not just a number
- Loading states always show what the AI is "doing" — never a generic spinner

---

# THE VIDEO SCRIPT (Shot by Shot)

**0:00 – 0:12 | THE PROBLEM**
Black screen. Text appears one line at a time, typewriter effect:
```
"A student lost her ID card the night before placement."
"Her complaint sat unread in a WhatsApp group."
"The answer was in the rulebook nobody reads."
"The broken AC had been reported 7 times that month."
```
Last line: "We built the fix."
Campus Ops logo appears. Music hits.

**0:12 – 0:22 | MISSION CONTROL**
Screen recording: Dashboard opens. The live activity feed is scrolling. Stats cards are counting up. The mini-heatmap Block C is glowing red.
Voiceover: "One dashboard. Every campus problem. In real time."

**0:22 – 0:45 | POLICY NAVIGATOR**
Student: "Can I install an AC in my room?"
Watch the response appear: answer, source citation (Hostel Handbook — Section 4.2), confidence bar fills green to 96%.
Voiceover: "Upload any policy document. Ask anything. Get answers with citations — only from what's actually written."

**0:45 – 1:05 | LOST & FOUND**
Upload a wallet photo. The edge-detection animation plays. Cut to the MatchFeed — a card is already there. 87% match badge glows green. Click "Claim Match". OTP appears. Confetti.
Voiceover: "AI reads both descriptions. Finds the match. Reunites them in minutes, not days."

**1:05 – 1:22 | GRIEVANCE TRIAGE**
Student submits a complaint. Neural network animation. Result card slides up: "Routed to Hostel Warden. Urgency 4/5. SLA: 48 hours."
Cut to admin dashboard. The card appears in the kanban. SLA timer is ticking.
Voiceover: "Not a WhatsApp message. A tracked ticket. With accountability."

**1:22 – 1:40 | MAINTENANCE PATTERN DETECTOR**
Issue submitted. Severity meter fills to 4/5. Cut to the heatmap — Block C is red.
Zoom into the pattern badge: "⚠ 7 electrical complaints in 30 days."
Voiceover: "Not just filing complaints. Detecting patterns before they become crises."

**1:40 – 1:52 | ARCHITECTURE**
Clean diagram: 4 modules → GPT-4.1-mini → one unified dashboard.
Tech stack listed simply: React + TypeScript + D3.js + GPT-4.1-mini.
"100% frontend. Zero backend. Deployable in one click."

**1:52 – 2:00 | CLOSE**
Return to dashboard. Live feed still scrolling.
Text fades in: *"Campus Ops. Not a feature. The nervous system."*
Team name. Fade to black.

---

# BUILD ORDER (Optimized for Demo Quality)

```
Day 1 — Morning (3 hours)
├── src/lib/openai.ts                    [30 min]
├── src/lib/mockData.ts (full dataset)   [45 min]
├── src/components/AIBadge.tsx           [20 min]
├── src/components/AILoadingSequence.tsx [25 min]
└── PolicyNavigator.tsx (full)          [60 min]
    → First demo-able screen. Practice the PDF demo flow.

Day 1 — Afternoon (4 hours)
├── LostReport.tsx                       [45 min]
├── FoundReport.tsx                      [30 min]
├── MatchCard.tsx component              [30 min]
├── MatchFeed.tsx                        [60 min]
└── ConfettiBurst.tsx + OTP flow         [30 min]
    → Second demo-able module. Most emotional.

Day 1 — Evening (3 hours)
├── Dashboard.tsx full redesign          [90 min]
├── LiveFeed.tsx component               [30 min]
└── Navigation + routing cleanup         [30 min]
    → The WOW opener screen is ready.

Day 2 — Morning (3 hours)
├── GrievanceSubmit.tsx                  [60 min]
├── KanbanBoard.tsx component            [45 min]
└── GrievanceDashboard.tsx              [60 min]

Day 2 — Afternoon (3 hours)
├── MaintenanceReport.tsx               [60 min]
├── HeatmapD3.tsx component             [45 min]
├── MaintenanceDashboard.tsx            [60 min]
└── SeverityMeter.tsx                   [15 min]

Day 2 — Evening (2 hours)
├── HeatmapView.tsx (campus lost map)   [60 min]
├── CampusMapSVG.tsx                    [30 min]
└── Polish: animations, transitions     [30 min]
    → Record video.
```

**Total: ~18 focused hours. Manageable for a team of 3.**

Task split:
- Person 1: All GPT integrations + openai.ts + system prompts
- Person 2: D3.js heatmaps + data visualization components
- Person 3: UI screens + forms + Tailwind styling

---

# THE WINNING ARGUMENT

When the judge asks "what makes this different from a basic CRUD app":

> "Every other team built a form that stores data. We built an intelligent triage layer.
> The AI doesn't just record complaints — it reads them, understands urgency, detects patterns across weeks, routes to the right person, and enforces accountability through SLA timers.
> The Policy Navigator doesn't just search a PDF — it reads it like a human and only tells you what's actually written, with citations.
> The Lost & Found doesn't just list items — it reads descriptions and connects the right people.
> The Maintenance module doesn't just log issues — it detects that Block C has had 7 electrical failures and flags it before it becomes a safety crisis.
> This isn't four features. This is one coordinated intelligence layer built on top of an existing campus.
> Any college can deploy this. Upload their documents, point it at their campus layout, and it works. That's not a prototype. That's a product."

---

*"The best demo is one where the judge forgets they're watching a demo."*
