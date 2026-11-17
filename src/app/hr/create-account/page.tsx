import type { Metadata } from 'next';
import { HrCreateAccountForm } from '@/components/hr';

export const metadata: Metadata = {
  title: 'Create an HR Account',
  description: 'Register an employer or HR account on The Job Applicant Perspective.',
};

const HrCreateAccountPage = () => {
  return <HrCreateAccountForm />;
};

export default HrCreateAccountPage;
