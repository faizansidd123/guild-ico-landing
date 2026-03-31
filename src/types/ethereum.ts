export type Eip1193Request = {
  method: string;
  params?: unknown[] | object;
};

export interface EthereumProvider {
  isMetaMask?: boolean;
  request<T = unknown>(args: Eip1193Request): Promise<T>;
  on?(event: "accountsChanged" | "chainChanged" | "disconnect", listener: (...args: unknown[]) => void): void;
  removeListener?(event: "accountsChanged" | "chainChanged" | "disconnect", listener: (...args: unknown[]) => void): void;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

export {};
