'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import { Portal, createContainer } from '@/shared/ui/portal';
import { ButtonContainer } from '@/shared/ui/button';
import { XBold } from '@/shared/ds/icons';
import { Icon } from '@/shared/ui/icon';

import styles from './SideModal.module.scss';

const MODAL_CONTAINER_ID = 'modal-container-id';

export interface SideModalProps {
  onClose?: () => void;
  children?: React.ReactNode;
}

export function SideModal({ onClose, children }: SideModalProps) {
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
          <div className={styles.wrapper}>
            <ButtonContainer
              className={styles.closeButton}
              onClick={handleClose}
            >
              <Icon className={styles.closeIcon} src={XBold} width={20} height={20} />
            </ButtonContainer>
            <div className={styles.content}>
              {children}
            </div>
          </div>
        </div>
    </Portal>)
    : null
  );
}
