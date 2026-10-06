type AuthorSidebarProps = {
  authorName: string;
  postDate: string;
};

const AuthorSidebar = ({ authorName, postDate }: AuthorSidebarProps) => {
  return (
    <aside className="sticky top-[40px] flex flex-col gap-4 rounded-xl border border-gray-200 bg-gray-50 p-6 shadow-sm">
      <div>
        <h3 className="text-xs font-bold tracking-wider text-gray-500 uppercase">Author</h3>
        <p className="mt-1 text-lg font-semibold text-gray-900">{authorName}</p>
      </div>
      <div className="h-px w-full bg-gray-200" aria-hidden="true" />
      <div>
        <h3 className="text-xs font-bold tracking-wider text-gray-500 uppercase">Published</h3>
        <time dateTime={postDate} className="mt-1 block text-gray-700">
          {postDate}
        </time>
      </div>
    </aside>
  );
};

export default AuthorSidebar;
