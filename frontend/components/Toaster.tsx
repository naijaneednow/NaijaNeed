'use client';

import { useTheme } from 'next-themes';
import { Toaster as Sonner } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-white group-[.toaster]:text-slate-950 group-[.toaster]:border-slate-200 group-[.toaster]:shadow-lg dark:group-[.toaster]:bg-slate-900 dark:group-[.toaster]:text-slate-50 dark:group-[.toaster]:border-slate-800 dark:group-[.toaster]:shadow-2xl rounded-2xl p-4 flex gap-4 min-w-[300px]',
          description: 'group-[.toast]:text-slate-500 dark:group-[.toast]:text-slate-400 text-sm leading-relaxed',
          actionButton:
            'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground font-medium',
          cancelButton:
            'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground font-medium',
          success: 'group-[.toaster]:border-emerald-500/50 dark:group-[.toaster]:border-emerald-400/30 group-[.toaster]:bg-emerald-50/50 dark:group-[.toaster]:bg-emerald-950/20',
          error: 'group-[.toaster]:border-rose-500/50 dark:group-[.toaster]:border-rose-400/30 group-[.toaster]:bg-rose-50/50 dark:group-[.toaster]:bg-rose-950/20',
          info: 'group-[.toaster]:border-blue-500/50 dark:group-[.toaster]:border-blue-400/30 group-[.toaster]:bg-blue-50/50 dark:group-[.toaster]:bg-blue-950/20',
          warning: 'group-[.toaster]:border-amber-500/50 dark:group-[.toaster]:border-amber-400/30 group-[.toaster]:bg-amber-50/50 dark:group-[.toaster]:bg-amber-950/20',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
