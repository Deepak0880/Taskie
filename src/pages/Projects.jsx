import { useEffect, useState } from 'react';
import { Plus, Search, FolderOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProjects } from '../hooks/useProjects';
import ProjectCard from '../components/ProjectCard';
import CreateProjectModal from '../components/CreateProjectModal';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import EmptyState from '../components/EmptyState';

export default function Projects() {
  const { user } = useAuth();
  const { projects, loading, fetchProjects, deleteProject } = useProjects();
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const isAdmin = user?.role === 'admin';
  const filtered = projects.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  async function handleDelete() {
    if (!deleteTarget) return;
    try { await deleteProject(deleteTarget._id || deleteTarget.id); setDeleteTarget(null); } catch { /* handled by hook */ }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-gray-900">Projects</h2>
        {isAdmin && (
          <button onClick={() => setCreateOpen(true)} className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors duration-200">
            <Plus className="w-4 h-4" /> New Project
          </button>
        )}
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search projects..." className="w-full border border-[#E5E7EB] rounded-lg pl-9 pr-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.08)] animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4" />
              <div className="h-3 bg-gray-200 rounded w-full mb-2" />
              <div className="h-3 bg-gray-200 rounded w-5/6 mb-4" />
              <div className="flex gap-4"><div className="h-3 bg-gray-200 rounded w-16" /><div className="h-3 bg-gray-200 rounded w-16" /></div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={FolderOpen} title="No projects found" description={search ? 'Try adjusting your search query.' : 'You have no projects yet. Create one to get started.'} actionLabel={isAdmin ? 'Create Project' : undefined} onAction={isAdmin ? () => setCreateOpen(true) : undefined} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((project) => (
            <ProjectCard key={project._id || project.id} project={project} onEdit={() => {}} onDelete={setDeleteTarget} />
          ))}
        </div>
      )}

      <CreateProjectModal isOpen={createOpen} onClose={() => setCreateOpen(false)} onCreated={() => fetchProjects()} />
      <ConfirmDeleteModal isOpen={!!deleteTarget} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} itemName={deleteTarget?.name} itemType="project" />
    </div>
  );
}
