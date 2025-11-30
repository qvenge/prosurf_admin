// TODO: Временно отключено - компонент использует удалённую функциональность sessions
// import { AlternativeTabs, Button, ButtonContainer, Icon } from '@/shared/ui';
// import { PlusBold, TrashRegular } from '@/shared/ds/icons';
// import { EventFormSessionDetails } from './EventFormSessionDetails';
// import { formatDateForDisplay } from '../lib/utils';
// import { useEventFormContext } from '../lib/context';
// import styles from './EventForm.module.scss';

export function EventFormSessions() {
  return null;
  // const {
  //   formData,
  //   selectedSessionId,
  //   setSelectedSessionId,
  //   rangeMode,
  //   removeSession,
  //   addSession
  // } = useEventFormContext();

  // const sessions = formData.sessions;
  // const selectedSession = sessions.find(session => session.id === selectedSessionId);

  // return (
  //   <>
  //     {!rangeMode && (
  //       <AlternativeTabs
  //         className={styles.dateTabs}
  //         items={sessions.map((session, i) => ({
  //           label: (
  //             <>
  //               {session.date ? formatDateForDisplay(session.date) : `${rangeMode ? 'Даты' : 'Дата'} ${i + 1}`}
  //               {sessions.length > 1 && (
  //                 <ButtonContainer onClick={() => removeSession(session.id)}>
  //                   <Icon className={styles.removeIcon} src={TrashRegular} width={20} height={20} />
  //                 </ButtonContainer>
  //               )}
  //             </>
  //           ),
  //           value: session.id
  //         }))}
  //         value={selectedSessionId}
  //         onChange={setSelectedSessionId}
  //       />
  //     )}

  //     <div className={styles.sessionsSection}>
  //       {selectedSession && (
  //         <EventFormSessionDetails key={selectedSession.id} />
  //       )}
  //     </div>

  //     {!rangeMode && (
  //       <Button
  //         type="secondary"
  //         size="l"
  //         streched={true}
  //         onClick={addSession}
  //         className={styles.addSessionButton}
  //       >
  //         <Icon src={PlusBold} width={20} height={20} />
  //         Добавить ещё дату
  //       </Button>
  //     )}
  //   </>
  // );
}
