import { Header } from '@/shared/ui';
import { UsersTable } from './components/UsersTable';
import styles from './UsersPage.module.scss';
import type { Client } from '@/shared/api';
import { SideModal } from '@/shared/ui';
import { UserCard } from '@/features/user-card';
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
          <UserCard client={clientData} />
        </SideModal>
      )}
    </>
  );
}
