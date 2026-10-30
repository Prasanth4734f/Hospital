import React, { forwardRef } from 'react';

export const Input = forwardRef(({
  label,
  error,
  helperText,
  icon: Icon,
  rightElement,
  className = '',
  id,
  name,
  required = false,
  ...props
}, ref) => {
  const inputId = id || name;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
        >
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <div className="relative rounded-lg shadow-sm">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          name={name}
          className={`block w-full rounded-lg border text-sm transition-colors duration-150 py-2.5 ${
            Icon ? 'pl-9' : 'pl-3.5'
          } ${
            rightElement ? 'pr-10' : 'pr-3.5'
          } ${
            error
              ? 'border-rose-400 text-rose-900 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 bg-rose-50/20'
              : 'border-slate-300 text-slate-900 hover:border-slate-400 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 bg-white'
          } disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed ${className}`}
          {...props}
        />
        {rightElement && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {rightElement}
          </div>
        )}
      </div>
      {error ? (
        <p className="mt-1.5 text-xs text-rose-600 font-medium">{error}</p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;

