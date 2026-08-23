import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import "@fontsource-variable/fraunces";
import "@fontsource/space-grotesk/400.css";
import "@fontsource/space-grotesk/500.css";
import "@fontsource/space-grotesk/600.css";
import "@fontsource/fragment-mono/400.css";
import "./index.css";

import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { PlannerProvider } from "@/hooks/use-planner-data";
import AppLayout from "@/components/layout/AppLayout";
import Dashboard from "@/pages/Dashboard";
import Subjects from "@/pages/Subjects";
import Assignments from "@/pages/Assignments";
import Exams from "@/pages/Exams";
import Planner from "@/pages/Planner";
import Progress from "@/pages/Progress";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";

function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          loading…
        </span>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

const router = createBrowserRouter([
  { path: "/login", element: <Login /> },
  { path: "/signup", element: <Signup /> },
  {
    path: "/",
    element: (
      <RequireAuth>
        <PlannerProvider>
          <AppLayout />
        </PlannerProvider>
      </RequireAuth>
    ),
    children: [
      { index: true, element: <Dashboard /> },
      { path: "subjects", element: <Subjects /> },
      { path: "assignments", element: <Assignments /> },
      { path: "exams", element: <Exams /> },
      { path: "planner", element: <Planner /> },
      { path: "progress", element: <Progress /> },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>
);