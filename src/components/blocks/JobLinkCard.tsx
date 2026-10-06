import Link from 'next/link';

type JobLinkCardProps = {
  title: string;
  href: string;
};

const JobLinkCard = ({ title, href }: JobLinkCardProps) => {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex min-h-[80px] items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:outline-none"
    >
      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600">{title}</h3>
      <div aria-hidden="true" className="text-gray-400 transition-colors group-hover:text-blue-600">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  );
};

export default JobLinkCard;
