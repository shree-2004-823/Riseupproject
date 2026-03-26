Design a complete, modern, premium authentication and onboarding flow for an AI-powered self-improvement web application.

This product helps users improve their physical, mental, and emotional wellbeing through habit tracking, mood monitoring, journaling, quitting bad habits, and an intelligent AI coach.

The experience must feel:

* motivating
* clean
* emotionally supportive
* premium like a startup product
* not overwhelming

---

# 🔐 AUTH FLOW STRUCTURE (CRITICAL)

Design the full user journey:

1. Landing Page → user clicks "Start Free"
2. Redirect to Signup Page
3. Account creation
4. Immediately enter Onboarding (multi-step)
5. Complete onboarding
6. Redirect to Dashboard

The flow must feel seamless, fast, and engaging.

---

# 🎨 DESIGN SYSTEM

## Visual Style

* Dark premium UI (deep charcoal / near-black background)
* Gradient accents:

  * electric blue
  * violet
  * emerald green
  * subtle orange highlights
* Soft glow effects for CTAs
* Rounded 2xl cards
* Smooth layered shadows
* Minimal glassmorphism (chat UI + navbar only)
* Clean grid spacing
* Large bold headings, soft readable body text

## Emotional Tone

* Encouraging (not aggressive)
* Calm but energetic
* Feels like a personal growth companion
* Non-judgmental UI

---

# ✨ MOTION & INTERACTION DESIGN

Design all screens with animation behavior:

* Page entry: fade + slide (left/right)
* Inputs:

  * glow on focus
  * slight scale up
* Buttons:

  * lift (2–4px)
  * glow on hover
* Cards:

  * elevation + border glow
* Step transitions:

  * horizontal slide + fade
* Progress bar:

  * smooth animated fill
* Background:

  * slow gradient movement
* Floating elements:

  * subtle looping motion (hero-style)

---

# 🧩 1. SIGNUP PAGE

## Goal

Make signup feel:

* fast
* premium
* motivating

## Layout (Split Screen Desktop)

### LEFT SIDE (Emotional Visual Panel)

* Animated gradient background
* Floating UI widgets:

  * streak counter (e.g., 12-day streak)
  * habit progress (4/5 complete)
  * mood score (8/10)
* Soft glowing orb animation
* Motivational text:

  * "Start your transformation today"
  * "Small steps. Big results."

### RIGHT SIDE (Form Panel)

## Form UI

* Title: "Create your account"
* Subtitle: "Start building a better version of yourself today"

### Fields:

* Full Name
* Email
* Password
* Confirm Password

### Buttons:

* Primary: "Create Account" (glow button)
* Secondary: "Continue with Google"

### Extra:

* "Already have an account? Login"
* Password strength indicator (animated progress bar)

---

## Animations

* Page loads from right (fade + slide)
* Input focus glow
* Password strength fills dynamically
* Button hover lift + glow

---

## Frontend Functionality (UI-Level)

* Real-time validation:

  * email format
  * password strength
  * password match
* Inline error messages
* Disable button until valid
* Loading spinner on submit
* Success → redirect to onboarding

---

## Components

* AuthLayout
* SplitScreenContainer
* AuthCard
* InputField
* PasswordStrengthMeter
* PrimaryButton
* GoogleButton

---

# 🔑 2. LOGIN PAGE

## Layout

Same structure as signup (reuse components)

### Fields:

* Email
* Password

### Features:

* Forgot password link
* Signup redirect
* Optional "Remember me"

---

## Animations

* Same as signup for consistency

---

## Functionality

* Error handling (wrong password)
* Loading state
* Redirect:

  * if new user → onboarding
  * if existing → dashboard

---

# 🚀 3. ONBOARDING FLOW (CORE EXPERIENCE)

## Structure

Multi-step wizard (5 steps)

### Top Progress Bar

Step 1 → Step 5 (animated progress)

---

# 🧩 Step 1: Choose Your Goal

## UI

Large interactive cards:

* Get Fit 💪
* Improve Mental Health 🧠
* Build Discipline ⚡
* Quit Smoking 🚭
* Quit Drinking 🍺❌
* Sleep Better 😴
* Emotional Balance ❤️

## Interaction

* Hover: glow
* Click: scale + highlight
* Multi-select enabled

---

# 🧩 Step 2: Select Habits

## UI

Checklist cards:

* Exercise
* Running
* Drink water
* Meditation
* Reading
* Sleep on time
* No smoking
* No alcohol
* Journal daily

## Extra

* Add custom habit input field

---

# 🧩 Step 3: Daily Routine Setup

## UI

Time-based inputs:

* Wake up time
* Workout time
* Reminder time
* Sleep time

## Interaction

* Sliders or time pickers
* Clean minimal layout

---

# 🧩 Step 4: AI Coach Personality

## UI Cards

* Strict Coach 🪖
* Calm Mentor 🧘
* Motivational Friend 🔥
* Discipline Trainer ⚡

## Interaction

* Glow + scale
* Optional card flip animation

---

# 🧩 Step 5: Final Preview

## Show Summary:

* Selected goals
* Chosen habits
* Schedule
* AI personality

## CTA

👉 "Start My Journey"

---

## Onboarding Animations

* Step transitions: slide + fade
* Cards: scale on select
* Progress bar: smooth fill
* Final step:

  * soft glow burst
  * subtle confetti

---

## Functionality

* Store selections in state
* Submit to backend
* Redirect to dashboard

---

# 🤖 CHATBOT INTEGRATION (IMPORTANT)

## Placement

### Auth Pages

* Floating chat button (bottom-right)
* Tooltip: "Need help starting?"

### Onboarding

* Inline AI assistant:

  * "Need help choosing habits?"
  * "I can suggest a simple plan"

---

## Chat UI Structure

### Floating Button

* Rounded
* Glow + pulse animation

### Mini Chat Window

* Opens on click
* Contains:

  * welcome message
  * quick prompt buttons:

    * Motivate me
    * Suggest habits
    * I feel low
    * Help me quit smoking

---

## For Now

* Static responses (mock UI)

## Later

* Connect to n8n webhook + AI agent

---

# 🧱 COMPONENT SYSTEM

## Auth Components

* AuthLayout
* AuthCard
* InputField
* PasswordMeter
* Button (Primary/Secondary)

## Onboarding Components

* Stepper
* ProgressBar
* SelectCard
* HabitCard
* TimePicker
* SummaryCard

## Chat Components

* ChatButton
* ChatWindow
* MessageBubble
* PromptChip

---

# 🎨 UI CONSISTENCY RULES

Maintain:

* same button styles
* same glow intensity
* same animation timing
* same spacing system
* same border radius

---

# ⚡ RESPONSIVENESS

* Desktop: split layout
* Tablet: reduced split
* Mobile:

  * stacked layout
  * bottom navigation for onboarding
  * full-width buttons

---

# 🧠 UX PRINCIPLES

DO:

* keep onboarding under 1 minute
* show progress clearly
* make user feel guided
* celebrate small steps

DO NOT:

* overload with inputs
* create long boring forms
* use harsh language

---

# 🎯 FINAL GOAL

Design this as a real startup-level product experience that feels:

* premium
* emotionally intelligent
* visually engaging
* ready for development

The entire flow should make the user feel:
“I want to start improving my life right now.”
