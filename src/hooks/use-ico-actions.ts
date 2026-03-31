import { useCallback, useState } from "react";

import { isAddress } from "@/config/sale";
import { throwToastedError } from "@/lib/error-feedback";
import {
  buildApproveStableTx,
  buildClaimRefundStableTx,
  buildClaimRefundTx,
  buildClaimTokenTx,
  buildPurchaseNativeTx,
  buildPurchaseStableTx,
  getEthCostForTokens,
  getStableAllowance,
  getStableCostForTokens,
  waitForTransactionConfirmation,
} from "@/lib/ico-contract";
import type { EthereumProvider } from "@/types/ethereum";

type SendGaslessTransaction = (params: {
  target: `0x${string}`;
  data: `0x${string}`;
  value?: bigint;
}) => Promise<string>;

type ContractWriteTx = {
  to: string;
  data: string;
  valueHex?: string;
};

type IcoActionName = "purchaseNative" | "purchaseStableCoin" | "claimToken" | "claimRefund" | "claimRefundStable";

type IcoActionData = {
  action: IcoActionName;
  transactionHash: string;
  approvalTransactionHash?: string;
};

type PurchaseNativeParams = {
  provider?: EthereumProvider;
  saleContractAddress: string;
  account?: string;
  tokenAmount: number;
};

type PurchaseStableCoinParams = {
  provider?: EthereumProvider;
  saleContractAddress: string;
  stableCoin: string;
  account?: string;
  tokenAmount: number;
};

type ClaimParams = {
  saleContractAddress: string;
};

type ClaimRefundStableParams = {
  saleContractAddress: string;
  stableCoin: string;
};

const toError = (error: unknown) => (error instanceof Error ? error : new Error("Transaction failed"));
const MAX_ERC20_APPROVAL = (1n << 256n) - 1n;
const BPS_DENOMINATOR = 10_000n;
const NATIVE_PURCHASE_BUFFER_BPS = 50n;
const toHexWei = (value: bigint) => `0x${value.toString(16)}`;

const applyBufferBps = (value: bigint, bufferBps: bigint) => {
  if (value <= 0n || bufferBps <= 0n) {
    return value;
  }

  const numerator = value * (BPS_DENOMINATOR + bufferBps);
  return (numerator + (BPS_DENOMINATOR - 1n)) / BPS_DENOMINATOR;
};

export const useIcoActions = ({ sendGaslessTransaction }: { sendGaslessTransaction: SendGaslessTransaction }) => {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<IcoActionData | null>(null);

  const sendContractTransaction = useCallback(
    async ({ to, data, valueHex }: ContractWriteTx) => {
      if (!isAddress(to)) {
        throwToastedError("Invalid contract address.", "Transaction failed");
      }

      return sendGaslessTransaction({
        target: to as `0x${string}`,
        data: data as `0x${string}`,
        value: valueHex ? BigInt(valueHex) : 0n,
      });
    },
    [sendGaslessTransaction],
  );

  const runAction = useCallback(async <T,>(work: () => Promise<T>) => {
    setIsPending(true);
    setError(null);
    setData(null);

    try {
      return await work();
    } catch (actionError) {
      const nextError = toError(actionError);
      setError(nextError);
      throw nextError;
    } finally {
      setIsPending(false);
    }
  }, []);

  const purchaseNative = useCallback(
    async ({ provider, saleContractAddress, account, tokenAmount }: PurchaseNativeParams) => {
      return runAction(async () => {
        if (!isAddress(saleContractAddress)) {
          throwToastedError("Invalid sale contract address.", "Purchase failed");
        }

        const { ethCostWei, tokenAmountWei } = await getEthCostForTokens({
          provider,
          saleContractAddress,
          tokenAmount,
          account,
        });
        const bufferedEthCostWei = applyBufferBps(ethCostWei, NATIVE_PURCHASE_BUFFER_BPS);
        console.info("[ICO][NATIVE] purchase value buffer applied", {
          requiredWei: ethCostWei.toString(),
          bufferedWei: bufferedEthCostWei.toString(),
          bufferBps: Number(NATIVE_PURCHASE_BUFFER_BPS),
        });

        const nativePurchaseTx = buildPurchaseNativeTx({
          saleContractAddress,
          tokenAmountWei,
          ethCostWei: bufferedEthCostWei,
        });

        let valueWeiToSend = bufferedEthCostWei;
        let usedFallbackValue = true;
        if (nativePurchaseTx.valueHex) {
          try {
            const parsedValue = BigInt(nativePurchaseTx.valueHex);
            if (parsedValue > 0n) {
              valueWeiToSend = parsedValue;
              usedFallbackValue = false;
            }
          } catch {
            usedFallbackValue = true;
          }
        }

        if (usedFallbackValue) {
          console.warn("[ICO][NATIVE] Missing/invalid tx value, using buffered wei fallback.", {
            bufferedWei: bufferedEthCostWei.toString(),
          });
        }

        const txHash = await sendContractTransaction({
          ...nativePurchaseTx,
          valueHex: toHexWei(valueWeiToSend),
        });
        console.info("[ICO][NATIVE] purchaseNative msg.value", {
          valueWei: valueWeiToSend.toString(),
          valueHex: toHexWei(valueWeiToSend),
          usedFallbackValue,
        });

        const result: IcoActionData = {
          action: "purchaseNative",
          transactionHash: txHash,
        };

        setData(result);
        return result;
      });
    },
    [runAction, sendContractTransaction],
  );

  const purchaseStableCoin = useCallback(
    async ({ provider, saleContractAddress, stableCoin, account, tokenAmount }: PurchaseStableCoinParams) => {
      return runAction(async () => {
        if (!isAddress(saleContractAddress)) {
          throwToastedError("Invalid sale contract address.", "Purchase failed");
        }

        if (!isAddress(stableCoin)) {
          throwToastedError("Invalid stable coin address.", "Purchase failed");
        }

        if (!account || !isAddress(account)) {
          throwToastedError("Wallet account unavailable.", "Purchase failed");
        }

        const { stableCostWei, tokenAmountWei } = await getStableCostForTokens({
          provider,
          saleContractAddress,
          stableCoin,
          tokenAmount,
          account,
        });

        const currentAllowanceWei = await getStableAllowance({
          provider,
          stableCoin,
          owner: account,
          spender: saleContractAddress,
        });

        console.info("[ICO][ALLOWANCE] Stable allowance before buy", {
          owner: account,
          spender: saleContractAddress,
          stableCoin,
          allowanceWei: currentAllowanceWei.toString(),
          requiredWei: stableCostWei.toString(),
          needsApproval: currentAllowanceWei < stableCostWei,
        });

        let approvalTxHash: string | undefined;
        if (currentAllowanceWei < stableCostWei) {
          approvalTxHash = await sendContractTransaction(
            buildApproveStableTx({
              stableCoin,
              spender: saleContractAddress,
              amountWei: MAX_ERC20_APPROVAL,
            }),
          );
          console.info("[ICO][ALLOWANCE] Approval submitted", {
            owner: account,
            spender: saleContractAddress,
            stableCoin,
            approvalTxHash,
          });
          await waitForTransactionConfirmation({
            provider,
            transactionHash: approvalTxHash,
          });
          console.info("[ICO][ALLOWANCE] Approval confirmed", {
            owner: account,
            spender: saleContractAddress,
            stableCoin,
            approvalTxHash,
          });
        }

        const txHash = await sendContractTransaction(
          buildPurchaseStableTx({
            saleContractAddress,
            stableCoin,
            tokenAmountWei,
          }),
        );

        const result: IcoActionData = {
          action: "purchaseStableCoin",
          transactionHash: txHash,
          ...(approvalTxHash ? { approvalTransactionHash: approvalTxHash } : {}),
        };

        setData(result);
        return result;
      });
    },
    [runAction, sendContractTransaction],
  );

  const claimToken = useCallback(
    async ({ saleContractAddress }: ClaimParams) => {
      return runAction(async () => {
        if (!isAddress(saleContractAddress)) {
          throwToastedError("Invalid sale contract address.", "Claim failed");
        }

        const txHash = await sendContractTransaction(buildClaimTokenTx(saleContractAddress));
        const result: IcoActionData = {
          action: "claimToken",
          transactionHash: txHash,
        };

        setData(result);
        return result;
      });
    },
    [runAction, sendContractTransaction],
  );

  const claimRefund = useCallback(
    async ({ saleContractAddress }: ClaimParams) => {
      return runAction(async () => {
        if (!isAddress(saleContractAddress)) {
          throwToastedError("Invalid sale contract address.", "Claim failed");
        }

        const txHash = await sendContractTransaction(buildClaimRefundTx(saleContractAddress));
        const result: IcoActionData = {
          action: "claimRefund",
          transactionHash: txHash,
        };

        setData(result);
        return result;
      });
    },
    [runAction, sendContractTransaction],
  );

  const claimRefundStable = useCallback(
    async ({ saleContractAddress, stableCoin }: ClaimRefundStableParams) => {
      return runAction(async () => {
        if (!isAddress(saleContractAddress)) {
          throwToastedError("Invalid sale contract address.", "Claim failed");
        }

        if (!isAddress(stableCoin)) {
          throwToastedError("Invalid stable coin address.", "Claim failed");
        }

        const txHash = await sendContractTransaction(
          buildClaimRefundStableTx({
            saleContractAddress,
            stableCoin,
          }),
        );

        const result: IcoActionData = {
          action: "claimRefundStable",
          transactionHash: txHash,
        };

        setData(result);
        return result;
      });
    },
    [runAction, sendContractTransaction],
  );

  return {
    purchaseNative,
    purchaseStableCoin,
    claimToken,
    claimRefund,
    claimRefundStable,
    isPending,
    error,
    data,
  };
};
