'use client';

import React, { createContext, useContext, useId, useRef, KeyboardEvent } from 'react';

type TabsVariant = 'pills' | 'underline';

interface TabsContextValue {
  activeTab: string;
  setActiveTab: (id: string) => void;
  variant: TabsVariant;
  baseId: string;
}

const TabsContext = createContext<TabsContextValue | null>(null);

const useTabs = () => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs compound components must be rendered within a Tabs provider.');
  }
  return context;
};

export interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  variant?: TabsVariant;
  children: React.ReactNode;
  className?: string;
}

export const Tabs = ({
  value,
  onValueChange,
  variant = 'pills',
  children,
  className = '',
}: TabsProps) => {
  const baseId = useId();

  return (
    <TabsContext.Provider
      value={{
        activeTab: value,
        setActiveTab: onValueChange,
        variant,
        baseId,
      }}
    >
      <div className={`relative flex w-full flex-col ${className}`.trim()}>{children}</div>
    </TabsContext.Provider>
  );
};

export interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {
  'aria-label'?: string;
}

export const TabsList = ({
  className = '',
  children,
  'aria-label': ariaLabel,
  ...props
}: TabsListProps) => {
  const { variant } = useTabs();
  const listRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;

    const tabs = Array.from(
      listRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]:not([disabled])') || [],
    );
    if (!tabs.length) return;

    const currentIndex = tabs.findIndex((tab) => tab === document.activeElement);
    if (currentIndex === -1) return;

    e.preventDefault();
    let nextIndex = e.key === 'ArrowRight' ? currentIndex + 1 : currentIndex - 1;

    if (nextIndex >= tabs.length) nextIndex = 0;
    if (nextIndex < 0) nextIndex = tabs.length - 1;

    tabs[nextIndex].focus();
    tabs[nextIndex].click();
  };

  const containerStyles =
    variant === 'pills'
      ? 'border-border bg-background mx-auto flex justify-center gap-2 rounded-lg border p-1'
      : 'border-b border-border flex gap-4 w-full';

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-orientation="horizontal"
      aria-label={ariaLabel}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className={`${containerStyles} ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  );
};

export interface TabTriggerProps {
  value: string;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

export const TabTrigger = ({
  value,
  children,
  disabled = false,
  className = '',
}: TabTriggerProps) => {
  const { activeTab, setActiveTab, variant, baseId } = useTabs();
  const isActive = activeTab === value;

  const tabId = `${baseId}-tab-${value}`;
  const panelId = `${baseId}-panel-${value}`;

  const pillStyles = isActive
    ? 'bg-primary text-white shadow-md'
    : 'bg-background text-muted-foreground hover:bg-muted';

  const underlineStyles = isActive
    ? 'border-b-2 border-primary text-primary font-bold'
    : 'border-b-2 border-transparent text-muted-foreground hover:border-border hover:text-foreground';

  const variantStyles = variant === 'pills' ? pillStyles : underlineStyles;

  const baseStyles =
    'inline-flex items-center justify-center text-sm font-semibold transition-all select-none ' +
    'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ' +
    'disabled:pointer-events-none disabled:opacity-50';

  const layoutStyles = variant === 'pills' ? 'w-40 lg:w-48 px-6 py-2 rounded-lg' : 'px-4 py-2';

  return (
    <button
      id={tabId}
      type="button"
      role="tab"
      aria-selected={isActive}
      aria-controls={panelId}
      tabIndex={isActive ? 0 : -1}
      disabled={disabled}
      onClick={() => setActiveTab(value)}
      className={`${baseStyles} ${layoutStyles} ${variantStyles} ${className}`.trim()}
    >
      {children}
    </button>
  );
};

export interface TabPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

export const TabPanel = ({ value, children, className = '', ...props }: TabPanelProps) => {
  const { activeTab, baseId } = useTabs();
  const isActive = activeTab === value;

  const tabId = `${baseId}-tab-${value}`;
  const panelId = `${baseId}-panel-${value}`;

  return (
    <div
      id={panelId}
      role="tabpanel"
      aria-labelledby={tabId}
      hidden={!isActive}
      className={`focus-visible:ring-focus-ring focus-visible:ring-offset-background focus-visible:ring-3 focus-visible:ring-offset-2 focus-visible:outline-none ${className}`.trim()}
      {...props}
    >
      {isActive ? children : null}
    </div>
  );
};
