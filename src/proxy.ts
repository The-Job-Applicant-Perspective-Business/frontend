import { NextResponse, type NextRequest } from 'next/server';

const customAdminHost = (process.env.NEXT_PUBLIC_TJAP_ADMIN_HOST ?? '').trim().toLowerCase();

const HR_HOSTS = new Set([
  'hr.thejobapplicantperspective.com',
  'hr.localhost:3000',
  'hr.localhost',
]);

const ADMIN_HOSTS = new Set([
  'admin.thejobapplicantperspective.com',
  'admin.localhost:3000',
  'admin.localhost',
  ...(customAdminHost ? [customAdminHost] : []),
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

  // Block direct access to /hr/* (case-insensitive) on non-HR hosts
  if (
    !HR_HOSTS.has(host) &&
    (normalizedPathname === '/hr' || normalizedPathname.startsWith('/hr/'))
  ) {
    const url = request.nextUrl.clone();
    url.pathname = '/404';
    return NextResponse.rewrite(url);
  }

  // Block direct access to /admin/* (case-insensitive) on non-Admin hosts
  if (
    !ADMIN_HOSTS.has(host) &&
    (normalizedPathname === '/admin' || normalizedPathname.startsWith('/admin/'))
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

  // Rewrite admin.thejobapplicantperspective.com/* -> /admin/*
  if (ADMIN_HOSTS.has(host)) {
    const url = request.nextUrl.clone();
    url.pathname = pathname === '/' ? '/admin' : `/admin${pathname}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
};

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?|ttf|eot)$).*)',
  ],
};
