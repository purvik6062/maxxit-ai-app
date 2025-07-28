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

// Safe deployment data structure
export interface SafeDeployment {
  networkKey: string;
  chainId: number;
  address: string;
  deploymentTxHash: string;
  deploymentBlockNumber: number;
  deploymentTimestamp: {
    $date: string;
  };
  gasUsed: string;
  gasPrice: string;
  deploymentStatus: string;
  explorerUrl: string;
  isActive: boolean;
}

export interface SafeMetadata {
  totalDeployments: number;
  activeNetworks: string[];
  tags: string[];
  description: string;
  createdAt: {
    $date: string;
  };
  updatedAt: {
    $date: string;
  };
  lastActivityAt: {
    $date: string;
  };
}

export interface SafeConfig {
  owners: string[];
  threshold: number;
  saltNonce: string;
  safeVersion: string;
}

export interface SafeAnalytics {
  totalTransactions: number;
  totalValueTransferred: string;
}

export interface SafeData {
  _id: {
    $oid: string;
  };
  safeId: string;
  userInfo: IUserInfo;
  config: SafeConfig;
  deployments: {
    [networkKey: string]: SafeDeployment;
  };
  metadata: SafeMetadata;
  status: string;
  analytics: SafeAnalytics;
  createdAt: {
    $date: string;
  };
  updatedAt: {
    $date: string;
  };
  __v: number;
}
