import { useState, useEffect, useRef } from 'react';
import { type Client, useUpdateClient } from '@/shared/api';
import { TextInput, Button } from '@/shared/ui';
import { APP_TIMEZONE } from '@/shared/lib/timezone';
import styles from './Profile.module.scss';

export interface ProfileProps {
  client: Client;
}

interface FormState {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
}

function formatBirthDate(dateString: string | null | undefined): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  const day = date.toLocaleDateString('ru-RU', { day: '2-digit', timeZone: APP_TIMEZONE });
  const month = date.toLocaleDateString('ru-RU', { month: '2-digit', timeZone: APP_TIMEZONE });
  const year = date.toLocaleDateString('ru-RU', { year: 'numeric', timeZone: APP_TIMEZONE });
  return `${day}.${month}.${year}г`;
}

function getInitials(firstName?: string | null, lastName?: string | null): string {
  const first = firstName?.charAt(0)?.toUpperCase() || '';
  const last = lastName?.charAt(0)?.toUpperCase() || '';
  return first + last || '?';
}

export function Profile({ client }: ProfileProps) {
  const updateClient = useUpdateClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state for editable fields
  const [form, setForm] = useState<FormState>({
    firstName: client.firstName || '',
    lastName: client.lastName || '',
    phone: client.phone || '',
    email: client.email || '',
  });

  // Photo state
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [deletePhoto, setDeletePhoto] = useState(false);

  // Sync form state when client data changes
  useEffect(() => {
    setForm({
      firstName: client.firstName || '',
      lastName: client.lastName || '',
      phone: client.phone || '',
      email: client.email || '',
    });
    // Reset photo state when client changes
    setPhotoFile(null);
    setPhotoPreview(null);
    setDeletePhoto(false);
  }, [client]);

  // Handle form field changes
  const handleChange = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  // Handle photo file selection
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setDeletePhoto(false);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setPhotoPreview(previewUrl);
    }
  };

  // Handle photo deletion
  const handleDeletePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    setDeletePhoto(true);
  };

  // Click on avatar to upload photo
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  // Validation
  const cleanPhone = form.phone.replace(/[\s()-]/g, '');
  const isPhoneValid = !cleanPhone || /^\+?[0-9]{7,15}$/.test(cleanPhone);
  const isEmailValid = !form.email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
  const isValid = isPhoneValid && isEmailValid;

  // Change detection
  const hasTextChanges =
    form.firstName !== (client.firstName || '') ||
    form.lastName !== (client.lastName || '') ||
    form.phone !== (client.phone || '') ||
    form.email !== (client.email || '');
  const hasPhotoChanges = photoFile !== null || deletePhoto;
  const hasChanges = hasTextChanges || hasPhotoChanges;

  // Handle save
  const handleSave = () => {
    if (!hasChanges || !isValid) return;

    const data: {
      firstName?: string | null;
      lastName?: string | null;
      phone?: string | null;
      email?: string | null;
    } = {};

    // Only include changed fields
    if (form.firstName !== (client.firstName || '')) {
      data.firstName = form.firstName || null;
    }
    if (form.lastName !== (client.lastName || '')) {
      data.lastName = form.lastName || null;
    }
    if (form.phone !== (client.phone || '')) {
      data.phone = cleanPhone || null;
    }
    if (form.email !== (client.email || '')) {
      data.email = form.email || null;
    }

    updateClient.mutate({
      id: client.id,
      data,
      photo: photoFile,
      deletePhoto,
    });
  };

  // Determine what to show for avatar
  const showAvatar = () => {
    // If we have a preview (new photo selected), show it
    if (photoPreview) {
      return (
        <img
          className={styles.avatar}
          src={photoPreview}
          alt="Preview"
        />
      );
    }
    // If delete photo is flagged, show initials
    if (deletePhoto) {
      return (
        <div className={styles.avatarPlaceholder}>
          {getInitials(form.firstName, form.lastName)}
        </div>
      );
    }
    // Show existing photo or initials
    if (client.photoUrl) {
      return (
        <img
          className={styles.avatar}
          src={client.photoUrl}
          alt={`${client.firstName || ''} ${client.lastName || ''}`.trim() || 'Avatar'}
        />
      );
    }
    return (
      <div className={styles.avatarPlaceholder}>
        {getInitials(form.firstName, form.lastName)}
      </div>
    );
  };

  // Show delete photo button if there's a photo to delete
  const canDeletePhoto = (client.photoUrl && !deletePhoto) || photoFile;

  return (
    <div className={styles.root}>
      <div className={styles.avatarSection}>
        <button
          type="button"
          className={styles.avatarButton}
          onClick={handleAvatarClick}
          title="Нажмите, чтобы загрузить фото"
        >
          {showAvatar()}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handlePhotoSelect}
          className={styles.hiddenInput}
        />
        {canDeletePhoto && (
          <button
            type="button"
            className={styles.deletePhotoButton}
            onClick={handleDeletePhoto}
          >
            Удалить фото
          </button>
        )}
      </div>

      <div className={styles.inputs}>
        <TextInput
          label="Имя"
          value={form.firstName}
          onChange={handleChange('firstName')}
        />
        <TextInput
          label="Фамилия"
          value={form.lastName}
          onChange={handleChange('lastName')}
        />
        <TextInput
          label="Телефон"
          value={form.phone}
          onChange={handleChange('phone')}
          error={!isPhoneValid}
          hint={!isPhoneValid ? 'Неверный формат телефона' : undefined}
        />
        <TextInput
          label="Email"
          value={form.email}
          onChange={handleChange('email')}
          error={!isEmailValid}
          hint={!isEmailValid ? 'Неверный формат email' : undefined}
        />
        {client.username && (
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Telegram</span>
            <div className={styles.fieldValue}>
              <a
                href={`https://t.me/${client.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.usernameLink}
              >
                @{client.username}
              </a>
            </div>
          </div>
        )}
        {client.dateOfBirth && (
          <TextInput
            label="Дата рождения"
            value={formatBirthDate(client.dateOfBirth)}
            readOnly
          />
        )}
      </div>

      <Button
        type="primary"
        size="l"
        streched
        onClick={handleSave}
        disabled={!hasChanges || !isValid || updateClient.isPending}
      >
        {updateClient.isPending ? 'Сохранение...' : 'Сохранить'}
      </Button>
    </div>
  );
}
