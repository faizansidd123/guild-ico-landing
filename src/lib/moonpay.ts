const BASE_MAINNET_CHAIN_ID = 8453;
const DEFAULT_MOONPAY_CURRENCY_CODE = "eth";
const BASE_MAINNET_MOONPAY_CURRENCY_CODE = "eth_base";
const MOONPAY_TOP_UP_BUFFER_MULTIPLIER = 1.02;
const MOONPAY_TOP_UP_AMOUNT_PRECISION = 1e8;

export const resolveMoonPayCurrencyCode = (chainId?: number | null) => {
  return chainId === BASE_MAINNET_CHAIN_ID ? BASE_MAINNET_MOONPAY_CURRENCY_CODE : DEFAULT_MOONPAY_CURRENCY_CODE;
};

export const resolveMoonPayTopUpAmount = ({
  requiredAmount,
  currentBalance,
}: {
  requiredAmount: number;
  currentBalance: number;
}) => {
  if (!Number.isFinite(requiredAmount) || requiredAmount <= 0) {
    return "";
  }

  const safeCurrentBalance = Number.isFinite(currentBalance) && currentBalance > 0 ? currentBalance : 0;
  const shortfall = requiredAmount - safeCurrentBalance;

  if (shortfall <= 0) {
    return "";
  }

  const bufferedAmount = Math.ceil(shortfall * MOONPAY_TOP_UP_BUFFER_MULTIPLIER * MOONPAY_TOP_UP_AMOUNT_PRECISION);
  return (bufferedAmount / MOONPAY_TOP_UP_AMOUNT_PRECISION).toLocaleString("en-US", {
    useGrouping: false,
    maximumFractionDigits: 8,
  });
};
