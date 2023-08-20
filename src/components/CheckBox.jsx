export const Checkbox = ({ isChecked, label, checkHandler, index }) => {
  return (
    <div className="flex items-center mb-1">
      <input
        type="checkbox"
        id={`checkbox-${index}`}
        checked={isChecked}
        onChange={checkHandler}
        className="w-4 h-4  rounded focus:ring-blue-600 ring-offset-gray-800 focus:ring-2 accent-purple-200 hover:accent-purple-300 hover:cursor-pointer"
      />
      <label
        className="ml-2 text-sm font-medium text-neutral-100"
        htmlFor={`checkbox-${index}`}
      >
        {label}
      </label>
    </div>
  );
};
