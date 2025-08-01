import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { environment } from '@/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket | null = null;

  connect(): void {
    if (!this.socket) {
      this.socket = io(environment.SOCKET_ENDPOINT, {
        transports: ['websocket', 'polling']
      });
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinRoom(roomID: string): void {
    if (this.socket) {
      this.socket.emit('join-room', { roomID });
    }
  }

  emitDishVoteUpdate(data: {
    slug: string;
    myName: string;
    userID: string | null;
    isVoting: boolean;
  }, options: { roomID: string }): void {
    if (this.socket) {
      this.socket.emit('dish-vote-update', data, options);
    }
  }

  onDishVoteUpdate(): Observable<any> {
    return new Observable(observer => {
      if (this.socket) {
        this.socket.on('dish-vote-update-client', (data) => {
          observer.next(data);
        });
      }
      
      return () => {
        if (this.socket) {
          this.socket.off('dish-vote-update-client');
        }
      };
    });
  }

  private emitConnectionState(state: string): void {
    if (!this.connectionState$) {
      this.connectionState$ = new Subject<string>();
    }
    (this.connectionState$ as Subject<string>).next(state);
  }

  getConnectionState(): Observable<string> {
    if (!this.connectionState$) {
      this.connectionState$ = new Subject<string>();
    }
    return this.connectionState$.asObservable();
  }
}
