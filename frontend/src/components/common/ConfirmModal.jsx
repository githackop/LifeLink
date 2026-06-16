import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import Button from '../ui/Button';

const ConfirmModal = ({
  isOpen,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  loading = false,
  isDanger = true,
}) => {
  const modalRef = useRef(null);

  // Close on ESC key down
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !loading) {
        onCancel();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel, loading]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm pointer-events-auto"
            onClick={() => !loading && onCancel()}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative pointer-events-auto w-full max-w-md rounded-2xl border border-slate-100 bg-white shadow-2xl p-6 overflow-hidden flex flex-col gap-4"
            ref={modalRef}
          >
            {/* Header / Icon */}
            <div className="flex items-start gap-4">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  isDanger
                    ? 'bg-red-50 text-red-600'
                    : 'bg-emerald-50 text-emerald-600'
                }`}
              >
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1 space-y-1">
                <h3 className="text-base font-bold text-slate-900 leading-tight">
                  {title}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  {description}
                </p>
              </div>
              {!loading && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Actions footer */}
            <div className="flex gap-3 justify-end pt-2 border-t border-slate-50">
              <Button
                type="button"
                variant="secondary"
                disabled={loading}
                onClick={onCancel}
                className="px-4 py-2 text-xs font-semibold rounded-xl"
              >
                {cancelText}
              </Button>
              <Button
                type="button"
                disabled={loading}
                loading={loading}
                onClick={onConfirm}
                className={`px-4 py-2 text-xs font-semibold rounded-xl text-white border-none ${
                  isDanger
                    ? 'bg-red-600 hover:bg-red-500'
                    : 'bg-emerald-600 hover:bg-emerald-500'
                }`}
              >
                {confirmText}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;
