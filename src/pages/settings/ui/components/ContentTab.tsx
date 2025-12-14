import { useState } from 'react';
import { AlternativeTabs } from '@/shared/ui';
import { HomeSubTab } from './HomeSubTab';
import { TrainingsSubTab } from './TrainingsSubTab';
import { ConsentsSubTab } from './ConsentsSubTab';
import { ArticlesSubTab } from './ArticlesSubTab';
import styles from './ContentTab.module.scss';

const subTabItems = [
  { value: 'home', label: 'Главная' },
  { value: 'trainings', label: 'Тренировки' },
  { value: 'consents', label: 'Согласия' },
  { value: 'articles', label: 'Статьи' },
];

export function ContentTab() {
  const [selectedSubTab, setSelectedSubTab] = useState(subTabItems[0].value);

  return (
    <div className={styles.container}>
      <AlternativeTabs
        items={subTabItems}
        value={selectedSubTab}
        onChange={setSelectedSubTab}
      />
      {selectedSubTab === 'home' && <HomeSubTab />}
      {selectedSubTab === 'trainings' && <TrainingsSubTab />}
      {selectedSubTab === 'consents' && <ConsentsSubTab />}
      {selectedSubTab === 'articles' && <ArticlesSubTab />}
    </div>
  );
}
