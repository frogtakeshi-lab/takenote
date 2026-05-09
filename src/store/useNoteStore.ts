import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { Note, Tag, Theme, SortBy } from '../types';

const TAG_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
  '#f97316', '#eab308', '#22c55e', '#14b8a6', '#3b82f6',
];

interface NoteStore {
  notes: Note[];
  tags: Tag[];
  activeNoteId: string | null;
  searchQuery: string;
  filterTagIds: string[];
  sortBy: SortBy;
  theme: Theme;

  // Note actions
  createNote: () => void;
  updateNote: (id: string, patch: Partial<Pick<Note, 'title' | 'content' | 'tagIds'>>) => void;
  deleteNote: (id: string) => void;
  togglePin: (id: string) => void;
  setActiveNote: (id: string | null) => void;

  // Tag actions
  createTag: (name: string) => Tag;
  updateTag: (id: string, name: string) => void;
  deleteTag: (id: string) => void;

  // Filter/search
  setSearchQuery: (q: string) => void;
  toggleFilterTag: (id: string) => void;
  clearFilterTags: () => void;
  setSortBy: (s: SortBy) => void;

  // Theme
  setTheme: (theme: Theme) => void;

  // Derived
  filteredNotes: () => Note[];
}

export const useNoteStore = create<NoteStore>()(
  persist(
    (set, get) => ({
      notes: [],
      tags: [],
      activeNoteId: null,
      searchQuery: '',
      filterTagIds: [],
      sortBy: 'updatedAt',
      theme: 'system',

      createNote: () => {
        const id = uuidv4();
        const now = Date.now();
        const note: Note = {
          id,
          title: '無題のノート',
          content: '',
          tagIds: [],
          pinned: false,
          createdAt: now,
          updatedAt: now,
        };
        set(s => ({ notes: [note, ...s.notes], activeNoteId: id }));
      },

      updateNote: (id, patch) => {
        set(s => ({
          notes: s.notes.map(n =>
            n.id === id ? { ...n, ...patch, updatedAt: Date.now() } : n
          ),
        }));
      },

      deleteNote: (id) => {
        set(s => {
          const remaining = s.notes.filter(n => n.id !== id);
          const nextActive = s.activeNoteId === id
            ? (remaining[0]?.id ?? null)
            : s.activeNoteId;
          return { notes: remaining, activeNoteId: nextActive };
        });
      },

      togglePin: (id) => {
        set(s => ({
          notes: s.notes.map(n =>
            n.id === id ? { ...n, pinned: !n.pinned } : n
          ),
        }));
      },

      setActiveNote: (id) => set({ activeNoteId: id }),

      createTag: (name) => {
        const existing = get().tags.find(t => t.name.toLowerCase() === name.toLowerCase());
        if (existing) return existing;
        const tag: Tag = {
          id: uuidv4(),
          name,
          color: TAG_COLORS[get().tags.length % TAG_COLORS.length],
        };
        set(s => ({ tags: [...s.tags, tag] }));
        return tag;
      },

      updateTag: (id, name) => {
        set(s => ({ tags: s.tags.map(t => t.id === id ? { ...t, name } : t) }));
      },

      deleteTag: (id) => {
        set(s => ({
          tags: s.tags.filter(t => t.id !== id),
          notes: s.notes.map(n => ({ ...n, tagIds: n.tagIds.filter(tid => tid !== id) })),
          filterTagIds: s.filterTagIds.filter(tid => tid !== id),
        }));
      },

      setSearchQuery: (q) => set({ searchQuery: q }),

      toggleFilterTag: (id) => {
        set(s => ({
          filterTagIds: s.filterTagIds.includes(id)
            ? s.filterTagIds.filter(tid => tid !== id)
            : [...s.filterTagIds, id],
        }));
      },

      clearFilterTags: () => set({ filterTagIds: [] }),

      setSortBy: (sortBy) => set({ sortBy }),

      setTheme: (theme) => set({ theme }),

      filteredNotes: () => {
        const { notes, searchQuery, filterTagIds, sortBy } = get();

        let result = notes.filter(n => {
          if (filterTagIds.length > 0 && !filterTagIds.every(tid => n.tagIds.includes(tid))) return false;
          if (searchQuery) {
            const q = searchQuery.toLowerCase();
            return n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q);
          }
          return true;
        });

        result = [...result].sort((a, b) => {
          // Pinned notes always first
          if (a.pinned && !b.pinned) return -1;
          if (!a.pinned && b.pinned) return 1;

          if (sortBy === 'title') return a.title.localeCompare(b.title, 'ja');
          if (sortBy === 'createdAt') return b.createdAt - a.createdAt;
          return b.updatedAt - a.updatedAt;
        });

        return result;
      },
    }),
    {
      name: 'takenote-storage',
      partialize: (s) => ({
        notes: s.notes,
        tags: s.tags,
        theme: s.theme,
        sortBy: s.sortBy,
      }),
    }
  )
);
