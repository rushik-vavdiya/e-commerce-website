
export default function Select({
  label,
  name,
  options = [],
  placeholder = "Select an option",
  error,
  required = false,
  className = "",
  ...props
}) {
  return (
    <div className={`flex w-full flex-col gap-2 ${className}`}>
      {label && (
        <label
          htmlFor={name}
          className="text-sm font-medium text-slate-700"
        >
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>
      )}

      <select
        id={name}
        name={name}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${name}-error` : undefined}
        className={[
          "min-h-11 w-full rounded-xl border bg-white px-4 py-3",
          "text-sm text-slate-700 outline-none transition",
          "focus:border-blue-500 focus:ring-4 focus:ring-blue-100",
          error ? "border-red-500" : "border-slate-300",
        ].join(" ")}
        {...props}
      >
        <option value="">{placeholder}</option>

        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {error && (
        <p id={`${name}-error`} className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
