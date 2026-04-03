'use client';

import { FileText, Download } from 'lucide-react';
import { useState } from 'react';
import api from '@/lib/api';

export default function ReportsPage() {
  const [downloading, setDownloading] = useState(false);

  const downloadCSV = async () => {
    try {
      setDownloading(true);
      const token = localStorage.getItem('nn_admin_token');
      const response = await api.get('/api/admin/reports/needs/csv', {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob', // Important for file download
      });

      // Create a URL for the blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'naijaneed_needs_report.csv');
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (error) {
      console.error('Error downloading CSV', error);
      alert('Failed to download report.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Reports & Exports</h2>
        <p className="text-gray-500 mt-2">Export platform data for offline analysis and record keeping.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center space-x-4 mb-6">
            <div className="h-14 w-14 bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400 rounded-2xl flex items-center justify-center">
              <FileText size={28} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Full Needs Export</h3>
              <p className="text-sm text-gray-500">Download all submissions in CSV format.</p>
            </div>
          </div>
          <button 
            onClick={downloadCSV}
            disabled={downloading}
            className="w-full py-3 px-4 bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-white dark:text-gray-900 text-white rounded-xl font-medium transition flex items-center justify-center disabled:opacity-50"
          >
            {downloading ? (
              'Generating Export...'
            ) : (
              <>
                <Download size={18} className="mr-2" /> Download CSV
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
