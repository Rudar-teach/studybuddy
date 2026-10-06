"use client";

import { useEffect, useState } from "react";
import { useApp } from "./providers";
import { Navigation } from "./navigation";
import {
  User, BookOpen, Award, Calendar, Clock, Save,
  Plus, X, Check, ChevronDown, Settings, Target,
  Edit3, Trash2
} from "lucide-react";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
const DAY_FULL = { Mon: "Monday", Tue: "Tuesday", Wed: "Wednesday", Thu: "Thursday", Fri: "Friday", Sat: "Saturday", Sun: "Sunday" };
const TIME_SLOTS = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00"];

const SKILL_LEVELS = ["beginner", "intermediate", "advanced", "expert"] as const;
const LEVEL_COLORS = {
  beginner: "from-slate-400 to-slate-500",
  intermediate: "from-blue-400 to-blue-600",
  advanced: "from-purple-400 to-purple-600",
  expert: "from-amber-400 to-orange-500",
};

const COMMON_SUBJECTS = [
  "Mathematics", "Physics", "Chemistry", "Biology", "Computer Science",
  "Data Science", "Machine Learning", "Web Development", "Mobile Development",
  "Artificial Intelligence", "Statistics", "Economics", "Psychology",
  "English Literature", "History", "Philosophy", "Engineering",
  "Medicine", "Law", "Business", "Design", "Music",
  "Mathematics", "Calculus", "Linear Algebra", "Algorithms", "Databases",
];

export function ProfilePage() {
  const { user, updateUser, addNotification, navigateTo } = useApp();
  const [activeTab, setActiveTab] = useState("general");
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    bio: user?.bio || "",
    major: user?.major || "",
    year: user?.year || "undergraduate",
    subjects: user?.subjects || [],
    skills: user?.skills || [],
    availability: user?.availability || [],
    learningGoals: user?.learningGoals || [],
  });

  const [newSubject, setNewSubject] = useState("");
  const [newSkill, setNewSkill] = useState({ name: "", level: "beginner" as const });
  const [newGoal, setNewGoal] = useState("");
  const [selectedSlots, setSelectedSlots] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Initialize selected slots from availability
    const slots: Record<string, boolean> = {};
    formData.availability.forEach((slot) => {
      const key = `${slot.day}-${slot.startTime}`;
      slots[key] = true;
    });
    setSelectedSlots(slots);
  }, []);

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addSubject = () => {
    const subject = newSubject.trim();
    if (subject && !formData.subjects.includes(subject)) {
      updateField("subjects", [...formData.subjects, subject]);
      setNewSubject("");
    }
  };

  const removeSubject = (subject: string) => {
    updateField("subjects", formData.subjects.filter((s) => s !== subject));
  };

  const addSkill = () => {
    if (newSkill.name.trim() && !formData.skills.some((s) => s.name === newSkill.name)) {
      updateField("skills", [...formData.skills, { name: newSkill.name.trim(), level: newSkill.level }]);
      setNewSkill({ name: "", level: "beginner" });
    }
  };

  const removeSkill = (name: string) => {
    updateField("skills", formData.skills.filter((s) => s.name !== name));
  };

  const addGoal = () => {
    const goal = newGoal.trim();
    if (goal && !formData.learningGoals.includes(goal)) {
      updateField("learningGoals", [...formData.learningGoals, goal]);
      setNewGoal("");
    }
  };

  const removeGoal = (goal: string) => {
    updateField("learningGoals", formData.learningGoals.filter((g) => g !== goal));
  };

  const toggleSlot = (day: string, time: string) => {
    const key = `${day}-${time}`;
    const newSelected = { ...selectedSlots };
    const slotIndex = formData.availability.findIndex(
      (s) => s.day === day && s.startTime === time
    );

    if (newSelected[key]) {
      delete newSelected[key];
      updateField("availability", formData.availability.filter((s) => !(s.day === day && s.startTime === time)));
    } else {
      newSelected[key] = true;
      const nextTimeIdx = TIME_SLOTS.indexOf(time);
      const endTime = nextTimeIdx < TIME_SLOTS.length - 1 ? TIME_SLOTS[nextTimeIdx + 1] : time;
      updateField("availability", [...formData.availability, { day: day as any, startTime: time, endTime: endTime }]);
    }
    setSelectedSlots(newSelected);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/users/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("studybuddy_token")}`,
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const data = await res.json();
        updateUser(data.user);
        addNotification({ type: "success", title: "Profile Updated", message: "Your changes have been saved." });
      }
    } catch (error) {
      addNotification({ type: "error", title: "Error", message: "Failed to update profile." });
    }
    setSaving(false);
  };

  const tabs = [
    { id: "general", label: "General", icon: User },
    { id: "subjects", label: "Subjects", icon: BookOpen },
    { id: "skills", label: "Skills", icon: Award },
    { id: "availability", label: "Schedule", icon: Calendar },
    { id: "goals", label: "Goals", icon: Target },
  ];

  return (
    <div className="min-h-screen bg-[#0f172a]">
      <Navigation />

      <main className="pt-20 md:pt-24 pb-24 md:pb-8 px-4 md:px-6 max-w-5xl mx-auto">
        <div className="animate-slide-up">
          <h1 className="text-3xl font-bold mb-2">Your Profile</h1>
          <p className="text-slate-400">Customize your profile to get better matches</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-8 overflow-x-auto pb-2 animate-slide-up stagger-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mt-8 animate-slide-up stagger-2">
          {/* General Tab */}
          {activeTab === "general" && (
            <div className="glass rounded-2xl p-6 md:p-8 border border-slate-700/50 space-y-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  <img
                    src={user?.avatar}
                    alt={user?.name}
                    className="w-20 h-20 rounded-full border-2 border-indigo-500/30"
                  />
                  <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center hover:bg-indigo-400 transition-colors">
                    <Edit3 className="w-4 h-4 text-white" />
                  </button>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">{user?.name}</h3>
                  <p className="text-sm text-slate-400">{user?.email}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    className="input-glass w-full px-4 py-3 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Major</label>
                  <input
                    type="text"
                    value={formData.major}
                    onChange={(e) => updateField("major", e.target.value)}
                    placeholder="e.g. Computer Science"
                    className="input-glass w-full px-4 py-3 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Year</label>
                  <select
                    value={formData.year}
                    onChange={(e) => updateField("year", e.target.value)}
                    className="input-glass w-full px-4 py-3 rounded-xl text-sm"
                  >
                    <option value="freshman">Freshman</option>
                    <option value="sophomore">Sophomore</option>
                    <option value="junior">Junior</option>
                    <option value="senior">Senior</option>
                    <option value="graduate">Graduate</option>
                    <option value="phd">PhD</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-2">Bio</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => updateField("bio", e.target.value)}
                    placeholder="Tell others about yourself, your interests, and what you're looking for..."
                    rows={4}
                    className="input-glass w-full px-4 py-3 rounded-xl text-sm resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Subjects Tab */}
          {activeTab === "subjects" && (
            <div className="glass rounded-2xl p-6 md:p-8 border border-slate-700/50">
              <h3 className="text-lg font-semibold text-white mb-4">Your Subjects</h3>
              <p className="text-sm text-slate-400 mb-6">Add subjects you're studying or interested in. This helps us find the best matches for you.</p>

              <div className="flex gap-2 mb-6">
                <input
                  type="text"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSubject())}
                  placeholder="Add a subject..."
                  className="input-glass flex-1 px-4 py-3 rounded-xl text-sm"
                />
                <button onClick={addSubject} className="btn-primary px-4 py-3 rounded-xl">
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-xs text-slate-500 mb-2 uppercase tracking-wider font-medium">Suggested</p>
                <div className="flex flex-wrap gap-2">
                  {COMMON_SUBJECTS.filter((s) => !formData.subjects.includes(s)).slice(0, 12).map((subject) => (
                    <button
                      key={subject}
                      onClick={() => {
                        updateField("subjects", [...formData.subjects, subject]);
                      }}
                      className="text-xs px-3 py-1.5 rounded-full border border-slate-700 text-slate-400 hover:text-indigo-300 hover:border-indigo-500/30 hover:bg-indigo-500/10 transition-all"
                    >
                      + {subject}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {formData.subjects.map((subject) => (
                  <span
                    key={subject}
                    className="skill-tag text-sm px-4 py-2 rounded-full flex items-center gap-2"
                  >
                    {subject}
                    <button onClick={() => removeSubject(subject)} className="hover:text-red-400 transition-colors">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
                {formData.subjects.length === 0 && (
                  <p className="text-sm text-slate-500 italic">No subjects added yet</p>
                )}
              </div>
            </div>
          )}

          {/* Skills Tab */}
          {activeTab === "skills" && (
            <div className="glass rounded-2xl p-6 md:p-8 border border-slate-700/50">
              <h3 className="text-lg font-semibold text-white mb-4">Your Skills</h3>
              <p className="text-sm text-slate-400 mb-6">Add skills you have or want to learn. This helps us find complementary partners.</p>

              <div className="flex gap-2 mb-6">
                <input
                  type="text"
                  value={newSkill.name}
                  onChange={(e) => setNewSkill((prev) => ({ ...prev, name: e.target.value }))}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                  placeholder="Skill name..."
                  className="input-glass flex-1 px-4 py-3 rounded-xl text-sm"
                />
                <select
                  value={newSkill.level}
                  onChange={(e) => setNewSkill((prev) => ({ ...prev, level: e.target.value as any }))}
                  className="input-glass px-4 py-3 rounded-xl text-sm"
                >
                  {SKILL_LEVELS.map((level) => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
                <button onClick={addSkill} className="btn-primary px-4 py-3 rounded-xl">
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2">
                {formData.skills.map((skill) => (
                  <div
                    key={skill.name}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-indigo-500/20 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-white">{skill.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full bg-gradient-to-r ${LEVEL_COLORS[skill.level]} text-white font-medium capitalize`}>
                        {skill.level}
                      </span>
                    </div>
                    <button
                      onClick={() => removeSkill(skill.name)}
                      className="text-slate-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {formData.skills.length === 0 && (
                  <p className="text-sm text-slate-500 italic text-center py-8">No skills added yet</p>
                )}
              </div>
            </div>
          )}

          {/* Availability Tab */}
          {activeTab === "availability" && (
            <div className="glass rounded-2xl p-6 md:p-8 border border-slate-700/50">
              <h3 className="text-lg font-semibold text-white mb-2">Weekly Availability</h3>
              <p className="text-sm text-slate-400 mb-6">Click on time slots to mark when you're available. This helps match you with compatible schedules.</p>

              <div className="overflow-x-auto">
                <div className="min-w-[600px]">
                  {/* Header */}
                  <div className="grid grid-cols-[80px_repeat(14,1fr)] gap-1 mb-2">
                    <div></div>
                    {TIME_SLOTS.map((time) => (
                      <div key={time} className="text-xs text-slate-500 text-center py-1">
                        {time}
                      </div>
                    ))}
                  </div>

                  {/* Days */}
                  {DAYS.map((day) => (
                    <div key={day} className="grid grid-cols-[80px_repeat(14,1fr)] gap-1 mb-1">
                      <div className="text-sm font-medium text-slate-300 flex items-center">
                        {DAY_FULL[day]}
                      </div>
                      {TIME_SLOTS.map((time) => {
                        const isSelected = selectedSlots[`${day}-${time}`];
                        return (
                          <button
                            key={time}
                            onClick={() => toggleSlot(day, time)}
                            className={`h-8 rounded-lg transition-all duration-200 ${
                              isSelected
                                ? "bg-gradient-to-r from-indigo-500 to-purple-500 scale-105 shadow-lg shadow-indigo-500/20"
                                : "bg-white/5 hover:bg-white/10"
                            }`}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-gradient-to-r from-indigo-500 to-purple-500" />
                  <span className="text-xs text-slate-400">Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-white/5" />
                  <span className="text-xs text-slate-400">Not available</span>
                </div>
              </div>

              {/* Current availability summary */}
              {formData.availability.length > 0 && (
                <div className="mt-6 p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
                  <p className="text-sm text-slate-400">
                    <span className="text-indigo-400 font-medium">{formData.availability.length}</span> time slots selected
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Goals Tab */}
          {activeTab === "goals" && (
            <div className="glass rounded-2xl p-6 md:p-8 border border-slate-700/50">
              <h3 className="text-lg font-semibold text-white mb-4">Learning Goals</h3>
              <p className="text-sm text-slate-400 mb-6">What are you looking to achieve? This helps us match you with the right partners.</p>

              <div className="flex gap-2 mb-6">
                <input
                  type="text"
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addGoal())}
                  placeholder="e.g. Learn React, Ace my exams..."
                  className="input-glass flex-1 px-4 py-3 rounded-xl text-sm"
                />
                <button onClick={addGoal} className="btn-primary px-4 py-3 rounded-xl">
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2">
                {formData.learningGoals.map((goal, i) => (
                  <div
                    key={goal}
                    className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-indigo-500/20 transition-all animate-slide-up"
                    style={{ animationDelay: `${i * 0.05}s` }}
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                      <Target className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm text-slate-200 flex-1">{goal}</span>
                    <button
                      onClick={() => removeGoal(goal)}
                      className="text-slate-500 hover:text-red-400 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {formData.learningGoals.length === 0 && (
                  <p className="text-sm text-slate-500 italic text-center py-8">No goals added yet</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-end animate-slide-up stagger-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold disabled:opacity-50"
          >
            {saving ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Profile
              </>
            )}
          </button>
        </div>
      </main>
    </div>
  );
}