import { Interface, JsonRpcProvider, parseUnits } from "ethers";

import { throwToastedError } from "@/lib/error-feedback";
import type { EthereumProvider } from "@/types/ethereum";

type ContractWriteTx = {
  to: string;
  data: string;
  valueHex?: string;
};

const ICO_INTERFACE = new Interface([
  "function purchaseNative(uint256 tokenAmount) payable",
  "function purchaseStableCoin(address stableCoin, uint256 tokenAmount)",
  "function claimToken()",
  "function claimRefund()",
  "function claimRefundStable(address stableCoin)",
  "function getEthCost(uint256 tokenAmount) view returns (uint256)",
  "function getstableCost(address stableCoin, uint256 tokenAmount) view returns (uint256)",
]);

const ERC20_INTERFACE = new Interface([
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
]);

const parseTokenAmountToWei = (tokenAmount: number) => {
  if (!Number.isFinite(tokenAmount) || tokenAmount <= 0) {
    throwToastedError("Invalid token amount.");
  }

  const normalized = tokenAmount.toFixed(18).replace(/\.?0+$/, "");
  return parseUnits(normalized.length > 0 ? normalized : "0", 18);
};

const toHex = (value: bigint) => `0x${value.toString(16)}`;
const DEFAULT_RECEIPT_TIMEOUT_MS = 120_000;
const DEFAULT_RECEIPT_POLL_INTERVAL_MS = 1_500;

const alchemyRpcUrl = import.meta.env.NEXT_PUBLIC_ALCHEMY_RPC_URL || import.meta.env.VITE_ALCHEMY_RPC_URL || "";
const fallbackRpcProvider = alchemyRpcUrl ? new JsonRpcProvider(alchemyRpcUrl) : null;

const readContractView = async ({
  provider,
  to,
  from,
  data,
}: {
  provider?: EthereumProvider;
  to: string;
  from?: string;
  data: string;
}) => {
  if (provider) {
    return provider.request<string>({
      method: "eth_call",
      params: [
        {
          to,
          from,
          data,
        },
        "latest",
      ],
    });
  }

  if (!fallbackRpcProvider) {
    throwToastedError("No RPC provider available for contract read calls.");
  }

  return fallbackRpcProvider.call({
    to,
    from,
    data,
  });
};

const isSuccessfulReceiptStatus = (status: unknown) => {
  if (typeof status === "bigint") {
    return status === 1n;
  }

  if (typeof status === "number") {
    return status === 1;
  }

  if (typeof status === "string") {
    const normalized = status.trim().toLowerCase();
    return normalized === "0x1" || normalized === "1";
  }

  return false;
};

const sleep = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

export const waitForTransactionConfirmation = async ({
  provider,
  transactionHash,
  timeoutMs = DEFAULT_RECEIPT_TIMEOUT_MS,
  pollIntervalMs = DEFAULT_RECEIPT_POLL_INTERVAL_MS,
}: {
  provider?: EthereumProvider;
  transactionHash: string;
  timeoutMs?: number;
  pollIntervalMs?: number;
}) => {
  if (!transactionHash || transactionHash.trim().length === 0) {
    throwToastedError("Transaction hash is required to confirm approval.", "Transaction failed");
  }

  if (provider) {
    const startedAt = Date.now();

    while (Date.now() - startedAt < timeoutMs) {
      const receipt = await provider.request<{ status?: string | number | bigint } | null>({
        method: "eth_getTransactionReceipt",
        params: [transactionHash],
      });

      if (receipt) {
        if (isSuccessfulReceiptStatus(receipt.status)) {
          return receipt;
        }

        throwToastedError("Approval transaction failed to confirm.", "Purchase failed");
      }

      await sleep(pollIntervalMs);
    }

    throwToastedError("Timed out waiting for approval confirmation.", "Purchase failed");
  }

  if (!fallbackRpcProvider) {
    throwToastedError("No RPC provider available to confirm approval transaction.", "Purchase failed");
  }

  const receipt = await fallbackRpcProvider.waitForTransaction(transactionHash, 1, timeoutMs);
  if (!receipt) {
    throwToastedError("Timed out waiting for approval confirmation.", "Purchase failed");
  }

  if (isSuccessfulReceiptStatus(receipt.status)) {
    return receipt;
  }

  throwToastedError("Approval transaction failed to confirm.", "Purchase failed");
};

export const getEthCostForTokens = async ({
  provider,
  saleContractAddress,
  tokenAmount,
  account,
}: {
  provider?: EthereumProvider;
  saleContractAddress: string;
  tokenAmount: number;
  account?: string;
}) => {
  const tokenAmountWei = parseTokenAmountToWei(tokenAmount);
  const data = ICO_INTERFACE.encodeFunctionData("getEthCost", [tokenAmountWei]);
  const raw = await readContractView({
    provider,
    to: saleContractAddress,
    from: account,
    data,
  });
  const [ethCostWei] = ICO_INTERFACE.decodeFunctionResult("getEthCost", raw) as [bigint];
  return {
    ethCostWei: BigInt(ethCostWei),
    tokenAmountWei,
  };
};

export const getStableCostForTokens = async ({
  provider,
  saleContractAddress,
  stableCoin,
  tokenAmount,
  account,
}: {
  provider?: EthereumProvider;
  saleContractAddress: string;
  stableCoin: string;
  tokenAmount: number;
  account?: string;
}) => {
  const tokenAmountWei = parseTokenAmountToWei(tokenAmount);
  const data = ICO_INTERFACE.encodeFunctionData("getstableCost", [stableCoin, tokenAmountWei]);
  const raw = await readContractView({
    provider,
    to: saleContractAddress,
    from: account,
    data,
  });
  const [stableCostWei] = ICO_INTERFACE.decodeFunctionResult("getstableCost", raw) as [bigint];
  return {
    stableCostWei: BigInt(stableCostWei),
    tokenAmountWei,
  };
};

export const getStableAllowance = async ({
  provider,
  stableCoin,
  owner,
  spender,
}: {
  provider?: EthereumProvider;
  stableCoin: string;
  owner: string;
  spender: string;
}) => {
  const data = ERC20_INTERFACE.encodeFunctionData("allowance", [owner, spender]);
  const raw = await readContractView({
    provider,
    to: stableCoin,
    from: owner,
    data,
  });
  const [allowanceWei] = ERC20_INTERFACE.decodeFunctionResult("allowance", raw) as [bigint];
  return BigInt(allowanceWei);
};

export const buildPurchaseNativeTx = ({
  saleContractAddress,
  tokenAmountWei,
  ethCostWei,
}: {
  saleContractAddress: string;
  tokenAmountWei: bigint;
  ethCostWei: bigint;
}): ContractWriteTx => {
  return {
    to: saleContractAddress,
    data: ICO_INTERFACE.encodeFunctionData("purchaseNative", [tokenAmountWei]),
    valueHex: toHex(ethCostWei),
  };
};

export const buildApproveStableTx = ({
  stableCoin,
  spender,
  amountWei,
}: {
  stableCoin: string;
  spender: string;
  amountWei: bigint;
}): ContractWriteTx => {
  return {
    to: stableCoin,
    data: ERC20_INTERFACE.encodeFunctionData("approve", [spender, amountWei]),
  };
};

export const buildPurchaseStableTx = ({
  saleContractAddress,
  stableCoin,
  tokenAmountWei,
}: {
  saleContractAddress: string;
  stableCoin: string;
  tokenAmountWei: bigint;
}): ContractWriteTx => {
  return {
    to: saleContractAddress,
    data: ICO_INTERFACE.encodeFunctionData("purchaseStableCoin", [stableCoin, tokenAmountWei]),
  };
};

export const buildClaimTokenTx = (saleContractAddress: string): ContractWriteTx => ({
  to: saleContractAddress,
  data: ICO_INTERFACE.encodeFunctionData("claimToken"),
});

export const buildClaimRefundTx = (saleContractAddress: string): ContractWriteTx => ({
  to: saleContractAddress,
  data: ICO_INTERFACE.encodeFunctionData("claimRefund"),
});

export const buildClaimRefundStableTx = ({
  saleContractAddress,
  stableCoin,
}: {
  saleContractAddress: string;
  stableCoin: string;
}): ContractWriteTx => ({
  to: saleContractAddress,
  data: ICO_INTERFACE.encodeFunctionData("claimRefundStable", [stableCoin]),
});
