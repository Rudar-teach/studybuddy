"use client";

import { useEffect, useState, useCallback } from "react";
import { useApp } from "./providers";
import { Navigation } from "./navigation";
import { Plus, FolderOpen, Users, Tag, Calendar, ExternalLink, GitBranch, CheckCircle, Clock, X } from "lucide-react";

const TECH_STACKS = [
  "JavaScript", "TypeScript", "React", "Next.js", "Vue.js", "Angular",
  "Node.js", "Python", "Django", "Flask", "Java", "Spring Boot",
  "Go", "Rust", "C++", "C#", ".NET", "Ruby", "Rails",
  "MongoDB", "PostgreSQL", "MySQL", "Redis", "GraphQL", "REST API",
  "Docker", "Kubernetes", "AWS", "GCP", "Azure", "TensorFlow", "PyTorch",
];

const STATUS_COLORS = {
  open: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20", label: "Open" },
  "in-progress": { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20", label: "In Progress" },
  completed: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20", label: "Completed" },
};

export function ProjectsPage() {
  const { navigateTo, projects, setProjects, addNotification, user } = useApp();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "open" | "in-progress" | "completed">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    technologies: [] as string[],
  });
  const [techInput, setTechInput] = useState("");

  const loadProjects = useCallback(async () => {
    try {
      const res = await fetch("/api/projects");
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects || []);
      }
    } catch (error) {
      console.error("Projects error:", error);
    } finally {
      setLoading(false);
    }
  }, [setProjects]);

  useEffect(() => { loadProjects(); }, [loadProjects]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("studybuddy_token");
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(newProject),
      });

      if (res.ok) {
        const data = await res.json();
        setProjects((prev) => [data.project, ...prev]);
        setShowCreateModal(false);
        setNewProject({ title: "", description: "", technologies: [] });
        addNotification({ type: "success", title: "Project Created!", message: "Your project is now live." });
        loadProjects();
      }
    } catch {
      addNotification({ type: "error", title: "Error", message: "Failed to create project" });
    }
  };

  const handleJoinProject = async (projectId: string) => {
    try {
      const token = localStorage.getItem("studybuddy_token");
      const res = await fetch(`/api/projects/${projectId}/join`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setProjects((prev) => prev.map((p) => p.id === projectId ? data.project : p));
        addNotification({ type: "success", title: "Joined Project!", message: "You are now a collaborator." });
      }
    } catch {
      addNotification({ type: "error", title: "Error", message: "Failed to join project" });
    }
  };

  const addTech = () => {
    const tech = techInput.trim();
    if (tech && !newProject.technologies.includes(tech)) {
      setNewProject((prev) => ({ ...prev, technologies: [...prev.technologies, tech] }));
      setTechInput("");
    }
  };

  const removeTech = (tech: string) => {
    setNewProject((prev) => ({ ...prev, technologies: prev.technologies.filter((t) => t !== tech) }));
  };

  const filteredProjects = projects.filter((p) => {
    if (filter !== "all" && p.status !== filter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) ||
        p.technologies.some((t: string) => t.toLowerCase().includes(q));
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#0f172a]">
      <Navigation />

      <main className="pt-20 md:pt-24 pb-24 md:pb-8 px-4 md:px-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-slide-up">
          <div>
            <h1 className="text-3xl font-bold mb-1">Projects</h1>
            <p className="text-slate-400">Find project partners or post your own project</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium"
          >
            <Plus className="w-5 h-5" />
            Post Project
          </button>
        </div>

        {/* Filters */}
        <div className="mt-6 flex flex-wrap gap-3 animate-slide-up stagger-1">
          {(["all", "open", "in-progress", "completed"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filter === status
                  ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                  : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
              }`}
            >
              {status === "all" ? "All" : STATUS_COLORS[status].label}
            </button>
          ))}
        </div>

        {/* Projects Grid */}
        <div className="mt-8">
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="glass rounded-2xl p-6 border border-slate-700/50 animate-pulse">
                  <div className="skeleton h-6 w-3/4 mb-3" />
                  <div className="skeleton h-4 w-full mb-2" />
                  <div className="skeleton h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-20">
              <FolderOpen className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-400 mb-2">No projects found</h3>
              <p className="text-sm text-slate-500">Post a project to find collaborators!</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProjects.map((project, i) => {
                const projectStatus = (project.status || "open") as keyof typeof STATUS_COLORS;
                const statusStyle = STATUS_COLORS[projectStatus] || STATUS_COLORS.open;
                const userId = user?.id;
                const isCollaborator = userId ? project.collaborators?.includes(userId) : false;
                const isCreator = userId ? project.creatorId === userId : false;

                return (
                  <div
                    key={project.id}
                    className="card-hover glass rounded-2xl p-6 border border-slate-700/50 animate-slide-up"
                    style={{ animationDelay: `${i * 0.05}s` }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full ${statusStyle.bg} ${statusStyle.text} border ${statusStyle.border}`}>
                        {statusStyle.label}
                      </span>
                      {isCreator && <span className="text-xs text-amber-400">Creator</span>}
                    </div>

                    <h3 className="font-semibold text-white mb-2 line-clamp-2">{project.title}</h3>
                    <p className="text-sm text-slate-400 mb-4 line-clamp-3">{project.description || "No description"}</p>

                    {project.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {project.technologies.slice(0, 4).map((tech: string) => (
                          <span key={tech} className="text-xs px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 flex items-center gap-1">
                            <Tag className="w-3 h-3" />
                            {tech}
                          </span>
                        ))}
                        {project.technologies.length > 4 && (
                          <span className="text-xs text-slate-500 px-2">+{project.technologies.length - 4}</span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-2 mb-4 text-xs text-slate-500">
                      <Users className="w-3.5 h-3.5" />
                      {project.collaborators?.length || 0} collaborator{(project.collaborators?.length || 0) !== 1 ? "s" : ""}
                    </div>

                    {!isCreator && !isCollaborator && project.status === "open" && (
                      <button
                        onClick={() => handleJoinProject(project.id)}
                        className="btn-primary w-full py-2.5 rounded-xl text-sm font-medium"
                      >
                        Join Project
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Create Project Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="modal-backdrop absolute inset-0" onClick={() => setShowCreateModal(false)} />
            <div className="relative glass rounded-2xl p-8 border border-slate-700/50 max-w-lg w-full animate-scale-in max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Post a Project</h2>
                <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateProject} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Project Title</label>
                  <input
                    type="text"
                    value={newProject.title}
                    onChange={(e) => setNewProject((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g. AI-Powered Study Assistant"
                    className="input-glass w-full px-4 py-3 rounded-xl text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                  <textarea
                    value={newProject.description}
                    onChange={(e) => setNewProject((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your project, goals, and what kind of collaborators you're looking for..."
                    rows={4}
                    className="input-glass w-full px-4 py-3 rounded-xl text-sm resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Technologies</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={techInput}
                      onChange={(e) => setTechInput(e.target.value)}
                      onKeyDown={(e) => { e.key === "Enter" && (e.preventDefault(), addTech()); }}
                      placeholder="Add a technology..."
                      className="input-glass flex-1 px-4 py-3 rounded-xl text-sm"
                    />
                    <button type="button" onClick={addTech} className="btn-primary px-4 py-3 rounded-xl">
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {newProject.technologies.map((tech) => (
                      <span key={tech} className="skill-tag text-xs px-2.5 py-1 rounded-full flex items-center gap-1">
                        {tech}
                        <button type="button" onClick={() => removeTech(tech)}>
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {TECH_STACKS.filter((t) => !newProject.technologies.includes(t)).slice(0, 12).map((tech) => (
                      <button
                        key={tech}
                        type="button"
                        onClick={() => setNewProject((prev) => ({ ...prev, technologies: [...prev.technologies, tech] }))}
                        className="text-xs px-2.5 py-1 rounded-full border border-slate-700 text-slate-400 hover:text-indigo-300 hover:border-indigo-500/30 transition-all"
                      >
                        + {tech}
                      </button>
                    ))}
                  </div>
                </div>

                <button type="submit" className="btn-primary w-full py-3.5 rounded-xl font-semibold">
                  Create Project
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}