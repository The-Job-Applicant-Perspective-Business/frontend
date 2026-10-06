type TabButtonProps = {
  state: 'active' | 'inactive';
  label: string;
  onClick: () => void;
};

const TabButton = ({ state, label, onClick }: TabButtonProps) => {
  const isActive = state === 'active';
  return (
    <button
      role="tab"
      aria-selected={isActive}
      data-state={state}
      onClick={onClick}
      className={`border-b-2 px-4 py-2 font-medium transition-colors focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:outline-none ${isActive ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}
    >
      {label}
    </button>
  );
};

export default TabButton;
