import Link from 'next/link';

type GoBackButtonProps = {
  label: string;
  href?: string;
};

const GoBackButton = ({ label, href = '/job-insights' }: GoBackButtonProps) => {
  return (
    <Link
      href={href}
      className="group inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-blue-600 focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:outline-none"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
        className="transition-transform group-hover:-translate-x-1"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10 19l-7-7m0 0l7-7m-7 7h18"
        />
      </svg>
      <span>{label}</span>
    </Link>
  );
};

export default GoBackButton;
