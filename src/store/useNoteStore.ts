import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { Note, Tag, Theme } from '../types';

const TAG_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
  '#f97316', '#eab308', '#22c55e', '#14b8a6', '#3b82f6',
];

interface NoteStore {
  notes: Note[];
  tags: Tag[];
  activeNoteId: string | null;
  searchQuery: string;
  filterTagId: string | null;
  theme: Theme;

  // Note actions
  createNote: () => void;
  updateNote: (id: string, patch: Partial<Pick<Note, 'title' | 'content' | 'tagIds'>>) => void;
  deleteNote: (id: string) => void;
  setActiveNote: (id: string | null) => void;

  // Tag actions
  createTag: (name: string) => Tag;
  updateTag: (id: string, name: string) => void;
  deleteTag: (id: string) => void;

  // Filter/search
  setSearchQuery: (q: string) => void;
  setFilterTagId: (id: string | null) => void;

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
      filterTagId: null,
      theme: 'system',

      createNote: () => {
        const id = uuidv4();
        const now = Date.now();
        const note: Note = {
          id,
          title: '無題のノート',
          content: '',
          tagIds: [],
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
          filterTagId: s.filterTagId === id ? null : s.filterTagId,
        }));
      },

      setSearchQuery: (q) => set({ searchQuery: q }),
      setFilterTagId: (id) => set({ filterTagId: id }),
      setTheme: (theme) => set({ theme }),

      filteredNotes: () => {
        const { notes, searchQuery, filterTagId } = get();
        return notes
          .filter(n => {
            if (filterTagId && !n.tagIds.includes(filterTagId)) return false;
            if (searchQuery) {
              const q = searchQuery.toLowerCase();
              const inTitle = n.title.toLowerCase().includes(q);
              const inContent = n.content.toLowerCase().includes(q);
              return inTitle || inContent;
            }
            return true;
          })
          .sort((a, b) => b.updatedAt - a.updatedAt);
      },
    }),
    {
      name: 'takenote-storage',
      partialize: (s) => ({
        notes: s.notes,
        tags: s.tags,
        theme: s.theme,
      }),
    }
  )
);
