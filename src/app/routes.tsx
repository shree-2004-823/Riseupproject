import { createBrowserRouter } from "react-router";
import App from "./App";
import { SignupPage } from "./pages/SignupPage";
import { LoginPage } from "./pages/LoginPage";
import { OnboardingFlow } from "./pages/OnboardingFlow";
import { DashboardPage } from "./pages/DashboardPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: App,
  },
  {
    path: "/signup",
    Component: SignupPage,
  },
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/onboarding",
    Component: OnboardingFlow,
  },
  {
    path: "/dashboard",
    Component: DashboardPage,
  },
]);
