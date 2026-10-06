import Link from 'next/link';

type NavigationLinkProps = {
  label: string;
  href: string;
  variant?: 'standard' | 'button-styled' | 'footer';
};

const NavigationLink = ({ label, href, variant = 'standard' }: NavigationLinkProps) => {
  const isExternal = href.startsWith('http');
  const baseStyles =
    'inline-flex items-center transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2';
  const variants = {
    standard: 'text-gray-700 hover:text-blue-600',
    'button-styled': 'bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium',
    footer: 'text-gray-500 hover:text-gray-900 text-sm',
  };

  return (
    <Link
      href={href}
      className={`${baseStyles} ${variants[variant]}`}
      data-radix-collection-item="true"
      {...(isExternal && { target: '_blank', rel: 'noopener noreferrer' })}
    >
      {label}
    </Link>
  );
};

export default NavigationLink;
