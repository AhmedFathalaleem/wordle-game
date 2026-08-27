import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

export function Button({ children, className, ...props }: ButtonProps) {
  return (
    <button
      type="button"
      className={className ?? 'rounded-md bg-slate-900 px-4 py-2 text-white'}
      {...props}
    >
      {children}
    </button>
  );
}
