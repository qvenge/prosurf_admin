// TODO: Временно отключено - компонент использует удалённую функциональность sessions
// import { TextInput } from '@/shared/ui';
// import { EventFormTimeSlots } from './EventFormTimeSlots';
// import { useEventFormContext } from '../lib/context';
// import styles from './EventForm.module.scss';

export function EventFormSessionDetails() {
  return null;
  // const {
  //   formData,
  //   selectedSessionId,
  //   errors,
  //   rangeMode,
  //   handleSessionChange
  // } = useEventFormContext();

  // const session = formData.sessions.find(s => s.id === selectedSessionId);

  // if (!session) return null;
  // return (
  //   <div className={styles.dateWrapper}>
  //     <div className={styles.dateAndDuration}>
  //       <TextInput
  //         label={rangeMode ? 'Дата начала' : 'Дата'}
  //         type="date"
  //         value={session.date}
  //         onChange={(e) => handleSessionChange(session.id, 'date', e.target.value)}
  //         error={!!errors[`session_${session.id}_date`]}
  //         hint={errors[`session_${session.id}_date`]}
  //       />
  //       {!rangeMode && (
  //         <TextInput
  //           className={styles.duration}
  //           label="Часов"
  //           type="number"
  //           step="0.5"
  //           min="0.5"
  //           max="8"
  //           value={session.duration}
  //           onChange={(e) => handleSessionChange(session.id, 'duration', e.target.value)}
  //         />
  //       )}
  //     </div>
  //     {rangeMode ? (
  //       <TextInput
  //         label='Дата окончания'
  //         type="date"
  //         value={session.endDate || ''}
  //         onChange={(e) => handleSessionChange(session.id, 'endDate', e.target.value)}
  //         error={!!errors[`session_${session.id}_endDate`]}
  //         hint={errors[`session_${session.id}_endDate`]}
  //       />
  //     ) : <EventFormTimeSlots />}
  //   </div>
  // );
}
