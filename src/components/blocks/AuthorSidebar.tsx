import React from 'react';

export interface AuthorSidebarProps {
  authorName: string;
  postDate: string;
  className?: string;
}

export const AuthorSidebar = ({ authorName, postDate, className = '' }: AuthorSidebarProps) => {
  return (
    <aside
      aria-label="Author and publication details"
      className={`border-border bg-muted sticky top-10 flex flex-col gap-4 rounded-xl border p-6 shadow-xs ${className}`.trim()}
    >
      <div>
        <p className="text-muted-foreground text-xs font-bold tracking-wider uppercase">Author</p>
        <p className="text-foreground mt-1 text-lg font-semibold">{authorName}</p>
      </div>

      <div className="bg-border h-px w-full" aria-hidden="true" />

      <div>
        <p className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
          Published
        </p>
        <time dateTime={postDate} className="text-foreground/80 mt-1 block text-sm">
          {postDate}
        </time>
      </div>
    </aside>
  );
};

export default AuthorSidebar;
