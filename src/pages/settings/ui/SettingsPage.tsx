import { useState } from 'react';
import { Header, SegmentedButtons } from '@/shared/ui';
import { ContentTab } from './components';
import styles from './SettingsPage.module.scss';

const tabOptions = [
  { value: 'content', label: 'Контент' },
  { value: 'other', label: 'Другое' },
];

export function SettingsPage() {
  const [selectedTab, setSelectedTab] = useState(tabOptions[0].value);

  return (
    <>
      <Header title={'Настройки'}>
        <SegmentedButtons
          className={styles.tabs}
          options={tabOptions}
          value={selectedTab}
          onChange={(value) => {
            setSelectedTab(value);
          }}
        />
      </Header>
      <div className={styles.page}>
        {selectedTab === 'content' && <ContentTab />}
      </div>
    </>
  );
}