import { create } from 'zustand';

export type SearchStore = {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  clearSearchQuery: () => void;
};

const useSearchStore = create<SearchStore>((set) => ({
  searchQuery: '',
  setSearchQuery: (query: string) => set({ searchQuery: query }),
  clearSearchQuery: () => set({ searchQuery: '' }),
}));

export default useSearchStore;
