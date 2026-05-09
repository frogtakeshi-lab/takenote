export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface Note {
  id: string;
  title: string;
  content: string; // TipTap JSON string
  tagIds: string[];
  createdAt: number;
  updatedAt: number;
}

export type Theme = 'light' | 'dark' | 'system';
