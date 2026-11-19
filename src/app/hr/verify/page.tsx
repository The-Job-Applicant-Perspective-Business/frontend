import type { Metadata } from 'next';
import { HrVerifyForm } from '@/components/hr/HrVerifyForm';

export const metadata: Metadata = {
  title: 'Verify Account | The Job Applicant Perspective HR',
  description: 'Request a password reset verification link for your HR employer account.',
  robots: {
    index: false,
    follow: false,
  },
};

const HrVerifyPage = () => {
  return <HrVerifyForm />;
};

export default HrVerifyPage;
