export const Checkbox = ({ isChecked, label, checkHandler, index }) => {
  return (
    <div className="flex items-center mb-1">
      <input
        type="checkbox"
        id={`checkbox-${index}`}
        checked={isChecked}
        onChange={checkHandler}
        className="w-4 h-4 text-blue-600  rounded focus:ring-blue-600 ring-offset-gray-800 focus:ring-2 bg-gray-700 border-gray-600 hover:cursor-pointer"
      />
      <label
        className="ml-2 text-sm font-medium text-gray-900"
        htmlFor={`checkbox-${index}`}
      >
        {label}
      </label>
    </div>
  );
};
