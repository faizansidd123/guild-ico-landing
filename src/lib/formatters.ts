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

const decimalPattern = /^([+-]?)(\d+)(?:\.(\d*))?(?:e([+-]?\d+))?$/i;

const expandScientificNotation = (value: string): string | null => {
  const trimmedValue = value.trim();
  if (!trimmedValue) {
    return null;
  }

  const match = decimalPattern.exec(trimmedValue);
  if (!match) {
    return null;
  }

  const [, sign, integerPart, fractionalPart = "", exponentValue] = match;
  if (!exponentValue) {
    return `${sign}${integerPart}${fractionalPart ? `.${fractionalPart}` : ""}`;
  }

  const exponent = Number(exponentValue);
  if (!Number.isInteger(exponent)) {
    return null;
  }

  const digits = `${integerPart}${fractionalPart}`;
  const decimalIndex = integerPart.length + exponent;

  if (decimalIndex <= 0) {
    return `${sign}0.${"0".repeat(Math.abs(decimalIndex))}${digits}`;
  }

  if (decimalIndex >= digits.length) {
    return `${sign}${digits}${"0".repeat(decimalIndex - digits.length)}`;
  }

  return `${sign}${digits.slice(0, decimalIndex)}.${digits.slice(decimalIndex)}`;
};

const incrementDecimalDigits = (value: string): string => {
  return (BigInt(value || "0") + 1n).toString();
};

export const formatReadableBalance = (value: string, digits = 6): string => {
  const expandedValue = expandScientificNotation(value);
  if (!expandedValue) {
    return "0";
  }

  const match = decimalPattern.exec(expandedValue);
  if (!match) {
    return "0";
  }

  const [, sign, rawIntegerPart, rawFractionalPart = ""] = match;
  const integerPart = rawIntegerPart.replace(/^0+(?=\d)/, "") || "0";
  let fractionalPart = rawFractionalPart;

  if (digits <= 0) {
    if (fractionalPart.charAt(0) >= "5") {
      const roundedIntegerPart = incrementDecimalDigits(integerPart);
      return sign === "-" && roundedIntegerPart !== "0" ? `-${roundedIntegerPart}` : roundedIntegerPart;
    }

    return sign === "-" && integerPart !== "0" ? `-${integerPart}` : integerPart;
  }

  if (fractionalPart.length > digits) {
    const shouldRoundUp = fractionalPart.charAt(digits) >= "5";
    fractionalPart = fractionalPart.slice(0, digits);

    if (shouldRoundUp) {
      const combinedDigits = `${integerPart}${fractionalPart}`;
      const roundedDigits = incrementDecimalDigits(combinedDigits).padStart(integerPart.length + digits, "0");
      const splitIndex = roundedDigits.length - digits;
      const roundedIntegerPart = roundedDigits.slice(0, splitIndex) || "0";
      const roundedFractionalPart = roundedDigits.slice(splitIndex);
      const trimmedFractionalPart = roundedFractionalPart.replace(/0+$/, "");

      if (roundedIntegerPart === "0" && !trimmedFractionalPart) {
        return "0";
      }

      const prefix = sign === "-" ? "-" : "";
      return trimmedFractionalPart
        ? `${prefix}${roundedIntegerPart}.${trimmedFractionalPart}`
        : `${prefix}${roundedIntegerPart}`;
    }
  }

  const trimmedFractionalPart = fractionalPart.replace(/0+$/, "");
  if (integerPart === "0" && !trimmedFractionalPart) {
    return "0";
  }

  const prefix = sign === "-" ? "-" : "";
  return trimmedFractionalPart ? `${prefix}${integerPart}.${trimmedFractionalPart}` : `${prefix}${integerPart}`;
};
