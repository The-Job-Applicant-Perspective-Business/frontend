import { Suspense } from 'react';
import type { Metadata } from 'next';
import { JobProvider } from '@/components/hr/JobProvider';
import { HrDashboardWorkspace } from '@/components/hr/HrDashboardWorkspace';

export const metadata: Metadata = {
  title: 'HR Dashboard | The Job Applicant Perspective',
  description: 'Manage employer job postings and review candidate applications.',
  robots: {
    index: false,
    follow: false,
  },
};

const HrDashboardPage = () => {
  return (
    <JobProvider>
      <Suspense
        fallback={
          <main
            id="main-content"
            className="flex min-h-screen w-full items-center justify-center bg-white p-6"
          >
            <p role="status" className="text-base font-semibold text-[#0D3276]">
              Loading HR workspace...
            </p>
          </main>
        }
      >
        <HrDashboardWorkspace />
      </Suspense>
    </JobProvider>
  );
};

export default HrDashboardPage;
