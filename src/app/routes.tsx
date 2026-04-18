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
import { ChallengesPage } from "./pages/ChallengesPage";
import { RemindersPage } from "./pages/RemindersPage";
import { CommunityPage } from "./pages/CommunityPage";
import { ProfilePage } from "./pages/ProfilePage";
import { SettingsPage } from "./pages/SettingsPage";
import { AppErrorPage } from "./pages/AppErrorPage";
import { NotFoundPage } from "./pages/NotFoundPage";
// Admin
import { AdminLogin } from "./pages/admin/AdminLogin";
import { AdminLayout } from "./pages/admin/AdminLayout";
import { AdminOverview } from "./pages/admin/AdminOverview";
import { AdminUsers } from "./pages/admin/AdminUsers";
import { AdminQuotes } from "./pages/admin/AdminQuotes";
import { AdminAudit } from "./pages/admin/AdminAudit";
import { AdminPublicOnlyRoute, PublicOnlyRoute, RequireAdmin, RequireAuth } from "./components/auth/RouteGuards";

export const router = createBrowserRouter([
  { path: "/", Component: LandingPage, ErrorBoundary: AppErrorPage },
  {
    Component: PublicOnlyRoute,
    ErrorBoundary: AppErrorPage,
    children: [
      { path: "/signup", Component: SignupPage },
      { path: "/login", Component: LoginPage },
    ],
  },
  {
    Component: RequireAuth,
    ErrorBoundary: AppErrorPage,
    children: [
      { path: "/onboarding", Component: OnboardingFlow },
      { path: "/dashboard", Component: NewDashboardPage },
      { path: "/habits", Component: HabitsPage },
      { path: "/mood", Component: MoodPage },
      { path: "/ai-coach", Component: AICoachPage },
      { path: "/planner", Component: PlannerPage },
      { path: "/quit-support", Component: QuitSupportPage },
      { path: "/journal", Component: JournalPage },
      {
        path: "/progress",
        lazy: async () => ({
          Component: (await import("./pages/ProgressPage")).ProgressPage,
        }),
      },
      { path: "/challenges", Component: ChallengesPage },
      { path: "/reminders", Component: RemindersPage },
      { path: "/community", Component: CommunityPage },
      { path: "/profile", Component: ProfilePage },
      { path: "/settings", Component: SettingsPage },
    ],
  },
  // Admin
  {
    Component: AdminPublicOnlyRoute,
    ErrorBoundary: AppErrorPage,
    children: [{ path: "/admin/login", Component: AdminLogin }],
  },
  {
    Component: RequireAdmin,
    ErrorBoundary: AppErrorPage,
    children: [
      {
        path: "/admin",
        Component: AdminLayout,
        children: [
          { index: true, Component: AdminOverview },
          { path: "users", Component: AdminUsers },
          { path: "quotes", Component: AdminQuotes },
          { path: "audit", Component: AdminAudit },
        ],
      },
    ],
  },
  { path: "*", Component: NotFoundPage, ErrorBoundary: AppErrorPage },
]);
