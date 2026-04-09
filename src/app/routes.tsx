import { createBrowserRouter } from "react-router";
import { LandingPage } from "./pages/LandingPage";
import { SignupPage } from "./pages/SignupPage";
import { LoginPage } from "./pages/LoginPage";
import { OnboardingFlow } from "./pages/OnboardingFlow";
import { NewDashboardPage } from "./pages/NewDashboardPage";
import { HabitsPage } from "./pages/HabitsPage";
import { MoodPage } from "./pages/MoodPage";
import { AICoachPage } from "./pages/AICoachPage";
import { PlannerPage } from "./pages/PlannerPage";
import { QuitSupportPage } from "./pages/QuitSupportPage";
import { JournalPage } from "./pages/JournalPage";
import { ProgressPage } from "./pages/ProgressPage";
import { ChallengesPage } from "./pages/ChallengesPage";
import { RemindersPage } from "./pages/RemindersPage";
import { CommunityPage } from "./pages/CommunityPage";
import { ProfilePage } from "./pages/ProfilePage";
import { SettingsPage } from "./pages/SettingsPage";
// Admin
import { AdminLogin } from "./pages/admin/AdminLogin";
import { AdminLayout } from "./pages/admin/AdminLayout";
import { AdminOverview } from "./pages/admin/AdminOverview";
import { AdminUsers } from "./pages/admin/AdminUsers";

export const router = createBrowserRouter([
  { path: "/", Component: LandingPage },
  { path: "/signup", Component: SignupPage },
  { path: "/login", Component: LoginPage },
  { path: "/onboarding", Component: OnboardingFlow },
  { path: "/dashboard", Component: NewDashboardPage },
  { path: "/habits", Component: HabitsPage },
  { path: "/mood", Component: MoodPage },
  { path: "/ai-coach", Component: AICoachPage },
  { path: "/planner", Component: PlannerPage },
  { path: "/quit-support", Component: QuitSupportPage },
  { path: "/journal", Component: JournalPage },
  { path: "/progress", Component: ProgressPage },
  { path: "/challenges", Component: ChallengesPage },
  { path: "/reminders", Component: RemindersPage },
  { path: "/community", Component: CommunityPage },
  { path: "/profile", Component: ProfilePage },
  { path: "/settings", Component: SettingsPage },
  // Admin
  { path: "/admin/login", Component: AdminLogin },
  {
    path: "/admin",
    Component: AdminLayout,
    children: [
      { index: true, Component: AdminOverview },
      { path: "users", Component: AdminUsers },
    ],
  },
]);