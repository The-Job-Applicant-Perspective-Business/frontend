// components/BlogGrid.tsx
import Image from 'next/image';
import Link from 'next/link';

interface BlogCardProps {
  title: string;
  author: string;
  date: string;
  imageSrc: string;
  tags: string[];
  href: string;
  subtitle: string;
}

const BlogCard = ({ title, author, date, imageSrc, tags, href, subtitle }: BlogCardProps) => {
  return (
    <Link
      href={href}
      className="group focus-visible:ring-primary flex w-full cursor-pointer flex-col overflow-hidden rounded-lg focus-visible:ring-2 focus-visible:outline-none"
    >
      <div className="relative h-60 w-full overflow-hidden bg-slate-100">
        <Image
          src={imageSrc}
          alt={`Cover image for ${title}`}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="mt-6">
        <h3 className="text-primary text-sm font-semibold">
          {author} • {date}
        </h3>
        <h4 className="group-hover:text-primary mt-3 text-2xl leading-tight font-semibold text-neutral-800 transition-colors">
          {title}
        </h4>
        <p className="mt-3 line-clamp-2 min-h-[48px] text-base text-neutral-600">{subtitle}</p>

        <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <ul className="m-0 flex list-none flex-wrap gap-2 p-0" aria-label="Article tags">
            {tags.map((tag) => (
              <li
                key={tag}
                className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700"
              >
                {tag}
              </li>
            ))}
          </ul>
          <div className="text-primary flex items-center gap-2 font-bold group-hover:underline">
            <span>Read more</span>
            <span aria-hidden="true">&gt;</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export const BlogGrid = () => {
  const blogs = [
    {
      title: 'Building the Future of Job Searching: Explore Our Growing Research Archive',
      author: 'Sarah Springsteen Trumble',
      date: 'July 23, 2025',
      imageSrc: '/chatgpt-image-jul-23-2025.png',
      tags: [],
      href: '/job-insights/building-the-future',
      subtitle: 'How We Advocate Academically For Paradigm Shift',
    },
    {
      title: 'Our Research: Unpacking the Hidden Forces Shaping Modern Labor Markets',
      author: 'Sarah Springsteen Trumble',
      date: 'July 19, 2025',
      imageSrc: '/chatgpt-image-jul-19-2025.png',
      tags: ['New Tech', 'New World', 'Research'],
      href: '/job-insights/why-online-hiring-fails',
      subtitle: 'A New Theory Why Online Hiring Fails Job Seekers',
    },
    {
      title: 'The Case Concerning Legalized Job Scraping',
      author: 'Jay Jones',
      date: 'May 30, 2025',
      imageSrc: '/job-scraping.png',
      tags: [],
      href: '/job-insights/scratching-the-surface',
      subtitle: 'What is it, and why is it allowed?',
    },
  ];

  return (
    <section className="container mx-auto px-4 py-16 md:px-8 md:py-24 lg:px-12">
      <div className="mb-12 flex flex-col items-end justify-between gap-8 md:flex-row">
        <div className="w-full md:w-1/2">
          <h2 className="text-3xl font-semibold text-neutral-900 md:text-5xl">
            Job search intel and insights
          </h2>
        </div>
        <div className="w-full md:w-1/2">
          <p className="text-lg text-neutral-600">
            Wondering what others face? Explore anonymous stories from job seekers like you. Get a
            dose of reality, laugh, connect, and gain valuable insights on your path to landing your
            dream job!
          </p>
          <Link
            href="/job-insights"
            className="group focus-visible:ring-primary mt-4 flex w-fit items-center gap-2 rounded-md focus-visible:ring-2 focus-visible:outline-none"
          >
            <span className="text-primary font-bold group-hover:underline">Read all</span>
            <Image src="/rightarrow.svg" alt="" width={24} height={24} aria-hidden="true" />
          </Link>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {blogs.map((blog) => (
          <BlogCard key={blog.title} {...blog} />
        ))}
      </div>
    </section>
  );
};
