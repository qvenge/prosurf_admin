import { Header } from '@/shared/ui';
import { UsersTable } from './components/UsersTable';
import styles from './UsersPage.module.scss';
import { SideModal } from '@/shared/ui';
import { useState } from 'react';

export function UsersPage() {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  return (
    <>
      <Header title={'Пользователи'}>
      </Header>
      <div className={styles.page}>
        <UsersTable className={styles.table} />
      </div>
      {isModalOpen && <SideModal onClose={() => setIsModalOpen(false)}>
        {/* Here will be the form to add a new training or edit existing one */}
      </SideModal>}
    </>
  );
}