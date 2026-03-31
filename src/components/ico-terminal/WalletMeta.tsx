import { appText } from "@/content/app-text";

type WalletMetaProps = {
  account: string;
  balanceEth: string;
  referral: string;
  globalError: string;
  inputError: string;
};

const WalletMeta = ({ account, balanceEth, referral, globalError, inputError }: WalletMetaProps) => {
  return (
    <>
      {account.length > 0 ? (
        <p className="text-[10px] text-center text-muted-foreground font-mono">
          {appText.icoTerminal.labels.walletBalancePrefix} {Number(balanceEth).toFixed(4)} ETH • {appText.icoTerminal.labels.referralPrefix} {referral || appText.icoTerminal.labels.referralNone}
        </p>
      ) : null}

      {globalError ? <p className="text-[10px] text-center text-destructive font-mono">{globalError}</p> : null}
      {inputError ? <p className="text-[10px] text-center text-destructive font-mono">{inputError}</p> : null}
    </>
  );
};

export default WalletMeta;
