'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowUpRight, Briefcase, Building2, Eye, MessageSquareText, Users } from 'lucide-react';
import { clearAdminSession, getAdminApiBaseUrl, getStoredAdminToken } from '@/lib/api/adminSession';
import {
  AdminPostsCountResponseSchema,
  AdminViewsAnalyticsResponseSchema,
  type AdminPostsCount,
  type AdminViewsAnalytics,
} from '@/lib/dto/adminPortal';

type DateRangePreset = '7d' | '30d' | '90d';

const RANGE_DAYS: Record<DateRangePreset, number> = {
  '7d': 6,
  '30d': 29,
  '90d': 89,
};

const toIsoDate = (date: Date): string => date.toISOString().split('T')[0];

const buildDateWindow = (preset: DateRangePreset): { startDate: string; endDate: string } => {
  const end = new Date();
  const start = new Date(end);
  start.setDate(end.getDate() - RANGE_DAYS[preset]);
  return {
    startDate: toIsoDate(start),
    endDate: toIsoDate(end),
  };
};

const formatShortDate = (isoDate: string): string => {
  const parsed = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return isoDate;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(parsed);
};

export const AdminDashboardOverview = () => {
  const router = useRouter();
  const [rangePreset, setRangePreset] = useState<DateRangePreset>('7d');
  const [viewsData, setViewsData] = useState<AdminViewsAnalytics | null>(null);
  const [postsData, setPostsData] = useState<AdminPostsCount | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadDashboardTelemetry = useCallback(async () => {
    const token = getStoredAdminToken();
    if (!token) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const apiBaseUrl = getAdminApiBaseUrl();
      const { startDate, endDate } = buildDateWindow(rangePreset);

      const viewsUrl = new URL(`${apiBaseUrl}/api/v1/analytics/views`, window.location.origin);
      viewsUrl.searchParams.set('startDate', startDate);
      viewsUrl.searchParams.set('endDate', endDate);

      const postsUrl = new URL(`${apiBaseUrl}/api/v1/analytics/posts`, window.location.origin);

      const headers = {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      };

      const [viewsRes, postsRes] = await Promise.all([
        fetch(viewsUrl.toString(), { method: 'GET', headers }),
        fetch(postsUrl.toString(), { method: 'GET', headers }),
      ]);

      if (viewsRes.status === 401 || viewsRes.status === 403 || postsRes.status === 401) {
        clearAdminSession();
        router.replace('/login');
        return;
      }

      const [viewsJson, postsJson]: [unknown, unknown] = await Promise.all([
        viewsRes.json().catch(() => null),
        postsRes.json().catch(() => null),
      ]);

      if (!viewsRes.ok) {
        const err = viewsJson as { message?: string } | null;
        throw new Error(err?.message ?? 'Unable to load platform view analytics.');
      }

      if (!postsRes.ok) {
        const err = postsJson as { message?: string } | null;
        throw new Error(err?.message ?? 'Unable to load platform summary counts.');
      }

      const parsedViews = AdminViewsAnalyticsResponseSchema.safeParse(viewsJson);
      const parsedPosts = AdminPostsCountResponseSchema.safeParse(postsJson);

      if (!parsedViews.success || !parsedPosts.success) {
        throw new Error('Invalid analytics telemetry envelope received from server.');
      }

      setViewsData(parsedViews.data.data);
      setPostsData(parsedPosts.data.data);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Unable to load Admin dashboard telemetry.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [rangePreset, router]);

  useEffect(() => {
    void Promise.resolve().then(loadDashboardTelemetry);
  }, [loadDashboardTelemetry]);

  const chartGeometry = useMemo(() => {
    const points = viewsData?.datewiseViews ?? [];
    const width = 760;
    const height = 240;
    const padLeft = 44;
    const padRight = 20;
    const padTop = 20;
    const padBottom = 36;
    const plotWidth = width - padLeft - padRight;
    const plotHeight = height - padTop - padBottom;

    const rawMax = points.reduce(
      (maxVal, item) => Math.max(maxVal, item.jobPageViews, item.reviewPageViews),
      0,
    );
    const yMax = Math.max(4, Math.ceil(rawMax / 4) * 4);

    const stepX = points.length > 1 ? plotWidth / (points.length - 1) : 0;

    const coords = points.map((item, idx) => {
      const x = points.length > 1 ? padLeft + idx * stepX : padLeft + plotWidth / 2;
      const jobY = padTop + plotHeight - (item.jobPageViews / yMax) * plotHeight;
      const reviewY = padTop + plotHeight - (item.reviewPageViews / yMax) * plotHeight;
      return {
        ...item,
        x,
        jobY,
        reviewY,
      };
    });

    const jobPolyline = coords.map((pt) => `${pt.x},${pt.jobY}`).join(' ');
    const reviewPolyline = coords.map((pt) => `${pt.x},${pt.reviewY}`).join(' ');
    const yTicks = [0, 0.25, 0.5, 0.75, 1].map((ratio) => ({
      value: Math.round(yMax * ratio),
      y: padTop + plotHeight - ratio * plotHeight,
    }));

    return {
      width,
      height,
      padLeft,
      padRight,
      coords,
      jobPolyline,
      reviewPolyline,
      yTicks,
    };
  }, [viewsData]);

  return (
    <div className="space-y-6">
      {errorMessage && (
        <div
          role="alert"
          aria-live="assertive"
          className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm font-medium text-red-900"
        >
          {errorMessage}
        </div>
      )}

      {/* Traffic Overview Card */}
      <section
        aria-labelledby="traffic-overview-heading"
        className="rounded-2xl border border-[#E7EBF1] bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
      >
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 id="traffic-overview-heading" className="text-lg font-bold text-[#121212]">
              Traffic Overview
            </h2>
            <p className="mt-0.5 text-sm text-[#595959]">
              Daily portal engagement across job listings and company reviews
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="admin-date-range" className="text-sm font-semibold text-[#374151]">
              Date range
            </label>
            <select
              id="admin-date-range"
              value={rangePreset}
              onChange={(event) => setRangePreset(event.target.value as DateRangePreset)}
              className="h-10 rounded-lg border border-[#D0D9E9] bg-white px-3 text-sm font-semibold text-[#111827] focus:border-[#0D3276] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D3276]"
            >
              <option value="7d">Last week</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </div>
        </div>

        {/* Summary View Counters */}
        <dl className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-[#E7EBF1] bg-[#F8FAFC] p-4">
            <dt className="flex items-center gap-2 text-sm font-semibold text-[#595959]">
              <Eye className="h-4 w-4 text-[#0D3276]" aria-hidden="true" />
              <span>Website Traffic</span>
            </dt>
            <dd className="mt-2 text-2xl font-bold text-[#111827]">
              {isLoading ? '—' : (viewsData?.websiteViews.siteViews ?? 0).toLocaleString()}
            </dd>
          </div>

          <div className="rounded-xl border border-[#E7EBF1] bg-[#F8FAFC] p-4">
            <dt className="flex items-center gap-2 text-sm font-semibold text-[#595959]">
              <span
                aria-hidden="true"
                className="inline-block h-2.5 w-2.5 rounded-full bg-[#0D3276]"
              />
              <span>Job portal views</span>
            </dt>
            <dd className="mt-2 text-2xl font-bold text-[#0D3276]">
              {isLoading ? '—' : (viewsData?.websiteViews.jobPageViews ?? 0).toLocaleString()}
            </dd>
          </div>

          <div className="rounded-xl border border-[#E7EBF1] bg-[#F8FAFC] p-4">
            <dt className="flex items-center gap-2 text-sm font-semibold text-[#595959]">
              <span
                aria-hidden="true"
                className="inline-block h-2.5 w-2.5 rounded-xs bg-[#434343]"
              />
              <span>Review portal views</span>
            </dt>
            <dd className="mt-2 text-2xl font-bold text-[#374151]">
              {isLoading ? '—' : (viewsData?.websiteViews.reviewPageViews ?? 0).toLocaleString()}
            </dd>
          </div>
        </dl>

        {/* Accessible Dual-Series Line Chart */}
        <div className="mt-6">
          {isLoading ? (
            <div role="status" className="h-60 w-full animate-pulse rounded-xl bg-[#F1F5F9]">
              <span className="sr-only">Loading traffic chart...</span>
            </div>
          ) : chartGeometry.coords.length > 0 ? (
            <>
              <div className="w-full overflow-x-auto">
                <svg
                  role="img"
                  aria-label="Dual-series line chart comparing daily Job portal views and Review portal views"
                  viewBox={`0 0 ${chartGeometry.width} ${chartGeometry.height}`}
                  className="h-60 w-full min-w-[520px]"
                >
                  {chartGeometry.yTicks.map((tick) => (
                    <g key={tick.value}>
                      <line
                        x1={chartGeometry.padLeft}
                        x2={chartGeometry.width - chartGeometry.padRight}
                        y1={tick.y}
                        y2={tick.y}
                        stroke="#E7EBF1"
                        strokeWidth="1"
                      />
                      <text
                        x={chartGeometry.padLeft - 8}
                        y={tick.y + 4}
                        textAnchor="end"
                        fill="#595959"
                        fontSize="11"
                      >
                        {tick.value}
                      </text>
                    </g>
                  ))}

                  {chartGeometry.coords.length > 1 && (
                    <>
                      <polyline
                        fill="none"
                        stroke="#0D3276"
                        strokeWidth="2.5"
                        points={chartGeometry.jobPolyline}
                      />
                      <polyline
                        fill="none"
                        stroke="#434343"
                        strokeWidth="2.5"
                        strokeDasharray="6 4"
                        points={chartGeometry.reviewPolyline}
                      />
                    </>
                  )}

                  {chartGeometry.coords.map((pt, index) => {
                    const showLabel =
                      chartGeometry.coords.length <= 10 ||
                      index === 0 ||
                      index === chartGeometry.coords.length - 1 ||
                      index % Math.ceil(chartGeometry.coords.length / 7) === 0;

                    return (
                      <g key={pt.analyticsDate}>
                        <circle cx={pt.x} cy={pt.jobY} r="4" fill="#0D3276" />
                        <rect
                          x={pt.x - 3.5}
                          y={pt.reviewY - 3.5}
                          width="7"
                          height="7"
                          fill="#434343"
                        />
                        {showLabel && (
                          <text
                            x={pt.x}
                            y={chartGeometry.height - 10}
                            textAnchor="middle"
                            fill="#595959"
                            fontSize="11"
                          >
                            {formatShortDate(pt.analyticsDate)}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Screen-reader friendly chronological summary */}
              <details className="mt-3 rounded-lg border border-[#E7EBF1] bg-[#F8FAFC] px-4 py-2.5 text-sm text-[#374151]">
                <summary className="cursor-pointer font-semibold text-[#0D3276] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D3276]">
                  View daily traffic breakdown ({chartGeometry.coords.length} days)
                </summary>
                <ul className="mt-2 grid grid-cols-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-4">
                  {chartGeometry.coords.map((pt) => (
                    <li
                      key={pt.analyticsDate}
                      className="rounded border border-[#E7EBF1] bg-white px-3 py-1.5 text-xs"
                    >
                      <span className="font-bold text-[#111827]">{pt.analyticsDate}:</span>{' '}
                      <span>Job views {pt.jobPageViews}</span>,{' '}
                      <span>Review views {pt.reviewPageViews}</span>
                    </li>
                  ))}
                </ul>
              </details>
            </>
          ) : (
            <p className="rounded-xl border border-dashed border-[#D0D9E9] p-8 text-center text-sm text-[#595959]">
              No traffic telemetry recorded for the selected window.
            </p>
          )}
        </div>
      </section>

      {/* Platform Directory & Moderation Summary Cards */}
      <section aria-labelledby="platform-metrics-heading">
        <h2 id="platform-metrics-heading" className="sr-only">
          Platform Directory and Moderation Totals
        </h2>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* HR Accounts Card */}
          <article className="flex flex-col justify-between rounded-2xl border border-[#E7EBF1] bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E7EBF1] text-[#0D3276]">
                  <Users className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-[#121212]">HR Accounts</h3>
                  <p className="text-xs font-medium text-[#595959]">Registered employer profiles</p>
                </div>
              </div>

              <Link
                href="/hr-management"
                aria-label="Open HR Management"
                className="inline-flex items-center gap-1 rounded-lg border border-[#D0D9E9] px-3 py-1.5 text-xs font-bold text-[#0D3276] hover:bg-[#F1F5F9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D3276]"
              >
                <span>Manage</span>
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>

            <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-[#E7EBF1] pt-4">
              <div>
                <dt className="text-xs font-semibold text-[#595959]">Total HRs signed up</dt>
                <dd className="mt-1 text-2xl font-bold text-[#111827]">
                  {isLoading ? '—' : (viewsData?.totalHrCount ?? 0).toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-[#595959]">Active HRs in range</dt>
                <dd className="mt-1 text-2xl font-bold text-[#0D3276]">
                  {isLoading ? '—' : (viewsData?.activeHrCount ?? 0).toLocaleString()}
                </dd>
              </div>
            </dl>
          </article>

          {/* Job Posts Card */}
          <article className="flex flex-col justify-between rounded-2xl border border-[#E7EBF1] bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E7EBF1] text-[#0D3276]">
                  <Briefcase className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-[#121212]">Classified Job Posts</h3>
                  <p className="text-xs font-medium text-[#595959]">Active and queued listings</p>
                </div>
              </div>

              <Link
                href="/classified"
                aria-label="Open Classified Jobs"
                className="inline-flex items-center gap-1 rounded-lg border border-[#D0D9E9] px-3 py-1.5 text-xs font-bold text-[#0D3276] hover:bg-[#F1F5F9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D3276]"
              >
                <span>Manage</span>
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>

            <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-[#E7EBF1] pt-4">
              <div>
                <dt className="text-xs font-semibold text-[#595959]">Active job posts</dt>
                <dd className="mt-1 text-2xl font-bold text-[#111827]">
                  {isLoading ? '—' : (postsData?.jobCount ?? 0).toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-[#595959]">Pending approval</dt>
                <dd className="mt-1 text-2xl font-bold text-[#B45309]">
                  {isLoading ? '—' : (postsData?.pendingJobCount ?? 0).toLocaleString()}
                </dd>
              </div>
            </dl>
          </article>

          {/* Applicant Reviews Card */}
          <article className="flex flex-col justify-between rounded-2xl border border-[#E7EBF1] bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E7EBF1] text-[#0D3276]">
                  <MessageSquareText className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-[#121212]">Applicant Reviews</h3>
                  <p className="text-xs font-medium text-[#595959]">
                    Published and pending moderation
                  </p>
                </div>
              </div>

              <Link
                href="/reviews"
                aria-label="Open Reviews Moderation"
                className="inline-flex items-center gap-1 rounded-lg border border-[#D0D9E9] px-3 py-1.5 text-xs font-bold text-[#0D3276] hover:bg-[#F1F5F9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D3276]"
              >
                <span>Moderate</span>
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>

            <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-[#E7EBF1] pt-4">
              <div>
                <dt className="text-xs font-semibold text-[#595959]">Active reviews</dt>
                <dd className="mt-1 text-2xl font-bold text-[#111827]">
                  {isLoading ? '—' : (postsData?.reviewCount ?? 0).toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-[#595959]">Pending reviews</dt>
                <dd className="mt-1 text-2xl font-bold text-[#B45309]">
                  {isLoading ? '—' : (postsData?.pendingReviewCount ?? 0).toLocaleString()}
                </dd>
              </div>
            </dl>
          </article>

          {/* Reviewed Companies Card */}
          <article className="flex flex-col justify-between rounded-2xl border border-[#E7EBF1] bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E7EBF1] text-[#0D3276]">
                  <Building2 className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-[#121212]">Reviewed Companies</h3>
                  <p className="text-xs font-medium text-[#595959]">Approved directory entities</p>
                </div>
              </div>

              <Link
                href="/reviews/reviewed-companies"
                aria-label="Open Reviewed Companies Directory"
                className="inline-flex items-center gap-1 rounded-lg border border-[#D0D9E9] px-3 py-1.5 text-xs font-bold text-[#0D3276] hover:bg-[#F1F5F9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D3276]"
              >
                <span>Directory</span>
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>

            <dl className="mt-6 grid grid-cols-1 gap-4 border-t border-[#E7EBF1] pt-4">
              <div>
                <dt className="text-xs font-semibold text-[#595959]">Total approved companies</dt>
                <dd className="mt-1 text-2xl font-bold text-[#111827]">
                  {isLoading ? '—' : (postsData?.companyCount ?? 0).toLocaleString()}
                </dd>
              </div>
            </dl>
          </article>
        </div>
      </section>
    </div>
  );
};
