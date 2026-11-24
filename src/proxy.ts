import { NextResponse, type NextRequest } from 'next/server';

const HR_HOSTS = new Set([
  'hr.thejobapplicantperspective.com',
  'hr.localhost:3000',
  'hr.localhost',
]);

const STATIC_ASSET_REGEX = /\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?|ttf|eot|css|js|map)$/i;

export const proxy = (request: NextRequest) => {
  const host = request.headers.get('host')?.toLowerCase() ?? '';
  const { pathname } = request.nextUrl;
  const normalizedPathname = pathname.toLowerCase();

  if (
    normalizedPathname.startsWith('/_next') ||
    normalizedPathname.startsWith('/api') ||
    normalizedPathname === '/favicon.ico' ||
    STATIC_ASSET_REGEX.test(normalizedPathname)
  ) {
    return NextResponse.next();
  }

  // Block direct access to /hr/* (case-insensitive) on the main apex domain
  if (
    !HR_HOSTS.has(host) &&
    (normalizedPathname === '/hr' || normalizedPathname.startsWith('/hr/'))
  ) {
    const url = request.nextUrl.clone();
    url.pathname = '/404';
    return NextResponse.rewrite(url);
  }

  // Rewrite hr.thejobapplicantperspective.com/* -> /hr/*
  if (HR_HOSTS.has(host)) {
    const url = request.nextUrl.clone();
    url.pathname = pathname === '/' ? '/hr' : `/hr${pathname}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
};

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?|ttf|eot)$).*)',
  ],
};
