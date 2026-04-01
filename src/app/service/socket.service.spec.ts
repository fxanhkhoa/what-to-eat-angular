import { TestBed } from '@angular/core/testing';
import { SocketService } from './socket.service';

// ── Mock socket.io-client ─────────────────────────────────────────────────────

let mockSocketInstance: any;

const socketEventHandlers: Record<string, Function> = {};
const emittedEvents: { event: string; args: any[] }[] = [];
let mockConnected = false;

function createMockSocket() {
  mockSocketInstance = {
    connected: mockConnected,
    on: (event: string, handler: Function) => {
      socketEventHandlers[event] = handler;
    },
    off: (event: string) => {
      delete socketEventHandlers[event];
    },
    emit: (...args: any[]) => {
      emittedEvents.push({ event: args[0], args: args.slice(1) });
    },
    disconnect: jasmine.createSpy('disconnect'),
  };
  return mockSocketInstance;
}

// Patch socket.io-client at module level via jasmine spyOn on the service
// We intercept `io` by overriding `connect()` in each test via spyOn

describe('SocketService', () => {
  let service: SocketService;

  beforeEach(() => {
    // Reset tracking state
    Object.keys(socketEventHandlers).forEach((k) => delete socketEventHandlers[k]);
    emittedEvents.length = 0;
    mockConnected = false;

    TestBed.configureTestingModule({});
    service = TestBed.inject(SocketService);

    // Patch `connect()` to inject a mock socket without calling real io()
    spyOn(service as any, 'connect').and.callFake(() => {
      if (!(service as any).socket) {
        const s = createMockSocket();
        (service as any).socket = s;

        s.on('connect', () => (service as any).emitConnectionState('connected'));
        s.on('disconnect', () => (service as any).emitConnectionState('disconnected'));
        s.on('connect_error', () => (service as any).emitConnectionState('error'));
      }
    });
  });

  function connectService() {
    (service as any).connect();
  }

  // ── creation ──────────────────────────────────────────────────────────────

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with no socket', () => {
    expect(service.getSocket()).toBeNull();
  });

  it('should start as not connected', () => {
    expect(service.isConnected()).toBe(false);
  });

  // ── connect() ─────────────────────────────────────────────────────────────

  it('should create a socket on connect()', () => {
    connectService();
    expect(service.getSocket()).not.toBeNull();
  });

  it('should not create a second socket if already connected', () => {
    connectService();
    const first = service.getSocket();
    connectService();
    expect(service.getSocket()).toBe(first);
  });

  // ── disconnect() ──────────────────────────────────────────────────────────

  it('should call socket.disconnect() and null out socket on disconnect()', () => {
    connectService();
    const socket = service.getSocket()!;
    service.disconnect();
    expect(socket.disconnect).toHaveBeenCalled();
    expect(service.getSocket()).toBeNull();
  });

  it('should do nothing when disconnect() called with no socket', () => {
    expect(() => service.disconnect()).not.toThrow();
  });

  // ── joinRoom() ────────────────────────────────────────────────────────────

  it('should emit join-room with the roomID', () => {
    connectService();
    service.joinRoom('room-42');
    expect(emittedEvents).toContain(jasmine.objectContaining({ event: 'join-room' }));
    expect(emittedEvents.find((e) => e.event === 'join-room')!.args[0]).toEqual({ roomID: 'room-42' });
  });

  it('should not throw when joinRoom called with no socket', () => {
    expect(() => service.joinRoom('room-1')).not.toThrow();
  });

  // ── emitDishVoteUpdate() ──────────────────────────────────────────────────

  it('should emit dish-vote-update with data and options', () => {
    connectService();
    const data = { slug: 'pho', myName: 'Alice', userID: 'u1', isVoting: true };
    const options = { roomID: 'room-1' };
    service.emitDishVoteUpdate(data, options);

    const evt = emittedEvents.find((e) => e.event === 'dish-vote-update');
    expect(evt).toBeDefined();
    expect(evt!.args[0]).toEqual(data);
    expect(evt!.args[1]).toEqual(options);
  });

  it('should emit dish-vote-update with null userID', () => {
    connectService();
    const data = { slug: 'bun-bo', myName: 'Bob', userID: null, isVoting: false };
    service.emitDishVoteUpdate(data, { roomID: 'room-2' });

    const evt = emittedEvents.find((e) => e.event === 'dish-vote-update');
    expect(evt!.args[0].userID).toBeNull();
  });

  it('should not throw when emitDishVoteUpdate called with no socket', () => {
    expect(() =>
      service.emitDishVoteUpdate({ slug: 'x', myName: 'x', userID: null, isVoting: false }, { roomID: 'r' })
    ).not.toThrow();
  });

  // ── onDishVoteUpdate() ────────────────────────────────────────────────────

  it('should register a listener for dish-vote-update-client', () => {
    connectService();
    service.onDishVoteUpdate().subscribe();
    expect(socketEventHandlers['dish-vote-update-client']).toBeDefined();
  });

  it('should emit data received from dish-vote-update-client event', (done) => {
    connectService();
    const payload = { slug: 'pho', votes: 3 };
    service.onDishVoteUpdate().subscribe((data) => {
      expect(data).toEqual(payload);
      done();
    });
    socketEventHandlers['dish-vote-update-client'](payload);
  });

  it('should unregister listener when observable is unsubscribed', () => {
    connectService();
    const sub = service.onDishVoteUpdate().subscribe();
    sub.unsubscribe();
    expect(socketEventHandlers['dish-vote-update-client']).toBeUndefined();
  });

  it('should not emit when socket is null for onDishVoteUpdate', (done) => {
    // No connect — socket is null
    let emitted = false;
    service.onDishVoteUpdate().subscribe(() => {
      emitted = true;
    });
    setTimeout(() => {
      expect(emitted).toBe(false);
      done();
    }, 10);
  });

  // ── getConnectionState() ──────────────────────────────────────────────────

  it('should return an Observable from getConnectionState()', () => {
    const state$ = service.getConnectionState();
    expect(typeof state$.subscribe).toBe('function');
  });

  it('should emit "connected" when socket connect event fires', (done) => {
    connectService();
    service.getConnectionState().subscribe((state) => {
      expect(state).toBe('connected');
      done();
    });
    socketEventHandlers['connect']();
  });

  it('should emit "disconnected" when socket disconnect event fires', (done) => {
    connectService();
    service.getConnectionState().subscribe((state) => {
      expect(state).toBe('disconnected');
      done();
    });
    socketEventHandlers['disconnect']();
  });

  it('should emit "error" when socket connect_error event fires', (done) => {
    connectService();
    service.getConnectionState().subscribe((state) => {
      expect(state).toBe('error');
      done();
    });
    socketEventHandlers['connect_error']();
  });

  it('should reuse the same underlying Subject across multiple getConnectionState() calls', () => {
    // Both calls should share the same connectionState$ subject (lazy-init once)
    service.getConnectionState();
    const subject1 = (service as any).connectionState$;
    service.getConnectionState();
    const subject2 = (service as any).connectionState$;
    expect(subject1).toBe(subject2);
  });

  // ── isConnected() ─────────────────────────────────────────────────────────

  it('should return false when no socket', () => {
    expect(service.isConnected()).toBe(false);
  });

  it('should return false when socket.connected is false', () => {
    connectService();
    mockSocketInstance.connected = false;
    expect(service.isConnected()).toBe(false);
  });

  it('should return true when socket.connected is true', () => {
    connectService();
    mockSocketInstance.connected = true;
    expect(service.isConnected()).toBe(true);
  });

  // ── getSocket() ───────────────────────────────────────────────────────────

  it('should return null before connect()', () => {
    expect(service.getSocket()).toBeNull();
  });

  it('should return the socket instance after connect()', () => {
    connectService();
    expect(service.getSocket()).toBe(mockSocketInstance);
  });

  it('should return null after disconnect()', () => {
    connectService();
    service.disconnect();
    expect(service.getSocket()).toBeNull();
  });
});
