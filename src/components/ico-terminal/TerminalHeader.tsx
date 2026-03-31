import { appText } from "@/content/app-text";

const TerminalHeader = () => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        <h3 className="font-mono text-xs text-primary tracking-widest uppercase">{appText.icoTerminal.labels.terminalTitle}</h3>
      </div>
    </div>
  );
};

export default TerminalHeader;
