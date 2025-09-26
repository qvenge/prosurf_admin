import { Header } from '@/shared/ui';
import { UsersTable } from './components/UsersTable';
import styles from './UsersPage.module.scss';
import type { User } from '@/shared/api';
import { SideModal } from '@/shared/ui';
import { useState } from 'react';

export function UsersPage() {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [userData, setUserData] = useState<User | undefined>(undefined);

  const handleOpen = (user: User) => {
    setUserData(user);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setUserData(undefined);
  };

  return (
    <>
      <Header title={'Абонементы'}>
      </Header>
      <div className={styles.page}>
        <UsersTable
          className={styles.table}
          handleEdit={handleOpen}
        />
      </div>
      {isModalOpen && userData && (
        <SideModal onClose={handleClose}>
          {/* TODO: Add user details component */}
          <div>User: {userData.email}</div>
        </SideModal>
      )}
    </>
  );
}