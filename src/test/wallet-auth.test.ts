import { describe, expect, it } from "vitest";

import { resolveWalletConnectingState, shouldClearPersistedConnectedAddress } from "@/hooks/use-wallet-auth";

describe("resolveWalletConnectingState", () => {
  it("keeps the loader visible while a connection is in progress", () => {
    expect(
      resolveWalletConnectingState({
        isConnecting: true,
        isLoading: false,
        connectedAddress: "",
      }),
    ).toBe(true);
  });

  it("keeps the loader visible while provider setup is loading before an address exists", () => {
    expect(
      resolveWalletConnectingState({
        isConnecting: false,
        isLoading: true,
        connectedAddress: "",
      }),
    ).toBe(true);
  });

  it("hides the loader once an address is already connected", () => {
    expect(
      resolveWalletConnectingState({
        isConnecting: false,
        isLoading: true,
        connectedAddress: "0x8A90eF992FCE23798d51e5AeE0A63125919F2093",
      }),
    ).toBe(false);
  });
});

describe("shouldClearPersistedConnectedAddress", () => {
  it("does not clear persisted address while the auth modal is still open", () => {
    expect(
      shouldClearPersistedConnectedAddress({
        rawConnectedAddress: "",
        unifiedIsConnected: false,
        wagmiIsConnected: false,
        isConnecting: false,
        isAuthModalOpen: true,
      }),
    ).toBe(false);
  });

  it("does not clear persisted address while the wallet is still connected", () => {
    expect(
      shouldClearPersistedConnectedAddress({
        rawConnectedAddress: "",
        unifiedIsConnected: false,
        wagmiIsConnected: true,
        isConnecting: false,
        isAuthModalOpen: false,
      }),
    ).toBe(false);
  });

  it("clears persisted address only after the wallet is fully disconnected", () => {
    expect(
      shouldClearPersistedConnectedAddress({
        rawConnectedAddress: "",
        unifiedIsConnected: false,
        wagmiIsConnected: false,
        isConnecting: false,
        isAuthModalOpen: false,
      }),
    ).toBe(true);
  });
});
