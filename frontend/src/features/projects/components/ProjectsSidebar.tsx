import { useState } from 'react';
import { Plus, Search, Trash2, Copy } from 'lucide-react';
import type { EmbedProject } from '../types';
import { clsx } from 'clsx';

interface ProjectsSidebarProps {
  projects: EmbedProject[];
  currentProjectId: string | null;
  onSelectProject: (id: string) => void;
  onNewProject: () => void;
  onDeleteProject: (id: string) => void;
  onDuplicateProject: (id: string) => void;
}

export function ProjectsSidebar({
  projects,
  currentProjectId,
  onSelectProject,
  onNewProject,
  onDeleteProject,
  onDuplicateProject,
}: ProjectsSidebarProps) {
  const [search, setSearch] = useState('');

  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-discord-light">
        <h2 className="text-lg font-semibold text-discord-text mb-3">Projects</h2>
        <button
          onClick={onNewProject}
          className="btn btn-primary w-full flex items-center justify-center gap-2"
        >
          <Plus size={18} />
          New Project
        </button>
      </div>

      {/* Search */}
      <div className="p-3">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-discord-muted"
          />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-9 py-1.5 text-sm"
          />
        </div>
      </div>

      {/* Project List */}
      <div className="flex-1 overflow-y-auto px-2 pb-4">
        {filtered.length === 0 ? (
          <p className="text-discord-muted text-sm text-center py-4">
            {projects.length === 0 ? 'No projects yet' : 'No matches found'}
          </p>
        ) : (
          <ul className="space-y-1">
            {filtered.map((project) => (
              <li key={project.id}>
                <button
                  onClick={() => onSelectProject(project.id)}
                  className={clsx(
                    'w-full text-left px-3 py-2 rounded group flex items-center justify-between transition-colors',
                    currentProjectId === project.id
                      ? 'bg-discord-blurple text-white'
                      : 'hover:bg-discord-lighter text-discord-text'
                  )}
                >
                  <span className="truncate flex-1">{project.name}</span>
                  <span className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDuplicateProject(project.id);
                      }}
                      className="p-1 hover:bg-discord-light rounded"
                      title="Duplicate"
                    >
                      <Copy size={14} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteProject(project.id);
                      }}
                      className="p-1 hover:bg-discord-red rounded"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
