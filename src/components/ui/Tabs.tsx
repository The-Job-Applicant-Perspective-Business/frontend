'use client';

import React, { createContext, useContext, useId, useRef, KeyboardEvent } from 'react';

export type TabsVariant = 'pills' | 'underline';

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

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  onValueChange: (value: string) => void;
  variant?: TabsVariant;
  children: React.ReactNode;
  className?: string;
}

export const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  ({ value, onValueChange, variant = 'pills', children, className = '', ...props }, ref) => {
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
        <div ref={ref} className={`relative flex w-full flex-col ${className}`.trim()} {...props}>
          {children}
        </div>
      </TabsContext.Provider>
    );
  },
);

Tabs.displayName = 'Tabs';

export interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {
  'aria-label'?: string;
}

export const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
  ({ className = '', children, 'aria-label': ariaLabel, ...props }, ref) => {
    const { variant } = useTabs();
    const internalListRef = useRef<HTMLDivElement | null>(null);

    const setRefs = (node: HTMLDivElement | null) => {
      internalListRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;

      const tabs = Array.from(
        internalListRef.current?.querySelectorAll<HTMLButtonElement>(
          '[role="tab"]:not([disabled])',
        ) || [],
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
        ? 'mx-auto flex justify-center gap-2 rounded-lg border border-border bg-background p-1'
        : 'flex w-full gap-4 border-b border-border';

    return (
      <div
        ref={setRefs}
        role="tablist"
        tabIndex={0}
        aria-orientation="horizontal"
        aria-label={ariaLabel}
        onKeyDown={handleKeyDown}
        className={`${containerStyles} ${className}`.trim()}
        {...props}
      >
        {children}
      </div>
    );
  },
);

TabsList.displayName = 'TabsList';

export interface TabTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

export const TabTrigger = React.forwardRef<HTMLButtonElement, TabTriggerProps>(
  ({ value, children, disabled = false, className = '', onClick, ...props }, ref) => {
    const { activeTab, setActiveTab, variant, baseId } = useTabs();
    const isActive = activeTab === value;

    const tabId = `${baseId}-tab-${value}`;
    const panelId = `${baseId}-panel-${value}`;

    const pillStyles = isActive
      ? 'bg-primary text-white shadow-xs'
      : 'bg-background text-muted-foreground hover:bg-muted';

    const underlineStyles = isActive
      ? 'border-b-2 border-primary font-bold text-primary'
      : 'border-b-2 border-transparent text-muted-foreground hover:border-border hover:text-foreground';

    const variantStyles = variant === 'pills' ? pillStyles : underlineStyles;

    const baseStyles =
      'inline-flex items-center justify-center text-sm font-semibold transition-all select-none ' +
      'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ' +
      'disabled:pointer-events-none disabled:opacity-50';

    const layoutStyles = variant === 'pills' ? 'w-40 px-6 py-2 rounded-lg lg:w-48' : 'px-4 py-2';

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(e);
      if (!e.defaultPrevented) {
        setActiveTab(value);
      }
    };

    return (
      <button
        ref={ref}
        id={tabId}
        type="button"
        role="tab"
        aria-selected={isActive}
        aria-controls={panelId}
        tabIndex={isActive ? 0 : -1}
        disabled={disabled}
        onClick={handleClick}
        className={`${baseStyles} ${layoutStyles} ${variantStyles} ${className}`.trim()}
        {...props}
      >
        {children}
      </button>
    );
  },
);

TabTrigger.displayName = 'TabTrigger';

export interface TabPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

export const TabPanel = React.forwardRef<HTMLDivElement, TabPanelProps>(
  ({ value, children, className = '', ...props }, ref) => {
    const { activeTab, baseId } = useTabs();
    const isActive = activeTab === value;

    const tabId = `${baseId}-tab-${value}`;
    const panelId = `${baseId}-panel-${value}`;

    return (
      <div
        ref={ref}
        id={panelId}
        role="tabpanel"
        aria-labelledby={tabId}
        hidden={!isActive}
        tabIndex={0}
        className={`focus-visible:ring-focus-ring focus-visible:ring-offset-background focus-visible:ring-3 focus-visible:ring-offset-2 focus-visible:outline-none ${className}`.trim()}
        {...props}
      >
        {isActive ? children : null}
      </div>
    );
  },
);

TabPanel.displayName = 'TabPanel';
