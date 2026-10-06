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

function AppContent() {
  const { user, isLoading, currentPage } = useApp();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    if (currentPage === "register") return <RegisterPage />;
    return <LoginPage />;
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
