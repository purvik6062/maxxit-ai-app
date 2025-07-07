export interface IUserInfo {
  userId: string;
  walletAddress: string;
  email?: string;
  preferences: {
    defaultNetworks: string[];
    autoExpand: boolean;
    notifications: {
      email: boolean;
      webhook: boolean;
    };
  };
}

export interface SafeDeploymentResponse {
  success: boolean;
  data?: any;
  error?: string;
}
