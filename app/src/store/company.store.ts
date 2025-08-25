import type { UserCompany } from '@rest/models/userCompany';
import { create } from 'zustand';

export type CompanyStore = {
  selectedCompany?: UserCompany;
  setSelectedCompany: (company: UserCompany | undefined) => void;
  clearSelectedCompany: () => void;
};

const useCompanyStore = create<CompanyStore>((set) => ({
  selectedCompany: undefined,
  setSelectedCompany: (company: UserCompany | undefined) => {
    try {
      set({ selectedCompany: company });
    } catch (error) {
      console.error('Error setting selected company:', error);
    }
  },
  clearSelectedCompany: () => {
    try {
      set({ selectedCompany: undefined });
    } catch (error) {
      console.error('Error clearing selected company:', error);
    }
  },
}));

export default useCompanyStore;
