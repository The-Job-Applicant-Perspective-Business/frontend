type ActionButtonProps = {
  label: string;
  type?: 'button' | 'submit' | 'reset';
};

const ActionButton = ({ label, type = 'submit' }: ActionButtonProps) => {
  return (
    <button
      type={type}
      className="inline-flex items-center justify-center rounded-md border border-gray-200 bg-[#FAFAFA] px-6 py-3 font-semibold text-gray-900 shadow-sm transition-colors hover:bg-gray-50 focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:outline-none"
    >
      {label}
    </button>
  );
};

export default ActionButton;
