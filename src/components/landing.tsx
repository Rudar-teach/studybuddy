"use client";

import { useApp } from "./providers";
import {
  BookOpen, Users, Sparkles, ArrowRight, Play, Shield,
  Calendar, MessageSquare, FolderOpen, Link as LinkIcon, Scale,
} from "lucide-react";

export function LandingPage() {
  const { navigateTo } = useApp();

  return (
    <div className="min-h-screen bg-[#082336]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">StudyBuddy</span>
            </div>
            <div className="flex items-center gap-3">
              <a
                href="/pages/privacy"
                className="text-sm text-slate-400 hover:text-white px-3 py-2 transition-colors"
              >
                Privacy
              </a>
              <a
                href="/pages/terms"
                className="text-sm text-slate-400 hover:text-white px-3 py-2 transition-colors"
              >
                Terms
              </a>
              <button
                onClick={() => navigateTo("login")}
                className="text-sm font-medium text-slate-300 hover:text-white transition-colors px-4 py-2"
              >
                Sign In
              </button>
              <button
                onClick={() => navigateTo("register")}
                className="btn-primary text-sm font-medium px-5 py-2.5 rounded-xl"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Find study partners who match your subjects, skills, and schedule.
            </h1>
            <p className="text-lg text-slate-400 leading-relaxed mb-8">
              StudyBuddy pairs you with students and collaborators. Set your
              availability, list what you study, and get matched by weighted
              overlap: shared subjects, complementary skills, common free time,
              and aligned goals.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => navigateTo("register")}
                className="btn-primary flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold"
              >
                Create an account
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigateTo("login")}
                className="btn-glass flex items-center gap-2 px-6 py-3.5 rounded-xl font-medium"
              >
                <Play className="w-4 h-4" />
                Sign in
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-2xl mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              How the matching works
            </h2>
            <p className="text-slate-400">
              Your match score combines four weighted signals. The more
              complete your profile, the better the results.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: BookOpen,
                weight: "30%",
                title: "Shared subjects",
                desc: "How many of your study subjects the other person also lists.",
              },
              {
                icon: Sparkles,
                weight: "25%",
                title: "Complementary skills",
                desc: "Skills they have that you do not, and vice versa.",
              },
              {
                icon: Calendar,
                weight: "25%",
                title: "Schedule overlap",
                desc: "Minutes of shared weekly free time across days and time blocks.",
              },
              {
                icon: Users,
                weight: "20%",
                title: "Aligned goals",
                desc: "Learning goals you have in common: exam prep, a project, or a new skill.",
              },
            ].map((f) => (
              <div key={f.title} className="glass rounded-2xl p-6 border border-slate-700/50">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-teal-500/15 flex items-center justify-center">
                    <f.icon className="w-5 h-5 text-teal-300" />
                  </div>
                  <span className="text-xs font-mono text-teal-300">{f.weight}</span>
                </div>
                <h3 className="font-semibold text-white mb-1">{f.title}</h3>
                <p className="text-sm text-slate-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What you can do */}
      <section className="py-24 border-t border-slate-700/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-2xl mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Once matched
            </h2>
            <p className="text-slate-400">
              A match is just the start. Here is what a study group or project
              team can do on the platform.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                icon: MessageSquare,
                title: "Group chat",
                desc: "Every group has a shared chat with message history.",
              },
              {
                icon: Calendar,
                title: "Scheduled sessions",
                desc: "Post a study session with a day, time, topic, and optional meeting link. Members RSVP.",
              },
              {
                icon: FolderOpen,
                title: "Shared resources",
                desc: "Drop links, notes, or files into a group so the important stuff is not buried in chat.",
              },
              {
                icon: Sparkles,
                title: "Progress check-ins",
                desc: "Log what you got done each week: done, in progress, or blocked.",
              },
              {
                icon: Users,
                title: "Project partners",
                desc: "Post a project and add collaborators as you find the right fit.",
              },
              {
                icon: Shield,
                title: "Report and block",
                desc: "Report users or groups, and block anyone so they stop appearing in your matches.",
              },
            ].map((f) => (
              <div key={f.title} className="glass rounded-2xl p-6 border border-slate-700/50">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/15 flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5 text-cyan-300" />
                </div>
                <h3 className="font-semibold text-white mb-1">{f.title}</h3>
                <p className="text-sm text-slate-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-6">
          <div className="glass rounded-2xl p-10 border border-teal-500/20 text-center">
            <h2 className="text-3xl font-bold text-white mb-3">
              Ready to find your study partner?
            </h2>
            <p className="text-slate-400 mb-8">
              Create a free account, complete your profile, and start matching.
            </p>
            <button
              onClick={() => navigateTo("register")}
              className="btn-primary group flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold"
            >
              Get started
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white">StudyBuddy</span>
            </div>
            <p className="text-sm text-slate-500">
              Built for students and collaborators who want a partner, not just a course.
            </p>
            <div className="flex items-center gap-5 text-sm">
              <a href="/pages/privacy" className="text-slate-400 hover:text-white flex items-center gap-1.5">
                <Scale className="w-4 h-4" />
                Privacy Policy
              </a>
              <a href="/pages/terms" className="text-slate-400 hover:text-white flex items-center gap-1.5">
                <Shield className="w-4 h-4" />
                Terms
              </a>
              <a href="https://github.com/Rudar-teach/studybuddy" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white flex items-center gap-1.5">
                <LinkIcon className="w-4 h-4" />
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
