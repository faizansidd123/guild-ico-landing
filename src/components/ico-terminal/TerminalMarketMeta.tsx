import { appText } from "@/content/app-text";

type TerminalMarketMetaProps = {
  tokenPriceUsd: number | null;
  section?: "all" | "tokenPrice" | "network";
};

const TerminalMarketMeta = ({ tokenPriceUsd, section = "all" }: TerminalMarketMetaProps) => {
  const tokenPriceLabel = tokenPriceUsd === null ? "--" : `$${tokenPriceUsd.toFixed(2)}`;
  const showTokenPrice = section === "all" || section === "tokenPrice";
  const showNetwork = section === "all" || section === "network";

  return (
    <>
      {showTokenPrice ? (
        <div className="flex justify-between text-xs font-mono">
          <span className="text-muted-foreground">{appText.icoTerminal.labels.tokenPrice}</span>
          <span className="text-accent font-bold">{tokenPriceLabel}</span>
        </div>
      ) : null}
      {showNetwork ? (
        <div className="flex justify-between text-xs font-mono">
          <span className="text-muted-foreground">{appText.icoTerminal.labels.network}</span>
          <span className="text-foreground">{appText.icoTerminal.labels.networkValue}</span>
        </div>
      ) : null}
    </>
  );
};

export default TerminalMarketMeta;
