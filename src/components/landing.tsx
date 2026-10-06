"use client";

import { useApp } from "./providers";
import { useState, useEffect } from "react";
import { BookOpen, Users, Sparkles, ArrowRight, Play, GitBranch, Star, ChevronDown, Zap, Globe, Shield, Calendar, MessageSquare, FolderOpen } from "lucide-react";
import Link from "next/link";

export function LandingPage() {
  const { navigateTo, user } = useApp();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#0f172a] overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"
          style={{ top: '10%', left: '10%', animation: 'blob 7s ease-in-out infinite' }}
        />
        <div
          className="absolute w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"
          style={{ top: '50%', right: '10%', animation: 'blob 9s ease-in-out infinite', animationDelay: '2s' }}
        />
        <div
          className="absolute w-72 h-72 bg-cyan-500/8 rounded-full blur-3xl"
          style={{ bottom: '10%', left: '30%', animation: 'blob 8s ease-in-out infinite', animationDelay: '4s' }}
        />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl rotate-6 opacity-80" />
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-indigo-600 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
              </div>
              <span className="text-xl font-bold gradient-text">StudyBuddy</span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigateTo("login")}
                className="text-sm font-medium text-slate-300 hover:text-white transition-colors px-4 py-2"
              >
                Sign In
              </button>
              <button
                onClick={() => navigateTo("register")}
                className="btn-primary text-sm font-medium px-6 py-2.5 rounded-xl"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-16">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="animate-slide-up">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-indigo-500/20 mb-6">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span className="text-sm font-medium text-indigo-300">AI-Powered Matching</span>
                </div>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                  Find Your{" "}
                  <span className="gradient-text animate-pulse">Perfect</span>
                  <br />
                  Study Partner
                </h1>
              </div>
              <p className="text-lg text-slate-400 leading-relaxed animate-slide-up stagger-1">
                Connect with students who share your subjects, complement your skills,
                and fit your schedule. Build study groups, find project partners,
                and accelerate your learning together.
              </p>
              <div className="flex flex-wrap gap-4 animate-slide-up stagger-2">
                <button
                  onClick={() => navigateTo("register")}
                  className="btn-primary group flex items-center gap-2 px-8 py-4 rounded-xl text-base font-semibold"
                >
                  Start Matching
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => navigateTo("login")}
                  className="btn-glass flex items-center gap-2 px-8 py-4 rounded-xl text-base font-medium"
                >
                  <Play className="w-5 h-5" />
                  Sign In
                </button>
              </div>

              {/* Stats */}
              <div className="flex gap-8 pt-8 animate-slide-up stagger-3">
                {[
                  { number: "10K+", label: "Students" },
                  { number: "500+", label: "Study Groups" },
                  { number: "95%", label: "Match Rate" },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className="text-2xl font-bold gradient-text">{stat.number}</div>
                    <div className="text-xs text-slate-500 mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Visual */}
            <div className="relative hidden lg:block animate-scale-in stagger-2">
              <div className="relative">
                {/* Floating Cards */}
                <div className="absolute -top-4 -left-4 glass rounded-2xl p-4 animate-float" style={{ animationDelay: '0s' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Sarah Chen</p>
                      <p className="text-xs text-emerald-400">98% Match</p>
                    </div>
                  </div>
                </div>

                <div className="absolute top-20 -right-8 glass rounded-2xl p-4 animate-float" style={{ animationDelay: '1s' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Study Group</p>
                      <p className="text-xs text-purple-400">Data Science</p>
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-4 left-8 glass rounded-2xl p-4 animate-float" style={{ animationDelay: '2s' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">New Match!</p>
                      <p className="text-xs text-amber-400">3 common skills</p>
                    </div>
                  </div>
                </div>

                {/* Main Visual */}
                <div className="glass rounded-3xl p-8 border border-slate-700/50">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-white">Your Matches</h3>
                      <span className="text-xs text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full">12 new</span>
                    </div>
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-indigo-500/30 transition-all cursor-pointer"
                      >
                        <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${i === 1 ? 'from-indigo-400 to-purple-500' : i === 2 ? 'from-cyan-400 to-blue-500' : 'from-pink-400 to-rose-500'} flex items-center justify-center text-white font-bold`}>
                          {String.fromCharCode(64 + i)}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white">Student {i}</p>
                          <p className="text-xs text-slate-400">Computer Science</p>
                        </div>
                        <div className={`text-sm font-bold ${i === 1 ? 'text-emerald-400' : i === 2 ? 'text-amber-400' : 'text-red-400'}`}>
                          {92 - i * 8}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Everything You Need to{" "}
              <span className="gradient-text">Study Smarter</span>
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Powerful features designed to help you find the perfect study partners and collaborators.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Sparkles,
                title: "Smart Matching",
                description: "AI-powered algorithm matches you based on subjects, skills, availability, and learning goals.",
                color: "from-indigo-500 to-purple-600",
                delay: 0,
              },
              {
                icon: Users,
                title: "Study Groups",
                description: "Create or join study groups with up to 50 members. Schedule sessions and collaborate in real-time.",
                color: "from-cyan-500 to-blue-600",
                delay: 0.1,
              },
              {
                icon: FolderOpen,
                title: "Project Partners",
                description: "Find collaborators for your projects. Share ideas, divide tasks, and build something amazing together.",
                color: "from-purple-500 to-pink-600",
                delay: 0.2,
              },
              {
                icon: MessageSquare,
                title: "Real-time Chat",
                description: "Communicate instantly with your study groups and project partners with real-time messaging.",
                color: "from-emerald-500 to-cyan-600",
                delay: 0.3,
              },
              {
                icon: Calendar,
                title: "Availability Matching",
                description: "Set your availability and find partners who match your schedule perfectly.",
                color: "from-amber-500 to-orange-600",
                delay: 0.4,
              },
              {
                icon: Shield,
                title: "Privacy First",
                description: "Your data stays yours. We never share your information with third parties.",
                color: "from-rose-500 to-red-600",
                delay: 0.5,
              },
            ].map((feature, i) => (
              <div
                key={feature.title}
                className="card-3d glass rounded-2xl p-6 border border-slate-700/50 group"
                style={{ animationDelay: `${feature.delay}s` }}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              How It <span className="gradient-text">Works</span>
            </h2>
            <p className="text-lg text-slate-400">Get started in 3 simple steps</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Create Profile",
                description: "Add your subjects, skills, and availability. Tell us what you're learning and your goals.",
              },
              {
                step: "2",
                title: "Get Matched",
                description: "Our algorithm finds the best study partners and project collaborators for you.",
              },
              {
                step: "3",
                title: "Collaborate",
                description: "Join study groups, chat in real-time, and achieve your goals together.",
              },
            ].map((step, i) => (
              <div key={step.step} className="relative">
                <div className="text-center">
                  <div className="relative w-20 h-20 mx-auto mb-6">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl rotate-6 opacity-50" />
                    <div className="relative w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
                      <span className="text-3xl font-bold text-white">{step.step}</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">{step.title}</h3>
                  <p className="text-slate-400">{step.description}</p>
                </div>
                {i < 2 && (
                  <div className="hidden md:block absolute top-10 -right-4 w-8">
                    <ArrowRight className="w-8 h-8 text-indigo-500/30" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32">
        <div className="max-w-4xl mx-auto px-6">
          <div className="glass rounded-3xl p-12 border border-indigo-500/20 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10" />
            <div className="relative">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Ready to Find Your{" "}
                <span className="gradient-text">Study Buddy?</span>
              </h2>
              <p className="text-lg text-slate-400 mb-8 max-w-xl mx-auto">
                Join thousands of students already connecting and learning together on StudyBuddy.
              </p>
              <button
                onClick={() => navigateTo("register")}
                className="btn-primary group flex items-center gap-2 px-10 py-4 rounded-xl text-base font-semibold mx-auto"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold gradient-text">StudyBuddy</span>
            </div>
            <p className="text-sm text-slate-500">
              StudyBuddy. Built with care for students everywhere.
            </p>
            <div className="flex items-center gap-4">
              <GitBranch className="w-5 h-5 text-slate-500 hover:text-white transition-colors cursor-pointer" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
