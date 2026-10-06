import Image from 'next/image';

const BlogCard = ({
  imageSrc,
  metaText,
  title,
  description,
  tags = [],
}: {
  imageSrc: string;
  metaText: string;
  title: string;
  description: string;
  tags?: string[];
}) => {
  return (
    <div className="w-full cursor-pointer overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-shadow focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2 hover:shadow-lg">
      <Image
        src={imageSrc}
        alt={title}
        width={800}
        height={480}
        className="h-48 w-full object-cover"
        loading="lazy"
        unoptimized
      />
      <div className="p-6">
        <h6 className="mb-2 text-xs font-bold tracking-wider text-gray-500 uppercase">
          {metaText}
        </h6>
        <h3 className="mb-3 text-xl font-bold text-gray-900">{title}</h3>
        <p className="mb-4 line-clamp-3 text-gray-600">{description}</p>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BlogCard;
