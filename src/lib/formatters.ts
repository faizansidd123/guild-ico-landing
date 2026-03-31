const createNumberFormatter = (options?: Intl.NumberFormatOptions) => {
  return new Intl.NumberFormat("en-US", options);
};

const createCurrencyFormatter = (currency: string, maximumFractionDigits: number) => {
  return createNumberFormatter({
    style: "currency",
    currency,
    maximumFractionDigits,
  });
};

export const numberFormatter = createNumberFormatter();

export const ethAmountFormatter = createNumberFormatter({
  maximumFractionDigits: 7,
});

export const tokenFormatter = createNumberFormatter({
  maximumFractionDigits: 2,
});

export const usdFormatter = createCurrencyFormatter("USD", 0);

export const usdValueFormatter = createCurrencyFormatter("USD", 2);

export const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

export const formatNumberCompact = (value: number): string => {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
};
