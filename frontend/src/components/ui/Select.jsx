import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';

const Select = ({
  icon: Icon,
  children,
  className = '',
  value,
  onChange,
  name,
  disabled = false,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Extract option details from standard children <option> tags
  const options = React.Children.toArray(children)
    .filter((child) => child && child.type === 'option')
    .map((child) => ({
      value: child.props.value ?? '',
      label: child.props.children ?? '',
      disabled: child.props.disabled ?? false,
    }));

  // Match the active option or fall back to the first available option
  const selectedOption = options.find((opt) => String(opt.value) === String(value)) || options[0];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (opt) => {
    if (opt.disabled) return;
    setIsOpen(false);
    if (onChange && String(opt.value) !== String(value)) {
      onChange({
        target: {
          name,
          value: opt.value,
        },
      });
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${isOpen ? 'z-50' : 'z-0'} ${disabled ? 'opacity-60 cursor-not-allowed' : ''} ${className}`}
    >
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full text-left ${
          Icon ? 'pl-10' : 'pl-4'
        } pr-10 py-2.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 text-sm font-semibold text-slate-800 shadow-sm transition-all flex items-center justify-between group focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 ${
          isOpen ? 'ring-4 ring-brand-500/10 border-brand-500' : ''
        }`}
      >
        <span className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
          {Icon && (
            <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-hover:text-slate-500 transition-colors pointer-events-none" />
          )}
          {selectedOption ? selectedOption.label : 'Select...'}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 group-hover:text-slate-500 transition-transform duration-200 pointer-events-none ${
            isOpen ? 'rotate-180 text-brand-600' : ''
          }`}
        />
      </button>

      {/* Dropdown Options List */}
      <AnimatePresence>
        {isOpen && !disabled && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute z-50 left-0 right-0 mt-1.5 max-h-60 overflow-y-auto bg-white/95 backdrop-blur-xl border border-slate-100 rounded-2xl shadow-xl p-1.5 space-y-0.5"
          >
            {options.length === 0 ? (
              <div className="px-3 py-2 text-xs text-slate-400 font-semibold italic text-center">
                No options available
              </div>
            ) : (
              options.map((opt) => {
                const isSelected = String(opt.value) === String(value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    disabled={opt.disabled}
                    onClick={() => handleSelect(opt)}
                    className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-rose-50 text-brand-600'
                        : opt.disabled
                        ? 'text-slate-300 cursor-not-allowed font-medium'
                        : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <span className="overflow-hidden text-ellipsis whitespace-nowrap">
                      {opt.label}
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-brand-600 flex-shrink-0" />}
                  </button>
                );
              })
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Select;
