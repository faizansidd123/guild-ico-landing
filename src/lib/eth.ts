import { throwToastedError } from "@/lib/error-feedback";

export const normalizeHexChainId = (chainIdHex: string) => Number.parseInt(chainIdHex, 16);

export const formatAddress = (address: string, visible = 4) => {
  if (!address) return "";
  return `${address.slice(0, 2 + visible)}...${address.slice(-visible)}`;
};

export const parseEthToWei = (value: string) => {
  const normalized = value.trim();
  if (!/^\d+(\.\d+)?$/.test(normalized)) {
    throwToastedError("Invalid ETH amount");
  }

  const [whole, fraction = ""] = normalized.split(".");
  const wholeWei = BigInt(whole || "0") * 10n ** 18n;
  const fractionWei = BigInt((fraction + "0".repeat(18)).slice(0, 18) || "0");
  return wholeWei + fractionWei;
};

export const weiToEth = (wei: bigint) => {
  const whole = wei / 10n ** 18n;
  const fraction = wei % 10n ** 18n;
  const fractionRaw = fraction.toString().padStart(18, "0").replace(/0+$/, "");
  return fractionRaw ? `${whole.toString()}.${fractionRaw}` : whole.toString();
};

export const toHexWei = (value: string) => {
  const wei = parseEthToWei(value);
  return `0x${wei.toString(16)}`;
};
