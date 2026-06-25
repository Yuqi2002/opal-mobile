// Simple pub/sub so the booking screen can tell the appointments list
// "I just created appointment X on date Y — scroll to it and glow."

type ApptInfo = { id: string; date: string };
type Listener = (info: ApptInfo) => void;

const listeners = new Set<Listener>();

export function emitNewAppt(info: ApptInfo) {
  listeners.forEach((fn) => fn(info));
}

export function subscribeNewAppt(fn: Listener) {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}
