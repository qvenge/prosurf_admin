import { EventEmitter } from './event-emitter';

// Example 1: Define your event map for type safety
type AppEvents = {
  'user:login': { userId: string; email: string };
  'user:logout': { userId: string };
  'data:update': { id: number; value: string };
  'notification:show': { message: string; type: 'info' | 'error' | 'success' };
};

// Create typed emitter
const appEmitter = new EventEmitter<AppEvents>();

// Example 2: Basic usage
const unsubscribe = appEmitter.on('user:login', ({ userId, email }) => {
  console.log(`User ${userId} (${email}) logged in`);
});

// Emit events with type-safe payload
appEmitter.emit('user:login', { 
  userId: '123', 
  email: 'user@example.com' 
});

// Example 3: One-time listeners
appEmitter.once('data:update', ({ id, value }) => {
  console.log(`Data ${id} updated to: ${value}`);
});

// Example 4: Unsubscribe
unsubscribe(); // or
appEmitter.off('user:login', () => {});

// Example 5: Notification system
class NotificationService {
  private emitter = new EventEmitter<AppEvents>();

  subscribe(handler: (notification: AppEvents['notification:show']) => void) {
    return this.emitter.on('notification:show', handler);
  }

  showNotification(message: string, type: 'info' | 'error' | 'success' = 'info') {
    this.emitter.emit('notification:show', { message, type });
  }
}

// Example 6: Generic event emitter (when you don't need strict typing)
const genericEmitter = new EventEmitter();

genericEmitter.on('any-event', (data: unknown) => {
  console.log('Generic event:', data);
});

genericEmitter.emit('any-event', { arbitrary: 'data' });

export { appEmitter, NotificationService };