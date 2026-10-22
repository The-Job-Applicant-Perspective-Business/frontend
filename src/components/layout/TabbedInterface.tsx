'use client';

import React, { useState } from 'react';
import { Tabs, TabsList, TabTrigger, TabPanel } from '@/components/ui/Tabs';
import { SearchInput } from './SearchInput';

export type TabValue = 'classified' | 'review';

export interface TabbedInterfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultTab?: TabValue;
  className?: string;
}

export const TabbedInterface = React.forwardRef<HTMLDivElement, TabbedInterfaceProps>(
  ({ defaultTab = 'classified', className = '', ...props }, ref) => {
    const [activeTab, setActiveTab] = useState<TabValue>(defaultTab);

    return (
      <div ref={ref} className={`w-full ${className}`.trim()} {...props}>
        <Tabs
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as TabValue)}
          variant="pills"
          className="w-full"
        >
          <TabsList aria-label="Job Insights Navigation">
            <TabTrigger value="classified">Classified</TabTrigger>
            <TabTrigger value="review">Hiring Feedback</TabTrigger>
          </TabsList>

          <div className="mt-8 mb-10 w-full md:mt-12 md:mb-16">
            <TabPanel value="classified" className="w-full">
              <div className="flex w-full flex-col gap-5 lg:flex-row xl:gap-12">
                <div className="w-full lg:w-full xl:w-1/2">
                  <SearchInput />
                  <div
                    tabIndex={0}
                    role="region"
                    aria-label="Search results list"
                    className="focus-visible:ring-focus-ring focus-visible:ring-offset-background mt-4 flex h-100 flex-col gap-2 overflow-y-auto rounded-md focus-visible:ring-3 focus-visible:ring-offset-2 focus-visible:outline-none md:gap-3"
                  >
                    <p className="text-muted-foreground mt-8 text-center">
                      No local search results configured.
                    </p>
                  </div>
                </div>

                <div className="border-border bg-muted hidden w-full items-center justify-center rounded-lg border lg:flex lg:h-175 xl:w-1/2">
                  <h3 className="text-primary font-bold">Map Interface Placeholder</h3>
                </div>
              </div>
            </TabPanel>

            <TabPanel value="review" className="w-full">
              <p className="text-muted-foreground text-center">
                Hiring Feedback functionality isolated.
              </p>
            </TabPanel>
          </div>
        </Tabs>
      </div>
    );
  },
);

TabbedInterface.displayName = 'TabbedInterface';

export default TabbedInterface;
