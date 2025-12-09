import { useState, useEffect } from 'react';
import { Button, Select, TextInput, ClientSearchInput, Icon, ButtonContainer } from '@/shared/ui';
import { CopyRegular, CheckRegular } from '@/shared/ds/icons';
import {
  useCreateCertificateAdmin,
  useUpdateCertificateAdmin,
  useCertificateAdmin,
  type AdminCreateCertificateDto,
  type AdminUpdateCertificateDto,
  type Client,
} from '@/shared/api';
import styles from './CertificateForm.module.scss';

interface CertificateFormProps {
  certificateId: string | null;
  onClose: () => void;
}

const typeOptions = [
  { value: 'denomination', label: 'Номинал' },
  { value: 'passes', label: 'Разовый' },
];

const statusOptions = [
  { value: 'PENDING_ACTIVATION', label: 'Ожидает активации' },
  { value: 'ACTIVATED', label: 'Активирован' },
  { value: 'EXPIRED', label: 'Истёк' },
];

export function CertificateForm({ certificateId, onClose }: CertificateFormProps) {
  const isEditing = Boolean(certificateId);

  const { data: certificate, isLoading: isLoadingCertificate } = useCertificateAdmin(certificateId);
  const createMutation = useCreateCertificateAdmin();
  const updateMutation = useUpdateCertificateAdmin();

  // Form state for create
  const [type, setType] = useState<'denomination' | 'passes'>('denomination');
  const [amount, setAmount] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [phoneValue, setPhoneValue] = useState('');

  // Form state for edit
  const [editExpiresAt, setEditExpiresAt] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [copied, setCopied] = useState(false);

  // Load certificate data when editing
  useEffect(() => {
    if (certificate && isEditing) {
      setEditExpiresAt(certificate.expiresAt ? certificate.expiresAt.split('T')[0] : '');
      setEditStatus(certificate.status);
    }
  }, [certificate, isEditing]);

  const handleCreate = () => {
    const data: AdminCreateCertificateDto = {
      type,
      ...(type === 'denomination' && amount
        ? { amount: { amountMinor: Math.round(parseFloat(amount) * 100), currency: 'RUB' } }
        : {}),
      ...(type === 'passes' ? { passes: 1 } : {}),
      ...(expiresAt ? { expiresAt: new Date(expiresAt).toISOString() } : {}),
      ...(selectedClient ? { purchasedByClientId: selectedClient.id } : {}),
    };

    createMutation.mutate(data, {
      onSuccess: () => onClose(),
    });
  };

  const handleUpdate = () => {
    if (!certificateId) return;

    const data: AdminUpdateCertificateDto = {};
    if (editExpiresAt) {
      data.expiresAt = new Date(editExpiresAt).toISOString();
    }
    if (editStatus) {
      data.status = editStatus as AdminUpdateCertificateDto['status'];
    }

    updateMutation.mutate(
      { id: certificateId, data },
      {
        onSuccess: () => onClose(),
      },
    );
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  if (isEditing && isLoadingCertificate) {
    return (
      <div className={styles.root}>
        <p>Загрузка...</p>
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <h3 className={styles.title}>
        {isEditing ? 'Редактировать сертификат' : 'Создать сертификат'}
      </h3>

      <div className={styles.form}>
        {isEditing ? (
          <>
            <div className={styles.field}>
              <span className={styles.label}>Код</span>
              <TextInput value={certificate?.code || ''} readOnly>
                <ButtonContainer
                  onClick={() => {
                    if (certificate?.code) {
                      navigator.clipboard.writeText(certificate.code);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }
                  }}
                >
                  <Icon src={copied ? CheckRegular : CopyRegular} width={20} height={20} />
                </ButtonContainer>
              </TextInput>
            </div>

            {/* <div className={styles.field}>
              <span className={styles.label}>Статус</span>
              <Select
                value={editStatus}
                options={statusOptions}
                onChange={setEditStatus}
                placeholder="Выберите статус"
              />
            </div> */}

            <div className={styles.field}>
              <span className={styles.label}>Срок действия</span>
              <TextInput
                type="date"
                value={editExpiresAt}
                onChange={(e) => setEditExpiresAt(e.target.value)}
              />
            </div>
          </>
        ) : (
          <>
            <div className={styles.field}>
              <span className={styles.label}>Тип сертификата</span>
              <Select
                value={type}
                options={typeOptions}
                onChange={(v) => setType(v as 'denomination' | 'passes')}
                placeholder="Выберите тип"
              />
            </div>

            {type === 'denomination' && (
              <div className={styles.field}>
                <span className={styles.label}>Сумма (руб.)</span>
                <TextInput
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="1000"
                />
              </div>
            )}

            <div className={styles.field}>
              <span className={styles.label}>Срок действия</span>
              <TextInput
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
              />
            </div>

            <div className={styles.field}>
              <span className={styles.label}>Покупатель (опционально)</span>
              <ClientSearchInput
                selectedClient={selectedClient}
                onSelectClient={setSelectedClient}
                phoneValue={phoneValue}
                onPhoneChange={setPhoneValue}
                placeholder="Поиск по телефону"
              />
            </div>
          </>
        )}
      </div>

      <div className={styles.actions}>
        <Button type="secondary" size="m" onClick={onClose} disabled={isPending}>
          Отмена
        </Button>
        <Button
          type="primary"
          size="m"
          onClick={isEditing ? handleUpdate : handleCreate}
          disabled={isPending}
        >
          {isPending ? 'Сохранение...' : isEditing ? 'Сохранить' : 'Создать'}
        </Button>
      </div>
    </div>
  );
}
