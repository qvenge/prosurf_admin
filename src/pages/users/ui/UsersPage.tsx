import { Header } from '@/shared/ui';
import { UsersTable } from './components/UsersTable';
import styles from './UsersPage.module.scss';
import type { Client } from '@/shared/api';
import { SideModal } from '@/shared/ui';
import { useState } from 'react';

export function UsersPage() {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [clientData, setClientData] = useState<Client | undefined>(undefined);

  const handleOpen = (client: Client) => {
    setClientData(client);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setClientData(undefined);
  };

  return (
    <>
      <Header title={'Клиенты'}>
      </Header>
      <div className={styles.page}>
        <UsersTable
          className={styles.table}
          handleEdit={handleOpen}
        />
      </div>
      {isModalOpen && clientData && (
        <SideModal onClose={handleClose}>
          {/* TODO: Add client details component */}
          <div>
            <div>Telegram ID: {clientData.telegramId}</div>
            {clientData.username && <div>Username: @{clientData.username}</div>}
            {clientData.firstName && <div>Имя: {clientData.firstName}</div>}
            {clientData.lastName && <div>Фамилия: {clientData.lastName}</div>}
            {clientData.phone && <div>Телефон: {clientData.phone}</div>}
          </div>
        </SideModal>
      )}
    </>
  );
}
