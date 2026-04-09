Design a modern, premium, AI-powered self-improvement web application dashboard and core product interface.

This platform helps users improve their physical, mental, and emotional wellbeing through habit tracking, mood monitoring, journaling, quitting bad habits, and an intelligent AI coach. The interface should feel like a personal growth companion — supportive, motivating, and clean.

---

# 🎨 DESIGN SYSTEM

## Visual Style

* Dark premium UI (deep charcoal / near-black background)
* Gradient accents:

  * electric blue
  * violet
  * emerald green
  * subtle orange highlights
* Soft glow effects for primary actions
* Rounded 2xl cards
* Smooth shadows and depth layers
* Minimal glassmorphism (only for chatbot and overlays)
* Clean spacing and grid layout
* Modern typography (bold headings, soft readable body text)

## Emotional Tone

* Encouraging, not aggressive
* Calm + focused
* Feels like a personal AI companion
* Rewarding small progress

---

# 🧭 APP STRUCTURE (SIDEBAR NAVIGATION)

Design a dashboard with a left sidebar:

### Sidebar Items:

* Dashboard
* Habits
* AI Coach
* Mood Tracker
* Journal
* Quit Habits
* Progress
* Challenges
* Reminders
* Profile

### Sidebar Behavior:

* Collapsible
* Active item highlight
* Smooth hover transitions
* Icons + labels

---

# 🏠 1. DASHBOARD PAGE (MAIN HUB)

## Goal

Give a complete daily overview in one screen.

---

## Layout

### Top Section

* Greeting:
  “Good morning, Shree. Ready to improve today?”
* Date
* Motivational quote
* Streak indicator

---

### Core Cards (Grid Layout)

#### 1. Today’s Goals Card

* List:

  * Run 2 km
  * Drink 3L water
  * No smoking
  * Journal tonight
* Progress indicator

---

#### 2. Habit Progress Card

* Completed: 3/6
* Animated progress bar

---

#### 3. Mood Card

* Mood selector (emoji or slider)
* Quick update button

---

#### 4. AI Message Card

Example:
“You’re doing great. Focus on consistency, not perfection.”

---

### Stats Widgets

* Streak days
* Smoke-free days
* Workout days this week
* Sleep average
* Water intake

---

### Quick Actions

Buttons:

* Log Mood
* Add Journal
* Mark Habits
* Chat with AI

---

## Animations

* Cards fade-up on load
* Progress bars animate
* Stats count-up effect
* Hover: lift + glow

---

# 🧩 2. HABIT TRACKER PAGE

## Goal

Track daily habits visually and easily.

---

## Layout

### Top

* Date selector
* Completion percentage

---

### Habit List

Each row/card:

* Habit name
* Category (physical, mental, emotional)
* Toggle checkbox
* Streak counter
* Notes button

---

### Sections

* All habits
* Physical
* Mental
* Emotional
* Bad habit recovery

---

### Weekly View

* Calendar-style streak tracker

---

## Interaction

* Toggle = smooth check animation
* Missed habit → subtle warning UI
* Hover card → highlight

---

# 🤖 3. AI COACH PAGE

## Goal

Make AI feel like a real assistant.

---

## Layout

### Chat Interface

* Message bubbles (user + AI)
* Scrollable chat
* Input box

---

### Suggested Prompts

* Motivate me
* Help me quit smoking
* Plan my day
* I feel low
* Fix my routine

---

### Side Panel (optional)

* Current goals
* Mood
* Habit stats

---

## Chat Behavior

* Typing animation
* Message fade-in
* Smart response UI

---

## IMPORTANT

This UI will later connect to:
👉 n8n webhook + AI agent

For now:

* static/mock responses

---

# 😊 4. MOOD TRACKER PAGE

## Layout

### Mood Input

* Emotion selector:
  happy, calm, stressed, tired, sad, motivated

---

### Sliders

* Energy
* Stress
* Confidence
* Anxiety

---

### Reflection Input

“What made you feel this way today?”

---

### AI Response

* Suggestion based on mood

---

### Mood History

* Line chart (7-day / 30-day)

---

# 📓 5. JOURNAL PAGE

## Layout

### Guided Questions

* What did I do today?
* What went well?
* What can I improve?

---

### Text Area

* Large writing space

---

### Actions

* Save
* AI Summary
* Generate tomorrow plan

---

### AI Output

* Summary
* Improvement suggestion

---

# 🚭 6. QUIT HABITS PAGE

## Goal

Support users quitting smoking/drinking.

---

### Top Stats

* Smoke-free days
* Current streak
* Longest streak

---

### Urge Tracker

* What triggered you?
* Did you resist?

---

### Trigger Analysis

* Stress
* Boredom
* Social triggers

---

### Replacement Suggestions

* Walk
* Water
* Breathing
* Exercise

---

### Recovery Mode

* No shame UI
* Encouragement message

---

# 📊 7. PROGRESS PAGE

## Layout

### Charts

* Habit completion (bar)
* Mood trend (line)
* Streak graph
* Sleep score ring

---

### AI Insights Card

“You perform best in mornings. Improve evening habits.”

---

# 🏆 8. CHALLENGES PAGE

## Cards:

* 7 days no smoking
* 14 day workout
* 21 day discipline

---

### Each Card:

* Progress bar
* Join button
* Reward badge

---

# ⏰ 9. REMINDERS PAGE

## Settings:

* Wake up reminder
* Workout reminder
* Journal reminder

---

## Delivery:

* Email
* Push
* Telegram (future)

---

# 🤖 FLOATING CHATBOT (GLOBAL)

## Placement

Bottom-right corner

---

## Button

* Rounded
* Glow
* Pulse animation

---

## Chat Window

* Opens overlay
* Quick prompts
* Friendly greeting

---

## Future

👉 Connect to n8n AI agent

---

# ✨ GLOBAL ANIMATION SYSTEM

Use:

* fade-up
* stagger reveal
* hover lift
* glow pulses
* smooth transitions
* chart draw animations

Avoid:

* excessive motion
* distracting effects

---

# 📱 RESPONSIVENESS

* Desktop: full dashboard grid
* Tablet: reduced grid
* Mobile:

  * bottom navigation
  * stacked cards

---

# 🎯 FINAL EXPERIENCE GOAL

The UI should feel like:

* a smart life assistant
* a personal coach
* a safe space for improvement

Users should feel:
“I’m improving my life every day.”

Design this as a real startup-level product ready for development.
