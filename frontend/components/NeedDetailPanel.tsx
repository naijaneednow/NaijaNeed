'use client';

import { useTranslations } from 'next-intl';
import { X, CheckCircle2, Circle, Clock, UploadCloud, Loader2 } from 'lucide-react';
import { getCategoryIcon, getStatusConfig } from '@/lib/needsUtils';
import { useReuploadMedia } from '@/hooks/useNeeds';
import { useState } from 'react';
import { useAppToast } from '@/hooks/useAppToast';

interface Need {
  id: number;
  category_id: string;
  description: string;
  status: string;
  admin_notes?: string;
  media_url?: string;
  created_at: string;
  updated_at?: string;
  categories?: { name: string };
}

interface Props {
  need: Need | null;
  onClose: () => void;
}

const TIMELINE_STEPS = [
  { key: 'Submitted',   label: 'timelineSubmitted' },
  { key: 'In Review',   label: 'timelineReviewed' },
  { key: 'In Progress', label: 'timelineAssigned' },
  { key: 'Resolved',    label: 'timelineResolved' },
];

const STATUS_ORDER: Record<string, number> = {
  Submitted: 0,
  'In Review': 1,
  'In Progress': 2,
  Resolved: 3,
  Fulfilled: 3,
};

export default function NeedDetailPanel({ need, onClose }: Props) {
  const t = useTranslations('Dashboard');
  const ts = useTranslations('SubmitPage');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { mutate: reuploadMedia, isPending: uploadingMedia } = useReuploadMedia();
  const { success, error: toastError } = useAppToast();

  if (!need) return null;

  const currentStep = STATUS_ORDER[need.status] ?? 0;
  const categoryLabel = need.category_id
    ? ts(`categories.${need.category_id}`)
    : need.categories?.name ?? 'Need';
  const icon = getCategoryIcon(need.category_id);
  const { label: statusLabel, dot, bg, text } = getStatusConfig(need.status, t);

  const handleReupload = () => {
    if (!selectedFile) return;
    const formData = new FormData();
    formData.append('media', selectedFile);
    
    reuploadMedia({ id: need.id, formData }, {
      onSuccess: () => {
        success('Media uploaded successfully!');
        setSelectedFile(null);
        onClose(); // Alternatively refresh the list
      },
      onError: () => {
        toastError('Failed to upload media.');
      }
    });
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Side Drawer */}
      <aside className="fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-gray-900 z-50 shadow-2xl flex flex-col overflow-y-auto animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900 z-10">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{icon}</span>
            <h2 className="font-bold text-lg text-gray-900 dark:text-white">{t('detailTitle')}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
            aria-label={t('close')}
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 px-6 py-6 space-y-8">
          {/* Status Badge */}
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold ${bg} ${text}`}>
              <span className={`h-2 w-2 rounded-full ${dot}`} />
              {statusLabel}
            </span>
            <span className="text-xs text-gray-400">
              {new Date(need.created_at).toLocaleDateString('en-NG', { day:'numeric', month:'short', year:'numeric' })}
            </span>
          </div>

          {/* Description */}
          <section>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">{t('description')}</p>
            <p className="text-gray-800 dark:text-gray-100 leading-relaxed text-sm">{need.description}</p>
          </section>

          {/* Category */}
          <section>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">{t('category')}</p>
            <span className="inline-flex items-center gap-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-3 py-1.5 rounded-full text-sm font-semibold">
              <span>{icon}</span> {categoryLabel}
            </span>
          </section>

          {/* Media Section */}
          <section>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Media</p>
            {need.media_url ? (
              <div className="mb-4">
                <a href={`http://localhost:5000${need.media_url}`} target="_blank" rel="noopener noreferrer" className="text-green-600 underline text-sm block mb-2">
                  View Attached Media
                </a>
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic mb-4">No media attached.</p>
            )}
            
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
              <p className="text-sm font-semibold mb-2">Upload or Reupload Media</p>
              <input 
                 type="file" 
                 accept="image/*,video/*"
                 onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                       setSelectedFile(e.target.files[0]);
                    }
                 }}
                 className="text-sm text-gray-500 mb-3 block w-full"
              />
              {selectedFile && (
                <button
                  onClick={handleReupload}
                  disabled={uploadingMedia}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {uploadingMedia ? <Loader2 className="animate-spin" size={16} /> : <UploadCloud size={16} />}
                  {uploadingMedia ? 'Uploading...' : 'Upload Media'}
                </button>
              )}
            </div>
          </section>

          {/* Timeline */}
          <section>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">{t('timeline')}</p>
            <ol className="relative ml-3">
              {TIMELINE_STEPS.map((step, idx) => {
                const done = idx <= currentStep;
                const active = idx === currentStep;
                return (
                  <li key={step.key} className="flex items-start gap-4 pb-6 last:pb-0 relative">
                    {/* Vertical line */}
                    {idx < TIMELINE_STEPS.length - 1 && (
                      <span className={`absolute left-3.5 top-7 bottom-0 w-0.5 ${done && idx < currentStep ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
                    )}
                    <span className="relative z-10 mt-0.5 shrink-0">
                      {done ? (
                        <CheckCircle2 size={28} className={active ? 'text-green-500' : 'text-green-400'} fill={active ? 'currentColor' : 'none'} strokeWidth={active ? 2 : 1.5} />
                      ) : (
                        <Circle size={28} className="text-gray-300 dark:text-gray-600" strokeWidth={1.5} />
                      )}
                    </span>
                    <div className="pt-0.5">
                      <p className={`text-sm font-semibold ${done ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                        {t(step.label as any)}
                      </p>
                      {active && (
                        <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                          <Clock size={11} /> {t('submittedOn')} {new Date(need.updated_at || need.created_at).toLocaleDateString('en-NG', { day:'numeric', month:'short', year:'numeric' })}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>

          {/* Admin Notes */}
          <section>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">{t('adminNotes')}</p>
            {need.admin_notes ? (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-2xl p-4 text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                {need.admin_notes}
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">{t('noAdminNotes')}</p>
            )}
          </section>

          {/* SMS History placeholder */}
          <section>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">{t('smsHistory')}</p>
            <div className="bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-4 text-sm text-gray-500 dark:text-gray-400 italic">
              {t('noSms')}
            </div>
          </section>
        </div>
      </aside>
    </>
  );
}
