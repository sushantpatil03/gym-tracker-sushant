# GymTracker — Product Specification
### A Personal Gym Guidance & Progressive Overload Tracker PWA

---

## 1. Project Overview

### What This App Is
A mobile-first Progressive Web App (PWA) that acts as a personal gym companion — replacing the need for a trainer by guiding users through their daily workout with embedded video demos, step-by-step form tips, warmup/cooldown routines, and optional weight tracking for progressive overload. Built for two users (Sush + Vishwajeet) with a shared workout split but individual tracking.

### The Core Problem It Solves
- You forget which day is which in your PPL split
- You don't know how to perform exercises correctly without a trainer
- You have no system to track if you're progressing (lifting heavier over time)
- Missed days break the routine — the app lets you reassign a missed day without guilt

### Primary Users
Two flatmates on the same Push/Pull/Legs split, going to gym together 5–6 days/week. Each user tracks their own weights independently.

---

## 2. Tech Stack

### Why PWA Over Native Android
- **Zero Play Store friction** — install directly from Chrome browser
- **Free to deploy** — static hosting on Vercel or Netlify (free tier, no server costs)
- **Works offline** — service workers cache exercises, videos, and your logged weights locally
- **Installable on Android** — shows "Add to Home Screen" prompt, behaves like a native app with its own icon
- **One codebase** — works on desktop too for admin panel management

### Stack Recommendation

| Layer | Technology | Reason |
|---|---|---|
| Frontend | React + Vite | Fast build, great PWA support, component-based |
| Styling | Tailwind CSS | Mobile-first utility classes, minimal bundle |
| State Management | Zustand | Lightweight, no boilerplate, persists to localStorage |
| Local Storage | IndexedDB (via Dexie.js) | Stores workout logs, weight history offline |
| Backend (Admin Panel) | Node.js + Express | Simple REST API for admin CRUD operations |
| Database | SQLite (via better-sqlite3) | Zero cost, file-based, perfect for small user count |
| Hosting (Frontend) | Vercel (free tier) | Auto-deploys from GitHub, CDN, free SSL |
| Hosting (Backend) | Railway.app (free tier) | Simple Node.js deployment, free hobby plan |
| LLM Integration | Anthropic Claude API (claude-sonnet) | Form tips, AI coaching nudges (see Section 8) |

### PWA Requirements (must implement)
- `manifest.json` with app name, icons, theme color
- Service Worker for offline caching of exercise data and videos list
- "Add to Home Screen" install prompt on first visit
- Splash screen + standalone display mode (no browser chrome)

---

## 3. App Architecture

```
gymtracker/
├── frontend/                   # React PWA
│   ├── public/
│   │   ├── manifest.json
│   │   └── sw.js               # Service worker
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.jsx        # Today's plan + weekly timeline
│   │   │   ├── WorkoutDay.jsx  # Exercise list for selected day
│   │   │   ├── Exercise.jsx    # Video + steps + weight logger
│   │   │   └── History.jsx     # Progressive overload charts
│   │   ├── components/
│   │   │   ├── WeekTimeline.jsx
│   │   │   ├── DayCard.jsx
│   │   │   ├── ExerciseCard.jsx
│   │   │   ├── VideoEmbed.jsx
│   │   │   ├── WeightLogger.jsx
│   │   │   └── WarmupBlock.jsx
│   │   ├── store/
│   │   │   ├── workoutStore.js  # Zustand — current week, day assignments
│   │   │   └── logStore.js      # Zustand + Dexie — weight history
│   │   └── lib/
│   │       ├── db.js            # Dexie IndexedDB setup
│   │       └── api.js           # Calls to backend (admin data sync)
│
├── backend/                    # Node + Express (admin panel API)
│   ├── routes/
│   │   ├── exercises.js        # CRUD for exercises
│   │   ├── videos.js           # CRUD for YouTube video assignments
│   │   └── auth.js             # Simple admin password auth
│   ├── db/
│   │   └── gymtracker.db       # SQLite file
│   └── index.js
```

---

## 4. Database Schema

### exercises
```sql
CREATE TABLE exercises (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL,
  muscle_group TEXT NOT NULL,       -- 'chest', 'back', 'legs', etc.
  day_type    TEXT NOT NULL,        -- 'push', 'pull', 'legs'
  is_warmup   BOOLEAN DEFAULT FALSE,
  is_cooldown BOOLEAN DEFAULT FALSE,
  default_sets INTEGER DEFAULT 3,
  default_reps TEXT DEFAULT '8-12', -- stored as string e.g. "8-12" or "12-15"
  form_tips   TEXT,                 -- JSON array of tip strings
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### exercise_videos
```sql
CREATE TABLE exercise_videos (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  exercise_id INTEGER REFERENCES exercises(id),
  youtube_url TEXT NOT NULL,        -- full YouTube URL or video ID
  title       TEXT,                 -- optional label for the video
  added_by    TEXT DEFAULT 'admin',
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### workout_logs (synced from frontend IndexedDB)
```sql
CREATE TABLE workout_logs (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_name   TEXT NOT NULL,        -- 'sush' or 'vishwajeet'
  exercise_id INTEGER REFERENCES exercises(id),
  log_date    DATE NOT NULL,
  set_number  INTEGER,
  weight_kg   REAL,
  reps_done   INTEGER,
  notes       TEXT,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### day_assignments (flex day switching)
```sql
CREATE TABLE day_assignments (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  week_start  DATE NOT NULL,        -- Monday of that week
  day_of_week TEXT NOT NULL,        -- 'mon', 'tue', etc.
  workout_type TEXT NOT NULL,       -- 'push', 'pull', 'legs', 'rest'
  modified    BOOLEAN DEFAULT FALSE -- true if user manually reassigned
);
```

---

## 5. Screen-by-Screen Specification

---

### Screen 1: Home (Today's Dashboard)

**URL:** `/`

**What it shows:**
- Today's date and day prominently at top (e.g., "Monday, 9 June")
- A highlighted card: "Today's Workout: Push Day" with a CTA button "Start Workout →"
- Weekly timeline strip showing Mon–Sat with icons (💪 Push / 🔄 Pull / 🦵 Legs / 😴 Rest)
- Each day in the strip is tappable — tapping a past day shows that day's log; tapping a future day lets you preview or reassign
- A "Switch Today's Workout" button — tapping this opens a bottom sheet with options: Push / Pull / Legs / Rest / Skip. Selecting reassigns today without touching other days
- Streak counter: "🔥 4 days straight" — resets if a day is marked Skip or Rest without manual override

**User selection flow:**
```
Home → Tap "Start Workout" → WorkoutDay screen
Home → Tap a day in timeline → Preview or switch that day
Home → Tap "Switch Today's Workout" → Bottom sheet → Select type → Updates timeline
```

**Design notes:**
- Dark background (#0F0F0F), accent color electric blue (#3B82F6) or gym-appropriate orange (#F97316)
- Weekly strip should feel like a progress rail, not just a calendar
- Today's card should be the most visually dominant element

---

### Screen 2: Workout Day

**URL:** `/workout/:dayType` (e.g., `/workout/push`)

**What it shows:**
- Header: "Push Day — Chest · Triceps · Shoulders"
- Two collapsible sections before the main list:
  - **Pre-workout Warmup** (always expanded by default) — 5–8 min routine
  - **Main Workout** — list of exercises for the day
- Each exercise shown as a card with:
  - Exercise name
  - Target muscle tag (e.g., "Upper Chest")
  - Sets × Reps prescription (e.g., "3 × 8–12")
  - A small thumbnail or play icon indicating video is available
  - Tap anywhere on card → goes to Exercise Detail screen
- At the bottom: **Post-workout Cooldown** section (collapsible)
- A "Finish Workout" button at the bottom — marks the day as complete in the timeline

**Exercise order (default, editable by admin):**

*Push Day 1 (Mon) — Chest + Triceps + Front Delts:*
Warmup → Bench Press → Incline Dumbbell Press → Cable Flyes → Overhead Tricep Extension → Tricep Pushdown → Lateral Raises → Cooldown

*Push Day 2 (Thu) — Shoulders focus:*
Warmup → Overhead Press → Incline Bench → Lateral Raises → Front Raises → Tricep Dips → Cable Pushdown → Cooldown

*Pull Day 1 (Tue) — Back + Biceps + Rear Delts:*
Warmup → Lat Pulldown → Seated Cable Row → Single Arm DB Row → Face Pulls → Barbell Curl → Hammer Curl → Cooldown

*Pull Day 2 (Fri) — Back + Biceps focus:*
Warmup → Deadlift → Pull-ups → Cable Row → Reverse Flyes → Preacher Curl → Concentration Curl → Cooldown

*Legs (Wed):*
Warmup → Squat → Leg Press → Romanian Deadlift → Leg Curl → Leg Extension → Calf Raises → Cooldown

---

### Screen 3: Exercise Detail

**URL:** `/exercise/:id`

**What it shows — two tabs: "How To" and "Log Weight"**

**How To tab:**
- Exercise name as header
- Muscle group tags (primary + secondary)
- **Embedded YouTube video** — rendered using YouTube iframe embed API
  - If admin has assigned multiple videos, show them in a horizontal scroll carousel
  - Video plays inline (no redirect to YouTube)
  - Shows video title below player
- **Step-by-step instructions** — numbered list, plain language, e.g.:
  1. Set the bench to flat. Grip the bar slightly wider than shoulder width.
  2. Unrack and lower bar to mid-chest with control — 2 seconds down.
  3. Press explosively back up. Don't lock elbows at top.
  4. Keep shoulder blades pinched together throughout.
- **Form Tips section** — 3–5 bullet points pulled from DB, styled as warning/tip cards:
  - 🚫 "Don't bounce the bar off your chest"
  - ✅ "Keep feet flat on the floor, no leg drive"
  - ⚠️ "If elbows flare past 90°, reduce weight"

**Log Weight tab (optional — user can skip):**
- Shows prescribed sets: e.g., "3 sets × 8–12 reps"
- For each set — a row with:
  - Set number
  - Weight input field (kg, number keyboard)
  - Reps done input field
  - A small note field (optional)
- "Previous session" shown in small text below each row — e.g., "Last time: 40kg × 10"
- Save button — stores to IndexedDB locally, syncs to backend on next connection
- If user skips logging — that's fine, no friction, no required fields

---

### Screen 4: Progress / History

**URL:** `/history`

**What it shows:**
- Dropdown to select exercise
- Line chart showing weight over time per set (using Recharts or Chart.js)
- "Personal Best" highlight — heaviest weight logged for that exercise
- Calendar heatmap of gym attendance (like GitHub contribution graph)
- Option to filter by user: Sush / Vishwajeet

---

### Screen 5: Admin Panel

**URL:** `/admin` (password protected, separate from main app)

**Purpose:** Lets you manage exercises and assign YouTube videos without touching code.

**Sections:**

**A. Exercise Manager**
- Table of all exercises with edit/delete
- Add new exercise form: Name, Muscle Group, Day Type, Sets, Reps, Is Warmup?, Is Cooldown?
- Add form tips (up to 5 per exercise, editable inline)
- Reorder exercises per day via drag-and-drop

**B. Video Manager**
- Dropdown: Select exercise
- Shows currently assigned videos with thumbnails (fetched via YouTube oEmbed API — no API key needed for thumbnails)
- Input field: Paste YouTube URL → validates it → saves to DB
- Can assign multiple videos per exercise
- Can mark one as "primary" (shown first)
- Delete or swap videos anytime

**C. Workout Day Builder** (future use)
- Visually assign which exercises appear on which day type
- Drag exercises between Push / Pull / Legs columns

**Admin Auth:**
- Simple — a hardcoded password in `.env` file
- Stored as a hashed value, checked on login
- JWT token stored in localStorage, expires in 7 days
- No OAuth needed for a 2-person app

---

## 6. Warmup & Cooldown Routines

These are stored as exercises with `is_warmup = TRUE` or `is_cooldown = TRUE` in the DB and shown as a separate block on the Workout Day screen.

### Default Pre-workout Warmup (all days — 5–7 min)
| Exercise | Duration | Notes |
|---|---|---|
| Jump rope / jog in place | 2 min | Get heart rate up |
| Arm circles | 30 sec each direction | Shoulder mobility |
| Hip circles | 30 sec | Hip joint prep |
| Bodyweight squats | 10 reps | Full range |
| Cat-cow stretch | 10 reps | Spine mobility |
| Band pull-aparts (or no band) | 15 reps | Rotator cuff activation |

### Push Day Specific Warmup (add after general)
- Light dumbbell flyes — 15 reps (very light, activation only)
- Wall slides — 10 reps

### Pull Day Specific Warmup
- Dead hangs — 20 sec
- Band-assisted lat stretch — 30 sec each side

### Legs Day Specific Warmup
- Leg swings (front/back + side) — 10 each
- Glute bridges — 15 reps
- Walking lunges — 10 steps

### Post-workout Cooldown (all days — 5 min)
- Static chest stretch (doorway) — 30 sec
- Lat stretch (overhead lean) — 30 sec each side
- Quad stretch — 30 sec each leg
- Hamstring stretch — 30 sec each leg
- Child's pose — 1 min
- Neck rolls — 30 sec

---

## 7. Day Switching Logic

This is a key feature — the app should not punish you for missing a day.

### Default Weekly Assignment
```
Monday    → Push 1
Tuesday   → Pull 1
Wednesday → Legs
Thursday  → Push 2
Friday    → Pull 2
Saturday  → Optional (user picks)
Sunday    → Rest
```

### Rules
- The weekly template is stored in `day_assignments` table, seeded fresh every Monday
- A user can tap any day in the timeline and reassign it — this updates only that day's record, not the template
- If Tuesday was missed and Wednesday is today: user can switch Wednesday to Pull 1 and shift Legs to Thursday
- The app does NOT auto-shift — it shows a suggestion ("Looks like you missed Pull 1 yesterday. Want to do it today?") but the user confirms
- Completed days are locked — cannot be reassigned after "Finish Workout" is tapped
- Rest days can always be reassigned to a workout day

---

## 8. LLM Integration (Claude API)

Use sparingly — only where it genuinely adds value over static content.

### Feature 1: AI Form Coach (Exercise Detail Screen)
**Trigger:** User taps "Ask AI" button on any exercise
**Prompt:** Sends exercise name + user's logged weights for that exercise + a question field
**Use case:** "My wrists hurt during bench press, what am I doing wrong?" → Claude returns a specific, practical answer
**Implementation:** Single API call, response shown inline below the form tips section
**Model:** claude-sonnet-4-20250514, max_tokens: 500

### Feature 2: Weekly Check-in Summary
**Trigger:** Every Sunday, a notification (or on-open prompt) saying "Your week is done — see summary"
**What it generates:** A short paragraph — how many days hit, total volume lifted (if logged), one specific encouragement or callout
**Prompt includes:** Days completed this week, exercises logged, any personal bests hit
**Model:** claude-sonnet-4-20250514, max_tokens: 300

### Feature 3: Adaptive Workout Suggestion (Future Enhancement)
**Trigger:** If user has logged weights for 4+ weeks
**What it does:** Looks at progressive overload data and suggests when to increase weight on specific exercises
**Example output:** "You've hit 3×12 on Bench Press for 2 weeks at 50kg. Try 52.5kg next session."

### LLM Integration Notes
- Never make API calls on page load — only on explicit user action
- Show a loading state while waiting ("Getting tips...")
- Cache responses per exercise per day in localStorage — no repeat API calls for same question
- All Claude calls go through your backend (not directly from frontend) to protect API key

---

## 9. Offline Behavior

The app must work at the gym even without WiFi.

### What works offline:
- Full exercise list for all days (cached in service worker on first load)
- All videos (YouTube embeds need connection — show a "Watch when online" placeholder offline)
- Weight logging (saved to IndexedDB, syncs when back online)
- Day switching and workout completion marking

### What needs connection:
- YouTube video playback
- LLM / AI features
- Admin panel syncing

### Sync strategy:
- On app open with connection: push any pending IndexedDB logs to backend
- Show a small sync indicator ("3 logs pending sync") in the header

---

## 10. Notifications (PWA Push — Phase 2)

PWA supports push notifications on Android Chrome.

- **Daily gym reminder:** "Time to hit the gym 💪" — fires at 9:00 AM on workout days
- **Streak at risk:** "You haven't logged today yet — don't break your streak 🔥" — fires at 8:00 PM
- **Rest day:** "Rest day today. Recovery is part of the grind." — gentle, no pressure

Implementation: Web Push API + a small notification service on the backend (can use free tier of OneSignal or self-hosted)

---

## 11. UI Design Direction

### Personality
Dark, focused, minimal — like a serious training app, not a wellness app. No pastel gradients, no confetti animations. The interface should feel like it respects your time in the gym.

### Palette
```
Background:     #0F0F0F  (near black)
Surface:        #1A1A1A  (card backgrounds)
Border:         #2A2A2A  (subtle dividers)
Accent:         #F97316  (orange — energy, gym)
Accent muted:   #7C3AED  (purple — for pull days)
Text primary:   #F5F5F5
Text secondary: #9CA3AF
Success:        #22C55E  (completed day indicators)
Warning:        #EAB308  (form warning tips)
```

### Typography
- Display: `Inter` or `DM Sans` — bold weight for day headers
- Body: `Inter` — regular for instructions
- Data: `JetBrains Mono` — for weight numbers and set/rep counts (monospaced gives gym-log feel)

### Mobile-first Layout Rules
- Minimum tap target: 44px height
- Bottom navigation bar (not sidebar) for main sections: Home / Workout / History
- Cards use 12px border radius — not too rounded, not sharp
- No horizontal scroll except in the weekly timeline strip
- Video embed: 16:9 ratio, full width of screen

---

## 12. Future Enhancements

These are out of scope for v1 but worth building toward:

| Enhancement | Description |
|---|---|
| **Body measurements tracker** | Log weight (bodyweight), chest/waist/arm measurements monthly |
| **Macro tracker integration** | Link daily food logs (manual entry or MyFitnessPal API) alongside workout data |
| **Rest timer** | In-set countdown timer with vibration alert between sets |
| **Voice logging** | Tap a mic button and say "50kg, 10 reps" — parsed via Whisper API |
| **Workout plan versioning** | Admin can create alternate 4-week programs and switch between them |
| **Two-user comparison** | Side-by-side Sush vs Vishwajeet progress charts — optional friendly rivalry mode |
| **AI program generator** | After 4 weeks of data, Claude generates a periodized next 4-week program |
| **Injury mode** | Flag an injury (e.g., "shoulder pain") — app auto-replaces affected exercises with alternatives |
| **Plate calculator** | Input target weight → shows exactly which plates to load on each side of the bar |
| **One Rep Max estimator** | From logged sets, calculates estimated 1RM using Epley formula |
| **Export to PDF** | Weekly workout log exported as a printable PDF |

---

## 13. Deployment Checklist

### Frontend (Vercel)
- [ ] Connect GitHub repo to Vercel
- [ ] Set environment variable: `VITE_API_URL=https://your-backend.railway.app`
- [ ] Verify PWA manifest and service worker work on production
- [ ] Test "Add to Home Screen" on Android Chrome

### Backend (Railway)
- [ ] Create Railway project, connect GitHub
- [ ] Set environment variables: `ADMIN_PASSWORD_HASH`, `JWT_SECRET`, `ANTHROPIC_API_KEY`
- [ ] SQLite DB file persisted via Railway volume
- [ ] Test all API endpoints via Postman before going live

### First-time setup
- [ ] Open admin panel, seed all exercises with default form tips
- [ ] Assign YouTube videos for each exercise
- [ ] Create first week's day assignments
- [ ] Both users install PWA on their phones

---

## 14. Handoff Notes for Claude Code

When passing this spec to an agentic coding environment, include these instructions:

> Build this as a React + Vite PWA with Tailwind CSS and Zustand. Start with the frontend only — mock the backend with a local JSON file for exercises. Implement screens in this order: (1) Home with weekly timeline, (2) WorkoutDay list, (3) Exercise Detail with YouTube embed and static form tips, (4) Weight logger with IndexedDB persistence. Do not build the admin panel or LLM features in the first pass. The app must be installable as a PWA on Android Chrome. Use the dark color scheme defined in the spec. All exercise data for the Push/Pull/Legs split described in the spec should be seeded as default data.

---

*Spec version: 1.0 — June 2026*
*Authors: Sush + Claude*