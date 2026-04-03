import React from 'react';

export const Card = ({ children, className = '' }: any) => (
  <div className={`bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-50 dark:border-gray-700 overflow-hidden ${className}`}>
    {children}
  </div>
);

export const CardHeader = ({ children, className = '' }: any) => (
  <div className={`p-6 border-b dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/80 ${className}`}>
    {children}
  </div>
);

export const CardTitle = ({ children, className = '' }: any) => (
  <h3 className={`text-lg font-bold tracking-tight text-gray-900 dark:text-white ${className}`}>
    {children}
  </h3>
);

export const CardContent = ({ children, className = '' }: any) => (
  <div className={`p-8 ${className}`}>
    {children}
  </div>
);
