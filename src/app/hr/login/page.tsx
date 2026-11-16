import type { Metadata } from 'next';
import { HrLoginForm } from '@/components/hr';

export const metadata: Metadata = {
  title: 'HR Login',
  description: 'Sign in to The Job Applicant Perspective HR portal.',
};

const HrLoginPage = () => {
  return <HrLoginForm />;
};

export default HrLoginPage;
