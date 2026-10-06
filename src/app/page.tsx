"use client";

import { useEffect, useState } from "react";
import { AuthProvider, AppProvider, useApp } from "@/components/providers";
import { LandingPage } from "@/components/landing";
import { LoginPage, RegisterPage } from "@/components/auth";
import { Dashboard } from "@/components/dashboard";
import { ProfilePage } from "@/components/profile";
import { BrowsePage } from "@/components/browse";
import { MatchesPage } from "@/components/matches";
import { GroupsPage } from "@/components/groups";
import { GroupDetailPage } from "@/components/group-detail";
import { ProjectsPage } from "@/components/projects";
import { RequestsPage } from "@/components/requests";
import { ToastContainer } from "@/components/toast";
import { LoadingScreen } from "@/components/loading";

// Pages that require authentication
const AUTHED_PAGES = new Set([
  "dashboard", "profile", "browse", "matches",
  "groups", "group-detail", "projects", "requests",
]);

function AppContent() {
  const { user, isLoading, currentPage, navigateTo } = useApp();

  // Redirect unauthenticated users away from authed pages
  useEffect(() => {
    if (!user && !isLoading && AUTHED_PAGES.has(currentPage)) {
      navigateTo("login");
    }
  }, [user, isLoading, currentPage, navigateTo]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  // Not logged in — show public pages only
  if (!user) {
    if (currentPage === "register") return <RegisterPage />;
    if (currentPage === "login") return <LoginPage />;
    // Default public page = landing
    return <LandingPage />;
  }

  // Authenticated routes
  switch (currentPage) {
    case "profile":
      return <ProfilePage />;
    case "browse":
      return <BrowsePage />;
    case "matches":
      return <MatchesPage />;
    case "groups":
      return <GroupsPage />;
    case "group-detail":
      return <GroupDetailPage />;
    case "projects":
      return <ProjectsPage />;
    case "requests":
      return <RequestsPage />;
    case "dashboard":
    default:
      return <Dashboard />;
  }
}

export default function Home() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppContent />
        <ToastContainer />
      </AppProvider>
    </AuthProvider>
  );
}
