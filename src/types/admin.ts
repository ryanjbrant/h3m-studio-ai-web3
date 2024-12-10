export interface AdminUser {
    id: string;
    email: string;
    role: string;
    disabled: boolean;
    walletConnected: boolean;
    downloads: number;
    lastVisit?: Date;
    createdAt?: Date;
  }
  
  export interface AdminStats {
    activeUsers: number;
    modelsGenerated: number;
    monthlyRevenue: number;
    storageUsed: number;
  }