export interface User {
  id: string;
  userName: string;
  email: string;
  displayName: string;
}

export interface Message {
  id: number;
  senderId: string;
  recipientId: string;
  text: string;
  sentAt: string;
  isRead: boolean;
}

export interface AuthResponse {
  code: number;
  message: string;
  userId: string;
  token: string;
  expirationDate: string;
  refreshToken: string;
  refreshTokenExpirationDate: string;
}

export interface LoginRequest {
  emailOrUser: string;
  password: string;
}


export interface SendMessageRequest {
  text: string;
  recipientId: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}