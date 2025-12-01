import { useState } from 'react';
import type { Client } from '@/shared/api';
import { Icon, SegmentedButtons } from '@/shared/ui';
import { UserBold, TicketBold, WalletBold, GiftBold, ClockCounterClockwiseBold } from '@/shared/ds/icons';
import styles from './UserCard.module.scss';
import { Profile } from './Profile';
import { SeasonTickets } from './SeasonTickets';

export interface UserCardProps {
  client: Client;
}

const options = [
  { value: 'profile', label: <Icon src={UserBold} width={20} height={20} /> },
  { value: 'season-tickets', label: <Icon src={TicketBold} width={20} height={20} />  },
  { value: 'bonuses', label: <Icon src={WalletBold} width={20} height={20} />  },
  { value: 'certificates', label: <Icon src={GiftBold} width={20} height={20} />  },
  { value: 'history', label: <Icon src={ClockCounterClockwiseBold} width={20} height={20} />  },
];

export function UserCard({ client }: UserCardProps) {
  const [selectedTab, setSelectedTab] = useState<string>('profile');

  return (
    <div className={styles.root}>
      <SegmentedButtons
        size="s"
        options={options}
        value={selectedTab}
        onChange={setSelectedTab}
      />
      {selectedTab === 'profile' && <Profile client={client} />}
      {selectedTab === 'season-tickets' && <SeasonTickets client={client} />}
    </div>
  );
}