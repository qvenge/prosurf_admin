type EventMap = Record<string, unknown>;
type EventKey<T extends EventMap> = string & keyof T;
type EventHandler<T> = (payload: T) => void;

interface ListenerNode<T> {
  handler: EventHandler<T>;
  once: boolean;
  next: ListenerNode<T> | null;
}

export class EventEmitter<T extends EventMap = EventMap> {
  private listeners: Map<string, ListenerNode<unknown> | null> = new Map();

  on<K extends EventKey<T>>(event: K, handler: EventHandler<T[K]>): () => void {
    return this.addListener(event, handler, false);
  }

  once<K extends EventKey<T>>(event: K, handler: EventHandler<T[K]>): () => void {
    return this.addListener(event, handler, true);
  }

  off<K extends EventKey<T>>(event: K, handler: EventHandler<T[K]>): void {
    const head = this.listeners.get(event);
    if (!head) {
      return;
    }

    if (head.handler === handler) {
      this.listeners.set(event, head.next);
      return;
    }

    let current = head;
    while (current.next) {
      if (current.next.handler === handler) {
        current.next = current.next.next;
        return;
      }
      current = current.next;
    }
  }

  emit<K extends EventKey<T>>(event: K, payload: T[K]): void {
    let current = this.listeners.get(event);
    const toRemove: EventHandler<T[K]>[] = [];

    while (current) {
      const { handler, once, next } = current;
      
      try {
        handler(payload);
      } catch (error) {
        console.error(`EventEmitter: Error in handler for event "${String(event)}":`, error);
      }

      if (once) {
        toRemove.push(handler);
      }

      current = next;
    }

    toRemove.forEach(handler => this.off(event, handler));
  }

  removeAllListeners<K extends EventKey<T>>(event?: K): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }

  listenerCount<K extends EventKey<T>>(event: K): number {
    let count = 0;
    let current = this.listeners.get(event);
    
    while (current) {
      count++;
      current = current.next;
    }
    
    return count;
  }

  private addListener<K extends EventKey<T>>(
    event: K, 
    handler: EventHandler<T[K]>, 
    once: boolean
  ): () => void {
    const node: ListenerNode<T[K]> = {
      handler,
      once,
      next: this.listeners.get(event) || null,
    };

    this.listeners.set(event, node as ListenerNode<unknown>);

    return () => this.off(event, handler);
  }
}