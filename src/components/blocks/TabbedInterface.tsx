'use client';

import React, { useState } from 'react';
import { Tabs, TabsList, TabTrigger, TabPanel } from '@/components/ui/Tabs';
import { SearchInput } from '../ui/SearchInput';

export type TabValue = 'classified' | 'review';

export interface TabbedInterfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultTab?: TabValue;
  className?: string;
}

export const TabbedInterface = React.forwardRef<HTMLDivElement, TabbedInterfaceProps>(
  ({ defaultTab = 'classified', className = '', ...props }, ref) => {
    const [activeTab, setActiveTab] = useState<TabValue>(defaultTab);

    return (
      <section
        ref={ref}
        aria-label="Job Search and Hiring Feedback Interface"
        className={`container mx-auto w-full px-4 py-8 md:px-8 lg:px-12 ${className}`.trim()}
        {...props}
      >
        <Tabs
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as TabValue)}
          variant="pills"
          className="flex w-full flex-col items-center"
        >
          {/* Centered navigation pill capsule */}
          <div className="flex w-full justify-center">
            <TabsList aria-label="Job Insights Navigation" className="mx-auto">
              <TabTrigger value="classified">Classified</TabTrigger>
              <TabTrigger value="review">Hiring Feedback</TabTrigger>
            </TabsList>
          </div>

          <div className="mt-8 mb-10 w-full md:mt-12 md:mb-16">
            <TabPanel value="classified" className="w-full">
              {/* Outer structural framing matching visual telemetry */}
              <div className="border-border bg-background flex w-full flex-col gap-6 rounded-lg border p-4 sm:p-6 lg:p-8">
                <div className="flex w-full flex-col gap-6 lg:flex-row lg:gap-8">
                  <div className="w-full lg:flex-1">
                    <SearchInput />

                    {/* Keyboard-scrollable region with tokenized height and clean offset */}
                    <div
                      tabIndex={0}
                      role="region"
                      aria-label="Search results list"
                      className="focus-visible:ring-focus-ring focus-visible:ring-offset-background mt-4 flex max-h-[32rem] min-h-96 flex-col items-center justify-center gap-3 overflow-y-auto rounded-md p-6 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                    >
                      {/* Document with magnifying glass empty state illustration */}
                      <div className="text-muted-foreground flex flex-col items-center justify-center text-center">
                        <svg
                          className="text-primary/40 mb-3 h-16 w-16 stroke-current"
                          viewBox="0 0 24 24"
                          fill="none"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                          <circle cx="11.5" cy="14.5" r="2.5" />
                          <path d="M13.3 16.3 16 19" />
                        </svg>
                        <p className="text-muted-foreground text-base font-medium">
                          No local search results configured.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Responsive Map Interface Slot */}
                  <div className="border-border bg-muted hidden min-h-96 w-full items-center justify-center rounded-lg border lg:flex lg:flex-1">
                    <h3 className="text-primary text-lg font-bold">Map Interface Placeholder</h3>
                  </div>
                </div>
              </div>
            </TabPanel>

            <TabPanel value="review" className="w-full">
              <div className="border-border bg-background flex min-h-96 w-full items-center justify-center rounded-lg border p-8">
                <p className="text-muted-foreground text-center text-lg">
                  Hiring Feedback functionality isolated.
                </p>
              </div>
            </TabPanel>
          </div>
        </Tabs>
      </section>
    );
  },
);

TabbedInterface.displayName = 'TabbedInterface';

export default TabbedInterface;
