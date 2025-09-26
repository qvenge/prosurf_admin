import { useState } from 'react';
import type { FormData, SessionForm, TimeSlot } from '../types';
import { defaultFormData } from '../constants';
import { generateTimeSlotId, generateSessionId } from '../utils';

export function useEventFormState(initialData: FormData = defaultFormData) {
  const [formData, setFormData] = useState<FormData>(initialData);
  const [selectedSessionId, setSelectedSessionId] = useState<string>(initialData.sessions[0].id);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSessionChange = (sessionId: string, field: keyof Omit<SessionForm, 'timeSlots'>, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      sessions: prev.sessions.map(session =>
        session.id === sessionId ? { ...session, [field]: value } : session
      ),
    }));
  };

  const handleTimeSlotChange = (sessionId: string, timeSlotId: string, field: keyof TimeSlot, value: string) => {
    setFormData(prev => ({
      ...prev,
      sessions: prev.sessions.map(session =>
        session.id === sessionId
          ? {
              ...session,
              timeSlots: session.timeSlots.map(timeSlot =>
                timeSlot.id === timeSlotId ? { ...timeSlot, [field]: value } : timeSlot
              ),
            }
          : session
      ),
    }));
  };

  const addTimeSlot = (sessionId: string) => {
    const newTimeSlot: TimeSlot = {
      id: generateTimeSlotId(),
      startTime: '',
    };
    setFormData(prev => ({
      ...prev,
      sessions: prev.sessions.map(session =>
        session.id === sessionId
          ? { ...session, timeSlots: [...session.timeSlots, newTimeSlot] }
          : session
      ),
    }));
  };

  const removeTimeSlot = (sessionId: string, timeSlotId: string) => {
    setFormData(prev => ({
      ...prev,
      sessions: prev.sessions.map(session =>
        session.id === sessionId
          ? { ...session, timeSlots: session.timeSlots.filter(ts => ts.id !== timeSlotId) }
          : session
      ),
    }));
  };

  const addSession = () => {
    const newSession: SessionForm = {
      id: generateSessionId(),
      date: '',
      timeSlots: [{
        id: generateTimeSlotId(),
        startTime: '',
      }],
      duration: '1.5',
    };
    setFormData(prev => ({
      ...prev,
      sessions: [...prev.sessions, newSession],
    }));
    setSelectedSessionId(newSession.id);
  };

  const removeSession = (sessionId: string) => {
    setFormData(prev => {
      const filteredSessions = prev.sessions.filter(session => session.id !== sessionId);

      if (sessionId === selectedSessionId && filteredSessions.length > 0) {
        setSelectedSessionId(filteredSessions[0].id);
      }

      return {
        ...prev,
        sessions: filteredSessions,
      };
    });
  };

  const setFormDataComplete = (newData: FormData) => {
    setFormData(newData);
    setSelectedSessionId(newData.sessions[0]?.id || '1');
  };

  return {
    formData,
    selectedSessionId,
    setSelectedSessionId,
    setFormData: setFormDataComplete,
    handleInputChange,
    handleSessionChange,
    handleTimeSlotChange,
    addTimeSlot,
    removeTimeSlot,
    addSession,
    removeSession,
  };
}