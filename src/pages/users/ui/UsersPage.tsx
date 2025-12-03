import { useSearchParams } from 'react-router';
import { Header } from '@/shared/ui';
import { UsersTable } from './components/UsersTable';
import styles from './UsersPage.module.scss';
import { useClient } from '@/shared/api';
import { SideModal } from '@/shared/ui';
import { UserCard } from '@/features/user-card';

export function UsersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const clientId = searchParams.get('clientId');
  const { data: clientData } = useClient(clientId ?? '');

  const handleOpen = (telegramId: string) => {
    searchParams.set('clientId', telegramId);
    setSearchParams(searchParams);
  };

  const handleClose = () => {
    searchParams.delete('clientId');
    setSearchParams(searchParams);
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
      {clientId && clientData && (
        <SideModal onClose={handleClose}>
          <UserCard client={clientData} />
        </SideModal>
      )}
    </>
  );
}
