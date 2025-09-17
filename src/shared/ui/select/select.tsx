'use client';

import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { Icon } from '@/shared/ui'; 
import { CaretDownFill, CaretUpFill } from '@/shared/ds/icons';

import styles from './select.module.scss';

interface Option {
  label: React.ReactNode;
  value: string;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  options: Option[];
  label?: string;
  value?: string;
  minWidth?: string;
  placeholder?: React.ReactNode;
  align?: 'left' | 'right';
  onChange?: (value: string) => void;
  errorMessage?: string;
}

export function Select({
  options,
  placeholder,
  onChange,
  className,
  style,
  label,
  minWidth,
  align,
  value: inputValue,
  errorMessage,
  ...selectProps
}: SelectProps) {
  const [defaultValue, setDefaultValue] = useState(selectProps.defaultValue);
  const [isOpen, setIsOpen] = useState(false);
  const value = inputValue ?? defaultValue;
  const [highlighted, setHighlighted] = useState(value);
  const ref = useRef<HTMLDivElement>(null);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  const handleSelectOption = (newValue: any) => {
    if (inputValue == null) {
      setDefaultValue(newValue);
    }

    onChange?.(newValue);
    setIsOpen(false);
  };

  useEffect(() => {
    if (isOpen) {
      return;
    }

    function handleSpaceDown(event: KeyboardEvent) {
      if (document.activeElement === ref.current && event.code === 'Space') {
        setIsOpen(true);
      }
    };

    document.addEventListener('keydown', handleSpaceDown);

    return () => {
      document.removeEventListener('keydown', handleSpaceDown);
    };
  }, [isOpen, globalThis.document?.activeElement, ref.current]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeydown(event: KeyboardEvent) {
      switch (event.code) {
        case 'Escape':
          setIsOpen(false);
          break;
        case 'ArrowDown': {
          const index = options.findIndex((opt) => opt.value === highlighted);

          if (index < options.length - 1) {
            setHighlighted(options[index + 1].value);
          } else {
            setHighlighted(options[0].value);
          }

          break;
        }
        case 'ArrowUp': {
          const index = options.findIndex((opt) => opt.value === highlighted);

          if (index > 0) {
            setHighlighted(options[index - 1].value);
          } else {
            setHighlighted(options[options.length - 1].value);
          }

          break;
        }
        case 'Space':
        case 'Enter': {
          handleSelectOption(highlighted);
          break;
        }
      }
    };

    document.addEventListener('keydown', handleKeydown);

    return () => {
      document.removeEventListener('keydown', handleKeydown);
    };
  }, [isOpen, highlighted]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleClickOutside(event: MouseEvent) {
      if (ref.current && ref.current.contains(event.target as Node)) {
        return;
      }

      setIsOpen(false);
    };

    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isOpen]);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div ref={ref} tabIndex={0} className={clsx(
      className,
      styles.root,
      {
        [styles.disabled]: selectProps.disabled,
        [styles.error]: errorMessage,
        [styles.open]: isOpen,
        [styles.notSelected]: selectedOption == null
      }
    )}>
      <label className={styles.wrapper}>
        {label && <div className={styles.label}>{label}</div>}
        <div
          className={styles.select}
          style={style}
        >
          <select
            className={styles.selectItself}
            tabIndex={-1}
            value={value}
            onChange={() => {}}
            hidden
            {...selectProps}
          >
            <option tabIndex={-1} value=""></option>
            {options.map((opt, i) => (
              <option
                tabIndex={-1}
                key={i}
                defaultValue={opt.value}
              >
                {opt.value}
              </option>
            ))}
          </select>
          <div
            className={styles.selectedContentWrapper}
            style={{ minWidth }}
            onClick={toggleOpen}
          >
            <div className={styles.selectedContent}>
              {selectedOption ? selectedOption.label : placeholder}
            </div>
            <Icon
              className={styles.caret}
              src={isOpen ? CaretUpFill : CaretDownFill}
              width={12}
              height={12}
            />
          </div>
          <div
            className={styles.dropdown}
            style={{ [align ?? 'left']: 0 }}
          >
            {options.map((opt, i) => (
              <div
                key={i}
                className={clsx(
                  styles.option,
                  opt.value === value && styles.optionSelected,
                  (opt.value === highlighted && opt.value !== value) && styles.optionHighlighted
                )}
                onClick={() => handleSelectOption(opt.value)}
              >
                <div className={styles.optionContent}>
                  {opt.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </label>
      {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}
    </div>
  );
}