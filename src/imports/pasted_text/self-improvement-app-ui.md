Design a complete, modern, premium, AI-powered self-improvement web application core product interface after authentication.

This is not just a dashboard mockup. Design it like a real startup product with clear workflows, usable layouts, realistic widgets, and frontend-ready screen logic.

The product helps users improve their physical, mental, and emotional wellbeing through:

* habit tracking
* mood and emotional check-ins
* quitting bad habits like smoking and drinking
* daily planning
* journaling
* AI coaching
* progress analytics

The product should feel like a personal growth companion: motivating, emotionally supportive, non-judgmental, and modern.

---

# OVERALL DESIGN STYLE

Use a premium dark theme with:

* deep charcoal / near-black background
* gradient accents: electric blue, violet, emerald green, soft orange
* rounded 2xl cards
* soft glows for primary CTAs
* smooth shadows and layered depth
* minimal glassmorphism only for chat, overlays, and top navbar
* clean spacing and strong visual hierarchy
* bold modern headings with soft readable body text

The UI must feel:

* premium
* emotionally safe
* smart
* modern
* clean
* calming but energetic

---

# GLOBAL APP LAYOUT

Design a logged-in app layout with:

## Left Sidebar

Include icons + labels for:

* Dashboard
* Habits
* Mood
* AI Coach
* Daily Planner
* Quit Habits
* Progress
* Journal
* Challenges
* Reminders
* Profile

Sidebar should:

* be collapsible
* highlight active page
* have smooth hover transitions
* feel modern and premium

## Top Header

Include:

* page title
* date
* search optional
* notification bell
* profile avatar
* streak badge
* floating AI chat access

---

# IMPORTANT PRODUCT RULE

Design these screens as if they must actually work well in frontend.

That means:

* clear buttons
* realistic forms
* obvious interactions
* useful widgets
* proper empty states
* success states
* loading states
* error states
* no purely decorative sections

Every page must feel functional and frontend-ready.

---

# 1. DASHBOARD PAGE

## Purpose

Give the user a quick full overview of today in one screen.

## Include

### Greeting Section

* “Good morning, Shree. Ready to improve today?”
* current date
* short motivational line
* current streak

### Main Cards Grid

1. Today’s Goals

   * run 2 km
   * drink 3L water
   * no smoking
   * journal tonight

2. Habit Progress

   * completed habits count
   * animated progress bar

3. Mood Snapshot

   * current mood
   * quick update button

4. AI Insight Card

   * “You’re doing well. Focus on consistency, not perfection.”

5. Smoke-Free / Alcohol-Free Streak

   * current streak
   * longest streak

6. Quick Actions

   * Log Mood
   * Mark Habits
   * Open Planner
   * Chat with AI

### Small Stats Widgets

* water intake
* sleep score
* workouts this week
* journal streak
* energy level

## Motion

* fade-up card reveal
* count-up stats
* progress bar fill animation
* card hover lift

---

# 2. HABIT TRACKER PAGE

## Purpose

This is one of the most important functional pages.
It must feel highly usable, not just pretty.

## Layout

### Top Area

* page title
* date selector
* completion percentage
* streak summary
* “Add Habit” button

### Main Habit List

Display habits in premium card/row format.

Each habit item should include:

* habit name
* category badge:

  * physical
  * mental
  * emotional
  * discipline
  * recovery
* completion toggle / checkbox
* streak count
* optional notes icon
* habit difficulty or frequency
* reminder time if set

### Tabs / Filters

* All
* Physical
* Mental
* Emotional
* Recovery
* Quit Support

### Weekly View

A weekly calendar-style mini tracker showing:

* completed days
* missed days
* streak continuity

### Empty State

If no habits:

* friendly illustration or card
* CTA: “Create your first habit”

### Functional UI Requirements

Make it clear how user can:

* mark habit as done
* undo a completed habit
* add a custom habit
* edit a habit
* delete / archive a habit
* view streaks
* see missed habits

## Motion

* check animation when toggled
* card highlight on completion
* progress summary updates visually
* subtle shake or warning glow for missed critical habits

---

# 3. MOOD & EMOTIONAL CHECK-IN PAGE

## Purpose

This page should help users log emotional state in a simple but meaningful way.

## Layout

### Top Section

* title: Mood Check-In
* subtitle: “How are you feeling today?”

### Mood Selector

Use expressive premium cards or emoji chips for:

* happy
* calm
* motivated
* tired
* stressed
* anxious
* sad
* frustrated

### Emotional Sliders

Include:

* energy level
* stress level
* confidence
* anxiety
* focus
* motivation

### Reflection Input

Short text box:

* “What made you feel this way today?”

### AI Support Response Card

After mood selection, show a contextual support card such as:

* calming advice
* motivational support
* one small action suggestion
* reflection prompt

Example:
“You seem mentally tired. Keep today light. Focus on one small win.”

### Mood History

Include:

* 7-day line chart
* weekly mood pattern summary
* most common emotion this week

### Functional UI Requirements

Make clear how user can:

* select current mood
* adjust sliders
* save check-in
* edit today’s check-in
* view past mood entries
* receive AI suggestion

### States

* default state
* saved state
* low-mood support state
* loading AI response state

## Motion

* smooth slider interaction
* selected mood glow
* AI response fade-in
* line chart draw animation

---

# 4. QUIT BAD HABITS SUPPORT PAGE

## Purpose

This page must support users trying to quit smoking, drinking, or unhealthy patterns.
It should feel supportive, never shame-based.

## Layout

### Top Stats

* smoke-free days
* alcohol-free days
* longest streak
* cravings today
* relapse count optional

### Urge / Craving Log Form

Include fields:

* what urge did you feel?
* what time did it happen?
* what triggered it?
* intensity level
* did you resist it?
* notes

### Trigger Pattern Section

Show common triggers:

* stress
* boredom
* loneliness
* social pressure
* night-time habit
* frustration

### Replacement Strategy Section

Show suggested replacements:

* drink water
* chew gum
* walk 5 minutes
* breathing exercise
* quick workout
* journaling
* call a friend

### Emergency Support Card

Button:

* “I feel like smoking”
* “I feel like drinking”

This opens a supportive intervention card with:

* grounding advice
* a distraction action
* a countdown or breathing UI
* quick AI support message

### Recovery Section

If user relapses:

* no shame message
* reset or continue support plan
* simple recovery strategy
* “Start again today” CTA

### Functional UI Requirements

Make it clear how user can:

* log a craving
* track triggers
* mark resisted / not resisted
* see patterns
* use emergency mode
* continue after relapse without harsh design

## Motion

* supportive card fade-in
* pulse on emergency support CTA
* progress streak animation
* subtle success check when user resists urge

---

# 5. DAILY PLANNER PAGE

## Purpose

Help users structure their day simply and clearly.

## Layout

### Top Section

* page title
* date
* AI-generated daily focus line

### Planner Blocks

Divide day into sections:

* Morning
* Afternoon
* Evening
* Night

### Tasks / Activities

Allow cards for:

* workout
* run
* water goal
* meditation
* reading
* work/study block
* journaling
* sleep routine

### Priority Buckets

Include:

* Must Do
* Good to Do
* Bonus

### Mode Toggle

Very important:

* Normal Mode
* Low Energy Mode
* Recovery Mode

Changing mode should visibly adapt the planner.
Example:
Normal Mode = full plan
Low Energy Mode = smaller realistic tasks
Recovery Mode = gentle reset plan

### AI Planning Card

Include:

* today’s focus
* one physical goal
* one mental goal
* one anti-craving goal
* one evening reflection task

### Functional UI Requirements

Make clear how user can:

* reorder tasks
* check tasks complete
* switch modes
* save plan
* generate plan with AI
* edit plan
* carry unfinished tasks forward

## Motion

* draggable task cards feel modern
* task completion check animation
* mode transition smooth
* AI plan card reveal

---

# 6. PROGRESS ANALYTICS PAGE

## Purpose

Show real improvement in a rewarding way.

## Layout

### Top Summary Cards

* current streak
* habits completed this week
* mood average
* smoke-free days
* workouts completed
* sleep score

### Charts Section

Include modern premium charts:

* weekly habit completion bar chart
* monthly mood trend line chart
* smoke-free streak graph
* water intake chart
* sleep consistency ring chart

### AI Insights Panel

Example insights:

* “You perform best in the morning.”
* “Most cravings happen after 8 PM.”
* “Your mood improves on workout days.”
* “Your weakest habit is sleep consistency.”

### Weekly Reflection Summary

* best day
* hardest day
* biggest improvement
* suggested next focus

### Functional UI Requirements

Make clear how user can:

* switch chart range: 7 days / 30 days / 90 days
* hover for chart details
* compare habits
* export summary later
* understand trends quickly

### Empty States

If not enough data:

* encourage logging more entries
* show sample preview card

## Motion

* chart draw animation
* stat counters
* tab switching transitions
* card hover glow

---

# 7. AI COACH CHAT INTEGRATION

## Global Floating Chatbot

Add a floating button at bottom-right across the app.

### Button Style

* circular or rounded-square
* glowing accent border
* pulse animation every few seconds
* tooltip: “Talk to your AI Coach”

### Chat Window

When opened, show:

* welcome message
* quick prompt chips:

  * Motivate me
  * Help with cravings
  * Plan my day
  * I feel low
  * Review my progress

### Chat UI

* user bubbles
* AI bubbles
* typing indicator
* input field
* send button
* scrollable body

### Important Note

Design this UI so it is ready to connect later to:
n8n webhook + AI agent

For now, use mock/static preview responses.

---

# COMPONENTS TO DESIGN

Create reusable component system for:

* Sidebar
* TopHeader
* StatCard
* ProgressCard
* HabitRow
* HabitToggle
* MoodChip
* SliderControl
* PlannerTaskCard
* TimeBlockCard
* QuitSupportCard
* TriggerTag
* EmergencyCTA
* ChartCard
* AIInsightCard
* ChatButton
* ChatWindow
* MessageBubble
* PromptChip
* PrimaryButton
* SecondaryButton
* InputField
* TextArea
* TabSwitch
* FilterChip
* EmptyStateCard

---

# RESPONSIVENESS

Design responsive versions for:

* Desktop: full premium app layout
* Tablet: reduced grid layout
* Mobile:

  * bottom navigation
  * stacked cards
  * compact charts
  * floating chat preserved

---

# UX RULES

DO:

* make actions obvious
* reward small wins
* keep layouts clean
* show supportive feedback
* make tracking feel easy

DO NOT:

* overload one page
* make habit logging confusing
* shame users for relapse
* create fake-looking decorative widgets with no purpose

---

# FINAL DESIGN GOAL

Design this as a real startup-quality self-improvement platform where the core modules genuinely feel usable and connected.

The user should feel:

* guided
* motivated
* supported
* in control of their growth

Make the habit tracker, mood check-ins, quit bad habits support, daily planner, and progress analytics the strongest and most functional parts of the product.
