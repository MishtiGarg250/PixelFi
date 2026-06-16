import type { Response } from 'express';

class SSEManager {
  // Map containing an array of Express Response streams grouped by userId string keys
  private clients: Map<string, Response[]>;

  constructor() {
    this.clients = new Map<string, Response[]>();
  }

  /**
   * Adds an open HTTP response stream connection for a user
   */
  public addClient(userId: string, res: Response): void {
    if (!this.clients.has(userId)) {
      this.clients.set(userId, []);
    }
    this.clients.get(userId)?.push(res);
  }

  /**
   * Drops a dead client connection handle from memory safely
   */
  public removeClient(userId: string, res: Response): void {
    if (!this.clients.has(userId)) return;
    
    const activeList = (this.clients.get(userId) || []).filter(client => client !== res);
    
    if (activeList.length === 0) {
      this.clients.delete(userId);
    } else {
      this.clients.set(userId, activeList);
    }
  }

  /**
   * Pushes a data object payload live down the text stream to all open windows for a user
   */
  public sendToUser(userId: string, data: any): void {
    const userClients = this.clients.get(userId);
    if (!userClients) return;

    // SSE standard notation requires the "data: " prefix and two trailing newlines
    const formattedMessage = `data: ${JSON.stringify(data)}\n\n`;

    userClients.forEach((res: Response) => {
      res.write(formattedMessage);
    });
  }
}

export const sseManager = new SSEManager();