'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import clsx from 'clsx';
import { Portal, createContainer } from '@/shared/ui/portal';
import { ButtonContainer } from '@/shared/ui/button';
import { XBold } from '@/shared/ds/icons';
import { Icon } from '@/shared/ui/icon';

import styles from './modal.module.scss';

const MODAL_CONTAINER_ID = 'modal-container-id';

export interface ModalProps {
  onClose?: () => void;
  children?: React.ReactNode;
  /** Modal size variant - controls max-width */
  size?: 'sm' | 'md' | 'lg' | 'auto';
  /** Whether to show the close (X) button - defaults to true */
  showCloseButton?: boolean;
  /** Additional className for the content wrapper */
  contentClassName?: string;
}

export function Modal({
  onClose,
  children,
  size = 'md',
  showCloseButton = true,
  contentClassName,
}: ModalProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [isMounted, setMounted] = useState(false);
  const mouseDownOnOverlay = useRef(false);

  useEffect(() => {
    createContainer({ id: MODAL_CONTAINER_ID });
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleEscapePress = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose?.();
      }
    };

    window.addEventListener('keydown', handleEscapePress);

    return () => {
      window.removeEventListener('keydown', handleEscapePress);
    };
  }, [onClose]);

  const handleOverlayMouseDown = useCallback(() => {
    mouseDownOnOverlay.current = true;
  }, []);

  const handleOverlayMouseUp = useCallback(() => {
    if (mouseDownOnOverlay.current) {
      onClose?.();
    }
    mouseDownOnOverlay.current = false;
  }, [onClose]);

  const handleOverlayMouseLeave = useCallback(() => {
    mouseDownOnOverlay.current = false;
  }, []);

  const handleClose: () => void =
  useCallback(() => {
    onClose?.();
  }, [onClose]);

  const sizeClass = {
    sm: styles.contentSizeSm,
    md: styles.contentSizeMd,
    lg: styles.contentSizeLg,
    auto: styles.contentSizeAuto,
  }[size];

  return (
    isMounted
    ? (<Portal id={MODAL_CONTAINER_ID}>
        <div className={styles.layer} ref={rootRef}>
          <div
            className={styles.overlay}
            ref={overlayRef}
            onMouseDown={handleOverlayMouseDown}
            onMouseUp={handleOverlayMouseUp}
            onMouseLeave={handleOverlayMouseLeave}
          />
          <div className={clsx(styles.content, sizeClass, contentClassName)}>
            {showCloseButton && (
              <ButtonContainer
                className={styles.closeButton}
                onClick={handleClose}
              >
                <Icon className={styles.closeIcon} src={XBold} width={24} height={24} />
              </ButtonContainer>
            )}
            {children}
          </div>
        </div>
    </Portal>)
    : null
  );
}
