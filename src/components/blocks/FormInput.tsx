type FormInputProps = {
  type: string;
  placeholder: string;
  name: string;
  id: string;
  ariaLabel?: string;
};

const FormInput = ({ type, placeholder, name, id, ariaLabel }: FormInputProps) => {
  const baseClasses =
    'w-full rounded-md border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors';

  if (type === 'textarea') {
    return (
      <textarea
        name={name}
        id={id}
        placeholder={placeholder}
        aria-label={ariaLabel || placeholder}
        className={baseClasses}
        rows={4}
      />
    );
  }

  return (
    <input
      type={type}
      name={name}
      id={id}
      placeholder={placeholder}
      aria-label={ariaLabel || placeholder}
      className={baseClasses}
    />
  );
};

export default FormInput;
