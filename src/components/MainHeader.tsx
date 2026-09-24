// components/MainHeader.tsx
import Image from 'next/image';
import Link from 'next/link';

export const MainHeader = () => {
  return (
    <header className="absolute top-0 z-50 w-full bg-transparent">
      {/* Mobile Header */}
      <div className="flex items-center justify-between px-4 py-6 lg:hidden">
        <Link href="/" aria-label="Return to Homepage">
          <Image src="/logosm.png" alt="TJAP Logo" width={137} height={22} priority />
        </Link>
        <button aria-haspopup="dialog" aria-expanded="false" aria-label="Open Navigation">
          <Image src="/navCollapse.png" alt="" width={24} height={24} />
        </button>
      </div>

      {/* Desktop Header */}
      <section className="hidden w-full justify-between bg-transparent px-8 py-10 lg:flex lg:px-12">
        <Link href="/" aria-label="Return to Homepage">
          <Image src="/logo.svg" alt="TJAP Logo" width={247} height={41} priority />
        </Link>
        <nav aria-label="Main Desktop Navigation" className="flex items-center space-x-8">
          <ul className="m-0 flex list-none items-center gap-8 p-0">
            <li>
              <Link
                href="/who-we-are"
                className="hover:text-primary focus-visible:ring-ring rounded-md text-base font-semibold text-neutral-700 focus-visible:ring-2 focus-visible:outline-none"
              >
                About Us
              </Link>
            </li>
            <li>
              <Link
                href="/job-insights"
                className="hover:text-primary focus-visible:ring-ring rounded-md text-base font-semibold text-neutral-700 focus-visible:ring-2 focus-visible:outline-none"
              >
                Job Insights
              </Link>
            </li>
            <li className="bg-primary hover:bg-primary/90 rounded-md px-4 py-2 font-semibold text-white transition-colors">
              <Link
                href="https://hr.thejobapplicantperspective.com/login"
                target="_blank"
                rel="noopener noreferrer"
              >
                Sign in as employer
              </Link>
            </li>
          </ul>
        </nav>
      </section>
    </header>
  );
};
