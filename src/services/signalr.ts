import * as signalR from "@microsoft/signalr";
import { Message } from "../types";

class SignalRService {
  private connection: signalR.HubConnection | null = null;
  private onMessageReceived: ((message: Message) => void) | null = null;
  private onMessageRead: ((messageId: number) => void) | null = null;
  private onOnlineUsersUpdated: ((userIds: string[]) => void) | null = null;

  async connect(token: string): Promise<void> {
    if (this.connection) {
      await this.disconnect();
    }

    const signalRUrl =
      import.meta.env.VITE_SIGNALR_URL ||
      "http://todo-app.polandcentral.cloudapp.azure.com:5005/chatHub";

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(signalRUrl, {
        accessTokenFactory: () => token,
      })

      .withAutomaticReconnect()
      .build();

    this.connection.on(
      "ReceiveMessage",
      (
        messageText: string,
        senderId: string,
        messageId: number,
        sentAt: string
      ) => {
        if (this.onMessageReceived) {
          const message: Message = {
            id: messageId,
            senderId,
            recipientId: "",
            text: messageText,
            sentAt,
            isRead: false,
          };
          this.onMessageReceived(message);
        }
      }
    );

    this.connection.on("MessageRead", (messageId: number) => {
      if (this.onMessageRead) {
        this.onMessageRead(messageId);
      }
    });

    this.connection.on("UpdateOnlineUsers", (onlineUserIds: string[]) => {
      if (this.onOnlineUsersUpdated) {
        this.onOnlineUsersUpdated(onlineUserIds);
      }
    });

    try {
      await this.connection.start();
      console.log("SignalR Connected");
    } catch (error) {
      console.error("SignalR Connection Error:", error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.stop();
      this.connection = null;
    }
  }

  async sendMessage(
    messageText: string,
    recipientId: string,
    senderId: string
  ): Promise<void> {
    if (!this.connection) {
      throw new Error("SignalR connection not initialized");
    }

    // ⚠️ انتظر الاتصال لو مش متصل
    if (this.connection.state !== signalR.HubConnectionState.Connected) {
      try {
        await this.connection.start(); // إعادة محاولة الاتصال
      } catch (error) {
        console.error("Failed to reconnect SignalR:", error);
        throw new Error("SignalR connection not established");
      }
    }

    await this.connection.invoke(
      "SendMessage",
      messageText,
      recipientId,
      senderId
    );
  }

  async notifyMessageRead(
    messageId: number,
    recipientId: string
  ): Promise<void> {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      await this.connection.invoke("NotifyMessageRead", messageId, recipientId);
    }
  }

  setOnMessageReceived(handler: (message: Message) => void): void {
    this.onMessageReceived = handler;
  }

  setOnMessageRead(handler: (messageId: number) => void): void {
    this.onMessageRead = handler;
  }

  setOnOnlineUsersUpdated(handler: (userIds: string[]) => void): void {
    this.onOnlineUsersUpdated = handler;
  }

  get connectionState(): signalR.HubConnectionState | null {
    return this.connection?.state ?? null;
  }
}

export const signalRService = new SignalRService();
