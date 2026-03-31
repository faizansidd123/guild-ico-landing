import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { chainById } from "@/config/sale";
import { trackEvent } from "@/lib/analytics";
import { getErrorMessage } from "@/lib/error-feedback";
import { formatAddress, normalizeHexChainId, toHexWei, weiToEth } from "@/lib/eth";
import type { RootState } from "@/store/index";
import type { EthereumProvider } from "@/types/ethereum";

type WalletSnapshot = {
  providerAvailable: boolean;
  account: string;
  shortAccount: string;
  chainId: number | null;
  balanceEth: string;
};

export type WalletState = WalletSnapshot & {
  isConnecting: boolean;
  isTransacting: boolean;
  error: string;
  lastTxHash: string;
};

type SwitchNetworkParams = {
  targetChainId: number;
};

type SendNativeTransactionParams = {
  to: string;
  amountEth: string;
  data?: string;
};

type SendNativeTransactionResult = {
  txHash: string;
  snapshot: WalletSnapshot;
};

type SendContractTransactionParams = {
  to: string;
  data: string;
  valueHex?: string;
};

const getProvider = (): EthereumProvider | undefined => window.ethereum;

const disconnectedSnapshot = (providerAvailable: boolean): WalletSnapshot => ({
  providerAvailable,
  account: "",
  shortAccount: "",
  chainId: null,
  balanceEth: "0",
});

const readWalletSnapshot = async (provider: EthereumProvider): Promise<WalletSnapshot> => {
  const [accounts, chainIdHex] = await Promise.all([
    provider.request<string[]>({ method: "eth_accounts" }),
    provider.request<string>({ method: "eth_chainId" }),
  ]);

  const account = accounts[0] || "";
  const chainId = normalizeHexChainId(chainIdHex);

  if (account.length === 0) {
    return {
      providerAvailable: true,
      account: "",
      shortAccount: "",
      chainId,
      balanceEth: "0",
    };
  }

  const balanceHex = await provider.request<string>({
    method: "eth_getBalance",
    params: [account, "latest"],
  });

  return {
    providerAvailable: true,
    account,
    shortAccount: formatAddress(account),
    chainId,
    balanceEth: weiToEth(BigInt(balanceHex)),
  };
};

const initialState: WalletState = {
  ...disconnectedSnapshot(Boolean(getProvider())),
  isConnecting: false,
  isTransacting: false,
  error: "",
  lastTxHash: "",
};

export const refreshWallet = createAsyncThunk<WalletSnapshot>("wallet/refresh", async () => {
  const provider = getProvider();
  if (!provider) {
    return disconnectedSnapshot(false);
  }

  return readWalletSnapshot(provider);
});

export const connectWallet = createAsyncThunk<WalletSnapshot, void, { rejectValue: string }>(
  "wallet/connect",
  async (_, { rejectWithValue }) => {
    const provider = getProvider();
    if (!provider) {
      return rejectWithValue("No EVM wallet detected. Please install MetaMask or Coinbase Wallet.");
    }

    try {
      await provider.request<string[]>({ method: "eth_requestAccounts" });
      const snapshot = await readWalletSnapshot(provider);
      trackEvent("wallet_connected", { account: snapshot.account });
      return snapshot;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Wallet connection failed"));
    }
  },
);

export const switchNetwork = createAsyncThunk<WalletSnapshot, SwitchNetworkParams, { rejectValue: string }>(
  "wallet/switchNetwork",
  async ({ targetChainId }, { rejectWithValue }) => {
    const provider = getProvider();
    if (!provider) {
      return rejectWithValue("Wallet provider unavailable");
    }

    const chain = chainById[targetChainId];
    if (!chain) {
      return rejectWithValue(`Unsupported chain: ${targetChainId}`);
    }

    try {
      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: chain.hex }],
      });
    } catch (error) {
      const maybeError = error as { code?: number };
      if (maybeError.code === 4902) {
        await provider.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: chain.hex,
              chainName: chain.name,
              nativeCurrency: {
                name: chain.symbol,
                symbol: chain.symbol,
                decimals: 18,
              },
              rpcUrls: chain.rpcUrls,
              blockExplorerUrls: [chain.explorerUrl],
            },
          ],
        });
      } else {
        return rejectWithValue(getErrorMessage(error, "Failed to switch network"));
      }
    }

    const snapshot = await readWalletSnapshot(provider);
    trackEvent("wallet_chain_switched", { targetChainId });
    return snapshot;
  },
);

export const sendNativeTransaction = createAsyncThunk<
  SendNativeTransactionResult,
  SendNativeTransactionParams,
  { state: RootState; rejectValue: string }
>("wallet/sendNativeTransaction", async ({ to, amountEth, data }, { getState, rejectWithValue }) => {
  const provider = getProvider();
  if (!provider) {
    return rejectWithValue("Wallet provider unavailable");
  }

  const { account } = getState().wallet;
  if (account.length === 0) {
    return rejectWithValue("Connect wallet first");
  }

  try {
    const txHash = await provider.request<string>({
      method: "eth_sendTransaction",
      params: [
        {
          from: account,
          to,
          value: toHexWei(amountEth),
          data,
        },
      ],
    });

    const snapshot = await readWalletSnapshot(provider);
    trackEvent("tx_submitted", { txHash, amountEth, to });

    return { txHash, snapshot };
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, "Transaction failed"));
  }
});

export const sendContractTransaction = createAsyncThunk<
  SendNativeTransactionResult,
  SendContractTransactionParams,
  { state: RootState; rejectValue: string }
>("wallet/sendContractTransaction", async ({ to, data, valueHex }, { getState, rejectWithValue }) => {
  const provider = getProvider();
  if (!provider) {
    return rejectWithValue("Wallet provider unavailable");
  }

  const { account } = getState().wallet;
  if (account.length === 0) {
    return rejectWithValue("Connect wallet first");
  }

  try {
    const txHash = await provider.request<string>({
      method: "eth_sendTransaction",
      params: [
        {
          from: account,
          to,
          data,
          value: valueHex,
        },
      ],
    });

    const snapshot = await readWalletSnapshot(provider);
    trackEvent("contract_tx_submitted", {
      txHash,
      to,
      hasValue: Boolean(valueHex),
    });

    return { txHash, snapshot };
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, "Contract transaction failed"));
  }
});

const applySnapshot = (state: WalletState, snapshot: WalletSnapshot) => {
  state.providerAvailable = snapshot.providerAvailable;
  state.account = snapshot.account;
  state.shortAccount = snapshot.shortAccount;
  state.chainId = snapshot.chainId;
  state.balanceEth = snapshot.balanceEth;
};

const walletSlice = createSlice({
  name: "wallet",
  initialState,
  reducers: {
    disconnectWallet(state) {
      const providerAvailable = Boolean(getProvider());
      const snapshot = disconnectedSnapshot(providerAvailable);
      applySnapshot(state, snapshot);
      state.error = "";
      state.isConnecting = false;
      state.isTransacting = false;
      state.lastTxHash = "";
    },
    clearWalletError(state) {
      state.error = "";
    },
  },
  extraReducers: (builder) => {
    builder.addCase(refreshWallet.fulfilled, (state, action) => {
      applySnapshot(state, action.payload);
      state.error = "";
    });

    builder.addCase(connectWallet.pending, (state) => {
      state.isConnecting = true;
      state.error = "";
    });
    builder.addCase(connectWallet.fulfilled, (state, action) => {
      applySnapshot(state, action.payload);
      state.isConnecting = false;
      state.error = "";
    });
    builder.addCase(connectWallet.rejected, (state, action) => {
      state.isConnecting = false;
      state.error = action.payload || action.error.message || "Wallet connection failed";
    });

    builder.addCase(switchNetwork.fulfilled, (state, action) => {
      applySnapshot(state, action.payload);
      state.error = "";
    });
    builder.addCase(switchNetwork.rejected, (state, action) => {
      state.error = action.payload || action.error.message || "Failed to switch network";
    });

    builder.addCase(sendNativeTransaction.pending, (state) => {
      state.isTransacting = true;
      state.error = "";
    });
    builder.addCase(sendNativeTransaction.fulfilled, (state, action) => {
      applySnapshot(state, action.payload.snapshot);
      state.isTransacting = false;
      state.lastTxHash = action.payload.txHash;
      state.error = "";
    });
    builder.addCase(sendNativeTransaction.rejected, (state, action) => {
      state.isTransacting = false;
      state.error = action.payload || action.error.message || "Transaction failed";
    });

    builder.addCase(sendContractTransaction.pending, (state) => {
      state.isTransacting = true;
      state.error = "";
    });
    builder.addCase(sendContractTransaction.fulfilled, (state, action) => {
      applySnapshot(state, action.payload.snapshot);
      state.isTransacting = false;
      state.lastTxHash = action.payload.txHash;
      state.error = "";
    });
    builder.addCase(sendContractTransaction.rejected, (state, action) => {
      state.isTransacting = false;
      state.error = action.payload || action.error.message || "Contract transaction failed";
    });
  },
});

export const { disconnectWallet, clearWalletError } = walletSlice.actions;

export default walletSlice.reducer;
