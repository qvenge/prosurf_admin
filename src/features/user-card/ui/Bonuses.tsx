import { useState, useEffect } from 'react';
import { type Client, useClientBonus, useAdjustBonus } from '@/shared/api';
import { Button, TextInput } from '@/shared/ui';
import styles from './Bonuses.module.scss';

export interface BonusesProps {
  client: Client;
}

export function Bonuses({ client }: BonusesProps) {
  const { data: bonusWallet, isLoading, error } = useClientBonus(client.id);
  const adjustBonus = useAdjustBonus();

  const currentBalance = bonusWallet?.balance ?? 0;
  const [inputValue, setInputValue] = useState<string>(currentBalance.toString());

  // Sync input value when bonus data loads
  useEffect(() => {
    if (bonusWallet) {
      setInputValue(bonusWallet.balance.toString());
    }
  }, [bonusWallet]);

  const handleSave = () => {
    const newBalance = parseInt(inputValue, 10);
    if (isNaN(newBalance)) return;

    const delta = newBalance - currentBalance;
    if (delta === 0) return;

    adjustBonus.mutate({
      clientId: client.id,
      amount: delta,
      note: delta > 0 ? 'Начислено администратором' : 'Списано администратором',
    });
  };

  const hasChanges = parseInt(inputValue, 10) !== currentBalance;
  const isValid = !isNaN(parseInt(inputValue, 10)) && parseInt(inputValue, 10) >= 0;

  if (isLoading) {
    return (
      <div className={styles.root}>
        <h2 className={styles.heading}>Бонусы</h2>
        <div className={styles.content}>Загрузка...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.root}>
        <h2 className={styles.heading}>Бонусы</h2>
        <div className={styles.content}>Ошибка загрузки</div>
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <h2 className={styles.heading}>Бонусы</h2>
      <div className={styles.content}>
        <TextInput
          className={styles.input}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          type="number"
          min={0}
        />
      </div>
      <Button
        type="primary"
        size="l"
        streched
        onClick={handleSave}
        disabled={!hasChanges || !isValid || adjustBonus.isPending}
      >
        {adjustBonus.isPending ? 'Сохранение...' : 'Сохранить'}
      </Button>
    </div>
  );
}
