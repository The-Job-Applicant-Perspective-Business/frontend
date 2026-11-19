'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

export interface HrJobFilterValues {
  location: string;
  jobType: string;
  datePosted: string;
  salary: string;
  workPlaceType: string;
}

export const INITIAL_HR_JOB_FILTERS: HrJobFilterValues = {
  location: '',
  jobType: '',
  datePosted: '',
  salary: '',
  workPlaceType: '',
};

interface JobContextValue {
  selectedJobId: string;
  setSelectedJobId: (id: string) => void;
  filterValues: HrJobFilterValues;
  setFilterValues: React.Dispatch<React.SetStateAction<HrJobFilterValues>>;
  filtersApplied: boolean;
  setFiltersApplied: (applied: boolean) => void;
  resetFilters: () => void;
}

const JobContext = createContext<JobContextValue | undefined>(undefined);

export const JobProvider = ({ children }: { children: ReactNode }) => {
  const [selectedJobId, setSelectedJobId] = useState('');
  const [filterValues, setFilterValues] = useState<HrJobFilterValues>(INITIAL_HR_JOB_FILTERS);
  const [filtersApplied, setFiltersApplied] = useState(false);

  const resetFilters = () => {
    setFilterValues(INITIAL_HR_JOB_FILTERS);
    setFiltersApplied(false);
  };

  return (
    <JobContext.Provider
      value={{
        selectedJobId,
        setSelectedJobId,
        filterValues,
        setFilterValues,
        filtersApplied,
        setFiltersApplied,
        resetFilters,
      }}
    >
      {children}
    </JobContext.Provider>
  );
};

export const useHrJobContext = (): JobContextValue => {
  const context = useContext(JobContext);
  if (!context) {
    throw new Error('useHrJobContext must be used within a JobProvider');
  }
  return context;
};
