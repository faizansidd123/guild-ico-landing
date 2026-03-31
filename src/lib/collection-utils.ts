export type PaginationWindow<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export const chunkArray = <T>(items: T[], size: number): T[][] => {
  const safeSize = Math.max(1, Math.trunc(size));

  const result: T[][] = [];
  for (let index = 0; index < items.length; index += safeSize) {
    result.push(items.slice(index, index + safeSize));
  }

  return result;
};

export const unique = <T>(items: T[]): T[] => {
  return Array.from(new Set(items));
};

export const uniqueBy = <T, K>(items: T[], keySelector: (item: T) => K): T[] => {
  const seen = new Set<K>();
  const result: T[] = [];

  for (const item of items) {
    const key = keySelector(item);
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push(item);
  }

  return result;
};

export const groupBy = <T, K extends string | number | symbol>(
  items: T[],
  keySelector: (item: T) => K,
): Record<K, T[]> => {
  return items.reduce<Record<K, T[]>>((acc, item) => {
    const key = keySelector(item);
    if (!acc[key]) {
      acc[key] = [];
    }

    acc[key].push(item);
    return acc;
  }, {} as Record<K, T[]>);
};

export const indexBy = <T, K extends string | number | symbol>(
  items: T[],
  keySelector: (item: T) => K,
): Record<K, T> => {
  return items.reduce<Record<K, T>>((acc, item) => {
    acc[keySelector(item)] = item;
    return acc;
  }, {} as Record<K, T>);
};

export const partition = <T>(items: T[], predicate: (item: T) => boolean): [T[], T[]] => {
  const matched: T[] = [];
  const unmatched: T[] = [];

  for (const item of items) {
    if (predicate(item)) {
      matched.push(item);
    } else {
      unmatched.push(item);
    }
  }

  return [matched, unmatched];
};

export const paginateArray = <T>(items: T[], page: number, pageSize: number): PaginationWindow<T> => {
  const safePageSize = Math.max(1, Math.trunc(pageSize));
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / safePageSize));
  const safePage = Math.min(Math.max(1, Math.trunc(page)), totalPages);

  const start = (safePage - 1) * safePageSize;
  const end = start + safePageSize;

  return {
    items: items.slice(start, end),
    page: safePage,
    pageSize: safePageSize,
    total,
    totalPages,
  };
};

export const moveItem = <T>(items: T[], fromIndex: number, toIndex: number): T[] => {
  if (items.length === 0) {
    return [];
  }

  const from = Math.max(0, Math.min(items.length - 1, Math.trunc(fromIndex)));
  const to = Math.max(0, Math.min(items.length - 1, Math.trunc(toIndex)));

  if (from === to) {
    return [...items];
  }

  const copied = [...items];
  const [item] = copied.splice(from, 1);
  copied.splice(to, 0, item);

  return copied;
};

export const stableSort = <T>(items: T[], comparator: (a: T, b: T) => number): T[] => {
  return items
    .map((item, index) => ({ item, index }))
    .sort((left, right) => {
      const compared = comparator(left.item, right.item);
      if (compared !== 0) {
        return compared;
      }

      return left.index - right.index;
    })
    .map((entry) => entry.item);
};

export const sumBy = <T>(items: T[], valueSelector: (item: T) => number): number => {
  return items.reduce((sum, item) => {
    const value = valueSelector(item);
    return Number.isFinite(value) ? sum + value : sum;
  }, 0);
};

export const maxBy = <T>(items: T[], valueSelector: (item: T) => number): T | undefined => {
  if (items.length === 0) {
    return undefined;
  }

  let maxItem = items[0];
  let maxValue = valueSelector(maxItem);

  for (let index = 1; index < items.length; index += 1) {
    const item = items[index];
    const nextValue = valueSelector(item);

    if (nextValue > maxValue) {
      maxItem = item;
      maxValue = nextValue;
    }
  }

  return maxItem;
};

export const minBy = <T>(items: T[], valueSelector: (item: T) => number): T | undefined => {
  if (items.length === 0) {
    return undefined;
  }

  let minItem = items[0];
  let minValue = valueSelector(minItem);

  for (let index = 1; index < items.length; index += 1) {
    const item = items[index];
    const nextValue = valueSelector(item);

    if (nextValue < minValue) {
      minItem = item;
      minValue = nextValue;
    }
  }

  return minItem;
};

export const intersection = <T>(left: T[], right: T[]): T[] => {
  const rightSet = new Set(right);
  return left.filter((item) => rightSet.has(item));
};

export const difference = <T>(left: T[], right: T[]): T[] => {
  const rightSet = new Set(right);
  return left.filter((item) => !rightSet.has(item));
};

export const countBy = <T, K extends string | number | symbol>(
  items: T[],
  keySelector: (item: T) => K,
): Record<K, number> => {
  return items.reduce<Record<K, number>>((acc, item) => {
    const key = keySelector(item);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<K, number>);
};

export const toReadonlyArray = <T>(items: T[]): readonly T[] => {
  return Object.freeze([...items]);
};

export const zipArrays = <A, B>(left: A[], right: B[]): Array<[A, B]> => {
  const length = Math.min(left.length, right.length);

  const result: Array<[A, B]> = [];
  for (let index = 0; index < length; index += 1) {
    result.push([left[index], right[index]]);
  }

  return result;
};

export const flatten = <T>(items: T[][]): T[] => {
  return items.reduce<T[]>((acc, entry) => {
    acc.push(...entry);
    return acc;
  }, []);
};
