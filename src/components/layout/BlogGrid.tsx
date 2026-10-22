import Image from 'next/image';
import Link from 'next/link';

export interface BlogItem {
  id?: string;
  title: string;
  author: string;
  date: string;
  imageSrc: string;
  tags: string[];
  href: string;
  subtitle: string;
}

export interface BlogGridProps {
  heading?: string;
  description?: string;
  viewAllHref?: string;
  posts?: BlogItem[];
}

const DEFAULT_POSTS: BlogItem[] = [
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

const BlogCard = ({ title, author, date, imageSrc, tags = [], href, subtitle }: BlogItem) => {
  return (
    <Link
      href={href}
      className="group focus-visible:ring-focus-ring flex w-full cursor-pointer flex-col overflow-hidden rounded-lg focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
    >
      {/* Aspect-ratio container prevents layout shifts and fixed-pixel shearing */}
      <div className="bg-muted relative aspect-16/10 w-full overflow-hidden rounded-t-lg">
        <Image
          src={imageSrc}
          alt=""
          aria-hidden="true"
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      <div className="mt-6 flex flex-1 flex-col">
        <p className="text-primary text-sm font-semibold">
          {author} • {date}
        </p>

        <h3 className="text-foreground group-hover:text-primary mt-3 text-2xl leading-tight font-semibold transition-colors">
          {title}
        </h3>

        {/* Tokenized height constraint: enforces baseline alignment across rows */}
        <p className="text-muted-foreground mt-3 line-clamp-2 min-h-12 text-base">{subtitle}</p>

        <div className="mt-6 flex flex-1 flex-col justify-end gap-4 md:flex-row md:items-center md:justify-between">
          {tags.length > 0 ? (
            <ul className="m-0 flex list-none flex-wrap gap-2 p-0" aria-label="Article tags">
              {tags.map((tag) => (
                <li
                  key={tag}
                  className="bg-accent-bg text-accent-text rounded-full px-3 py-1 text-sm font-medium"
                >
                  {tag}
                </li>
              ))}
            </ul>
          ) : (
            <div aria-hidden="true" />
          )}

          <div className="text-primary flex items-center gap-1.5 font-bold group-hover:underline">
            <span>Read more</span>
            <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
              &gt;
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export const BlogGrid = ({
  heading = 'Job search intel and insights',
  description = 'Wondering what others face? Explore anonymous stories from job seekers like you. Get a dose of reality, laugh, connect, and gain valuable insights on your path to landing your dream job!',
  viewAllHref = '/job-insights',
  posts = DEFAULT_POSTS,
}: BlogGridProps) => {
  return (
    <section
      aria-labelledby="blog-grid-heading"
      className="container mx-auto px-4 py-16 md:px-8 md:py-24 lg:px-12"
    >
      <div className="mb-12 flex flex-col items-end justify-between gap-8 md:flex-row">
        <div className="w-full md:w-1/2">
          <h2 id="blog-grid-heading" className="text-foreground text-3xl font-semibold md:text-5xl">
            {heading}
          </h2>
        </div>

        <div className="w-full md:w-1/2">
          <p className="text-muted-foreground text-lg leading-relaxed">{description}</p>

          <Link
            href={viewAllHref}
            className="group focus-visible:ring-focus-ring mt-4 inline-flex items-center gap-2 rounded-md py-2 text-base font-bold focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            <span className="text-primary group-hover:underline">
              Read all
              <span className="sr-only"> articles and insights</span>
            </span>
            <span
              aria-hidden="true"
              className="text-primary transition-transform group-hover:translate-x-1"
            >
              &rarr;
            </span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <BlogCard key={post.id || post.title} {...post} />
        ))}
      </div>
    </section>
  );
};

export default BlogGrid;
