import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

import { appText } from "@/content/app-text";
import { siteConfig } from "@/config/site";
import { dateTimeFormatter, numberFormatter } from "@/lib/formatters";
import { useUserTransactions } from "@/hooks/use-user-transactions";
import { SectionBlock, SectionContainer, SectionHeading } from "@/components/layout/section-primitives";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const apiNumberFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 12,
});

const amountColumnFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 5,
});

const truncateMiddle = (value: string, startChars: number, endChars: number) => {
  if (!value || value.length <= startChars + endChars) {
    return value;
  }

  return `${value.slice(0, startChars)}...${value.slice(-endChars)}`;
};

const normalizeUrlBase = (value: string) => (value.endsWith("/") ? value : `${value}/`);

const TransactionsSection = () => {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const { data, error, isLoading, isFetching } = useUserTransactions({ page, pageSize });
  const transactionExplorerBaseUrl = normalizeUrlBase(siteConfig.explorers.baseSepoliaTx);

  const transactions = useMemo(() => data?.items ?? [], [data?.items]);
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 1;
  const shouldShowPagination = totalPages > 1;

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const transactionRows = useMemo(
    () =>
      transactions.map((transaction) => ({
        id: transaction.id,
        dateLabel: dateTimeFormatter.format(new Date(transaction.createdAt)),
        walletAddress: transaction.walletAddress || "--",
        walletAddressLabel:
          transaction.walletAddress && transaction.walletAddress !== "--"
            ? truncateMiddle(transaction.walletAddress, 3, 3)
            : "--",
        icoName: transaction.icoName || "--",
        transactionType: transaction.transactionType || "--",
        currency: transaction.currency || "--",
        amountLabel:
          transaction.amountRaw === null || transaction.amountRaw === undefined
            ? "--"
            : amountColumnFormatter.format(transaction.amountRaw),
        tokenAmount: apiNumberFormatter.format(transaction.tokenAmount),
        txHash: transaction.txHash || "--",
        txHashUrl:
          transaction.txHash && transaction.txHash !== "--" ? `${transactionExplorerBaseUrl}${transaction.txHash}` : "",
      })),
    [transactionExplorerBaseUrl, transactions],
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
            <p className="text-xs font-mono text-muted-foreground">
              {appText.transactions.rowsLabel} {numberFormatter.format(pageSize)}
            </p>
          </div>

          {error instanceof Error ? (
            <p className="mb-3 text-sm text-destructive">{appText.transactions.failedToLoadPrefix} {error.message}</p>
          ) : null}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{appText.transactions.tableHeaders.date}</TableHead>
                <TableHead>{appText.transactions.tableHeaders.wallet}</TableHead>
                <TableHead>{appText.transactions.tableHeaders.ico}</TableHead>
                <TableHead>{appText.transactions.tableHeaders.type}</TableHead>
                <TableHead>{appText.transactions.tableHeaders.currency}</TableHead>
                <TableHead>{appText.transactions.tableHeaders.amount}</TableHead>
                <TableHead>{appText.transactions.tableHeaders.tokens}</TableHead>
                <TableHead>{appText.transactions.tableHeaders.txHash}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    {appText.transactions.loadingText}
                  </TableCell>
                </TableRow>
              ) : transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    {appText.transactions.noTransactionsText}
                  </TableCell>
                </TableRow>
              ) : (
                transactionRows.map((transaction) => {
                  return (
                    <TableRow key={transaction.id}>
                      <TableCell>{transaction.dateLabel}</TableCell>
                      <TableCell className="font-mono text-xs max-w-[16rem]">
                        <span title={transaction.walletAddress}>{transaction.walletAddressLabel}</span>
                      </TableCell>
                      <TableCell>{transaction.icoName}</TableCell>
                      <TableCell>{transaction.transactionType}</TableCell>
                      <TableCell>{transaction.currency}</TableCell>
                      <TableCell className="font-mono text-xs">{transaction.amountLabel}</TableCell>
                      <TableCell>{transaction.tokenAmount}</TableCell>
                      <TableCell className="font-mono text-xs break-all max-w-[18rem]">
                        {transaction.txHashUrl ? (
                          <a
                            href={transaction.txHashUrl}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="hover:text-primary transition-colors"
                            title={transaction.txHash}
                          >
                            {transaction.txHash}
                          </a>
                        ) : (
                          transaction.txHash
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs font-mono text-muted-foreground">
              {appText.transactions.showingPrefix} {numberFormatter.format(transactions.length)} {appText.transactions.ofWord} {numberFormatter.format(total)}
            </p>

            {shouldShowPagination ? (
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
                >
                  {appText.transactions.previous}
                </Button>
                <span className="text-xs font-mono text-muted-foreground">
                  {appText.transactions.pageLabel} {numberFormatter.format(page)} / {numberFormatter.format(totalPages)}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((currentPage) => Math.min(totalPages, currentPage + 1))}
                >
                  {appText.transactions.next}
                </Button>
              </div>
            ) : null}
          </div>
        </motion.div>
      </SectionContainer>
    </SectionBlock>
  );
};

export default TransactionsSection;
