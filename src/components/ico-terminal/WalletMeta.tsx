type WalletMetaProps = {
  globalError: string;
  inputError: string;
};

const WalletMeta = ({ globalError, inputError }: WalletMetaProps) => {
  return (
    <>
      {globalError ? <p className="text-[10px] text-center text-destructive font-mono">{globalError}</p> : null}
      {inputError ? <p className="text-[10px] text-center text-destructive font-mono">{inputError}</p> : null}
    </>
  );
};

export default WalletMeta;
