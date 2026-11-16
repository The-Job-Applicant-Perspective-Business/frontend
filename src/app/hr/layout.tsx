import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: {
    default: 'The Job Applicant Perspective | HR',
    template: '%s | The Job Applicant Perspective HR',
  },
  description: 'Employer & HR Portal for The Job Applicant Perspective',
  robots: {
    index: false,
    follow: false,
  },
};

interface HrLayoutProps {
  children: ReactNode;
}

const HrLayout = ({ children }: HrLayoutProps) => {
  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] text-[#111827] antialiased">{children}</div>
  );
};

export default HrLayout;
