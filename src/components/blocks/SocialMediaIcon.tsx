import Image from 'next/image';
import Link from 'next/link';

type SocialMediaIconProps = {
  href: string;
  iconSrc: string;
  alt: string;
};

const SocialMediaIcon = ({ href, iconSrc, alt }: SocialMediaIconProps) => {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={alt}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 transition-transform hover:scale-110 hover:bg-gray-200 focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:outline-none"
    >
      <Image
        src={iconSrc}
        alt=""
        aria-hidden="true"
        width={20}
        height={20}
        className="h-5 w-5"
        loading="lazy"
      />
    </Link>
  );
};

export default SocialMediaIcon;
