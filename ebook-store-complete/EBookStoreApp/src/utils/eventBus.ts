type Listener<T = any> = (payload: T) => void;

class EventBus {
  private listeners: Record<string, Set<Listener>> = {};

  on<T = any>(event: string, listener: Listener<T>) {
    if (!this.listeners[event]) this.listeners[event] = new Set();
    this.listeners[event].add(listener as Listener);
    return () => this.off(event, listener as Listener);
  }

  off(event: string, listener: Listener) {
    this.listeners[event]?.delete(listener);
  }

  emit<T = any>(event: string, payload: T) {
    this.listeners[event]?.forEach((listener) => {
      try {
        listener(payload);
      } catch {}
    });
  }
}

export const eventBus = new EventBus();

export type WishlistToggleEvent = {
  book: any;
  inWishlist: boolean;
};


