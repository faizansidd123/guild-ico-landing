import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";

import { appText } from "@/content/app-text";
import { numberFormatter, tokenFormatter, usdValueFormatter } from "@/lib/formatters";
import {
  getContributionLabel,
  getExplorerLink,
  getTransactionDateLabel,
  getTransactionHashLabel,
  getTransactionStatusVariant,
  getWalletLabel,
} from "@/lib/transactions-view";
import { useWalletAuth } from "@/hooks/use-wallet-auth";
import { useUserTransactions } from "@/hooks/use-user-transactions";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setTransactionsPage, setTransactionsPageSize } from "@/store/transactionsSlice";
import { SectionBlock, SectionContainer, SectionHeading } from "@/components/layout/section-primitives";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const TransactionsSection = () => {
  const dispatch = useAppDispatch();
  const { page, pageSize } = useAppSelector((state) => state.transactions);
  const { connectedAddress } = useWalletAuth();
  const { data, error, isLoading, isFetching } = useUserTransactions({ page, pageSize, walletAddress: connectedAddress });

  const transactions = useMemo(() => data?.items ?? [], [data?.items]);
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 1;
  const activePage = Math.min(Math.max(page, 1), totalPages);

  useEffect(() => {
    if (activePage !== page) {
      dispatch(setTransactionsPage(activePage));
    }
  }, [activePage, dispatch, page]);

  const start = transactions.length > 0 ? (activePage - 1) * pageSize + 1 : 0;
  const end = transactions.length > 0 ? start + transactions.length - 1 : 0;

  const transactionRows = useMemo(
    () =>
      transactions.map((transaction) => ({
        id: transaction.id,
        dateLabel: getTransactionDateLabel(transaction.createdAt),
        walletLabel: getWalletLabel(transaction.walletAddress),
        txLabel: getTransactionHashLabel(transaction),
        txLink: getExplorerLink(transaction),
        chain: transaction.chain,
        paymentMethod: transaction.paymentMethod,
        contributionLabel: getContributionLabel(transaction),
        tokenAmount: tokenFormatter.format(transaction.tokenAmount),
        usdValue: usdValueFormatter.format(transaction.usdValue),
        statusLabel: transaction.status.toUpperCase(),
        statusVariant: getTransactionStatusVariant(transaction.status),
      })),
    [transactions],
  );

  return (
    <SectionBlock id="transactions">
      <SectionContainer>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 text-center"
        >
          <SectionHeading
            eyebrow={appText.transactions.heading.eyebrow}
            title={appText.transactions.heading.title}
            description={appText.transactions.heading.description}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-surface rounded-2xl p-4 lg:p-6"
        >
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs font-mono text-muted-foreground">
              {appText.transactions.totalRecordsPrefix} {numberFormatter.format(total)} {isFetching ? appText.transactions.syncingSuffix : ""}
            </p>
            <label className="text-xs font-mono text-muted-foreground flex items-center gap-2">
              {appText.transactions.rowsLabel}
              <select
                className="bg-surface border border-border rounded-md px-2 py-1 text-foreground"
                value={String(pageSize)}
                onChange={(event) => {
                  dispatch(setTransactionsPageSize(Number(event.target.value)));
                }}
              >
                {[5, 10, 20, 30, 50].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {error instanceof Error ? (
            <p className="mb-3 text-sm text-destructive">{appText.transactions.failedToLoadPrefix} {error.message}</p>
          ) : null}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{appText.transactions.tableHeaders.date}</TableHead>
                <TableHead>{appText.transactions.tableHeaders.wallet}</TableHead>
                <TableHead>{appText.transactions.tableHeaders.txHash}</TableHead>
                <TableHead>{appText.transactions.tableHeaders.chain}</TableHead>
                <TableHead>{appText.transactions.tableHeaders.method}</TableHead>
                <TableHead>{appText.transactions.tableHeaders.contribution}</TableHead>
                <TableHead>{appText.transactions.tableHeaders.tokens}</TableHead>
                <TableHead>{appText.transactions.tableHeaders.value}</TableHead>
                <TableHead>{appText.transactions.tableHeaders.status}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground">
                    {appText.transactions.loadingText}
                  </TableCell>
                </TableRow>
              ) : transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground">
                    {appText.transactions.noTransactionsText}
                  </TableCell>
                </TableRow>
              ) : (
                transactionRows.map((transaction) => {
                  return (
                    <TableRow key={transaction.id}>
                      <TableCell>{transaction.dateLabel}</TableCell>
                      <TableCell className="font-mono text-xs">{transaction.walletLabel}</TableCell>
                      <TableCell className="font-mono text-xs">
                        {transaction.txLink ? (
                          <a
                            className="text-primary hover:underline"
                            href={transaction.txLink}
                            target="_blank"
                            rel="noreferrer noopener"
                          >
                            {transaction.txLabel}
                          </a>
                        ) : (
                          transaction.txLabel
                        )}
                      </TableCell>
                      <TableCell>{transaction.chain}</TableCell>
                      <TableCell>{transaction.paymentMethod}</TableCell>
                      <TableCell className="font-mono text-xs">{transaction.contributionLabel}</TableCell>
                      <TableCell>{transaction.tokenAmount}</TableCell>
                      <TableCell>{transaction.usdValue}</TableCell>
                      <TableCell>
                        <Badge variant={transaction.statusVariant}>{transaction.statusLabel}</Badge>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs font-mono text-muted-foreground">
              {appText.transactions.showingPrefix} {start}-{end} {appText.transactions.ofWord} {numberFormatter.format(total)}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => dispatch(setTransactionsPage(activePage - 1))}
                disabled={activePage <= 1 || isFetching}
              >
                {appText.transactions.previous}
              </Button>
              <span className="text-xs font-mono text-muted-foreground">
                {appText.transactions.pageLabel} {activePage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => dispatch(setTransactionsPage(activePage + 1))}
                disabled={activePage >= totalPages || isFetching}
              >
                {appText.transactions.next}
              </Button>
            </div>
          </div>
        </motion.div>
      </SectionContainer>
    </SectionBlock>
  );
};

export default TransactionsSection;
