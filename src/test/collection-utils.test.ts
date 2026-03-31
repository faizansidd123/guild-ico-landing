import { describe, expect, it } from "vitest";

import {
  chunkArray,
  countBy,
  difference,
  flatten,
  groupBy,
  indexBy,
  intersection,
  maxBy,
  minBy,
  moveItem,
  paginateArray,
  partition,
  stableSort,
  sumBy,
  toReadonlyArray,
  unique,
  uniqueBy,
  zipArrays,
} from "@/lib/collection-utils";

describe("collection-utils", () => {
  it("chunkArray splits arrays by chunk size", () => {
    expect(chunkArray([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
    expect(chunkArray([1, 2, 3], 10)).toEqual([[1, 2, 3]]);
    expect(chunkArray([], 2)).toEqual([]);
  });

  it("chunkArray clamps invalid chunk sizes to 1", () => {
    expect(chunkArray([1, 2, 3], 0)).toEqual([[1], [2], [3]]);
    expect(chunkArray([1, 2], -10)).toEqual([[1], [2]]);
  });

  it("unique removes duplicated primitive values", () => {
    expect(unique([1, 1, 2, 3, 3, 4])).toEqual([1, 2, 3, 4]);
    expect(unique(["a", "a", "b"])).toEqual(["a", "b"]);
  });

  it("uniqueBy removes duplicates based on key selector", () => {
    const input = [
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" },
      { id: 1, name: "Alice Duplicate" },
    ];

    const result = uniqueBy(input, (item) => item.id);

    expect(result).toHaveLength(2);
    expect(result[0].name).toBe("Alice");
    expect(result[1].name).toBe("Bob");
  });

  it("groupBy groups entries by selected key", () => {
    const input = [
      { id: 1, type: "A" },
      { id: 2, type: "B" },
      { id: 3, type: "A" },
    ];

    const result = groupBy(input, (item) => item.type);

    expect(result.A).toHaveLength(2);
    expect(result.B).toHaveLength(1);
  });

  it("indexBy creates lookup table by selected key", () => {
    const input = [
      { id: "x", value: 1 },
      { id: "y", value: 2 },
    ];

    const result = indexBy(input, (item) => item.id);

    expect(result.x.value).toBe(1);
    expect(result.y.value).toBe(2);
  });

  it("partition splits items by predicate", () => {
    const [even, odd] = partition([1, 2, 3, 4, 5], (item) => item % 2 === 0);

    expect(even).toEqual([2, 4]);
    expect(odd).toEqual([1, 3, 5]);
  });

  it("paginateArray returns paging metadata", () => {
    const result = paginateArray([1, 2, 3, 4, 5], 2, 2);

    expect(result.items).toEqual([3, 4]);
    expect(result.page).toBe(2);
    expect(result.pageSize).toBe(2);
    expect(result.total).toBe(5);
    expect(result.totalPages).toBe(3);
  });

  it("paginateArray clamps page and page size", () => {
    const result = paginateArray([1, 2, 3], 99, 0);

    expect(result.items).toEqual([3]);
    expect(result.page).toBe(3);
    expect(result.pageSize).toBe(1);
    expect(result.totalPages).toBe(3);
  });

  it("moveItem reorders items by index", () => {
    const result = moveItem(["a", "b", "c", "d"], 1, 3);

    expect(result).toEqual(["a", "c", "d", "b"]);
  });

  it("moveItem clamps out-of-range indexes", () => {
    const resultA = moveItem(["a", "b", "c"], -10, 2);
    const resultB = moveItem(["a", "b", "c"], 10, -1);

    expect(resultA).toEqual(["b", "c", "a"]);
    expect(resultB).toEqual(["c", "a", "b"]);
  });

  it("stableSort keeps relative order for equal comparison", () => {
    const input = [
      { id: "a", score: 10 },
      { id: "b", score: 20 },
      { id: "c", score: 10 },
      { id: "d", score: 20 },
    ];

    const result = stableSort(input, (left, right) => left.score - right.score);

    expect(result.map((item) => item.id)).toEqual(["a", "c", "b", "d"]);
  });

  it("sumBy adds numeric values and ignores non-finite numbers", () => {
    const result = sumBy(
      [
        { value: 1 },
        { value: 2 },
        { value: Number.NaN },
        { value: 3 },
      ],
      (item) => item.value,
    );

    expect(result).toBe(6);
  });

  it("maxBy returns element with maximum value", () => {
    const result = maxBy(
      [
        { id: "a", value: 1 },
        { id: "b", value: 9 },
        { id: "c", value: 3 },
      ],
      (item) => item.value,
    );

    expect(result?.id).toBe("b");
  });

  it("maxBy returns undefined for empty arrays", () => {
    const result = maxBy([], (item: number) => item);
    expect(result).toBeUndefined();
  });

  it("minBy returns element with minimum value", () => {
    const result = minBy(
      [
        { id: "a", value: 1 },
        { id: "b", value: -2 },
        { id: "c", value: 3 },
      ],
      (item) => item.value,
    );

    expect(result?.id).toBe("b");
  });

  it("minBy returns undefined for empty arrays", () => {
    const result = minBy([], (item: number) => item);
    expect(result).toBeUndefined();
  });

  it("intersection returns values present in both arrays", () => {
    expect(intersection([1, 2, 3, 4], [2, 4, 6])).toEqual([2, 4]);
    expect(intersection(["a", "b"], ["c", "d"])).toEqual([]);
  });

  it("difference returns values present only in left array", () => {
    expect(difference([1, 2, 3, 4], [2, 4, 6])).toEqual([1, 3]);
    expect(difference(["a", "b"], ["a"])).toEqual(["b"]);
  });

  it("countBy counts grouped items", () => {
    const result = countBy(
      [
        { type: "A" },
        { type: "B" },
        { type: "A" },
        { type: "C" },
        { type: "A" },
      ],
      (item) => item.type,
    );

    expect(result.A).toBe(3);
    expect(result.B).toBe(1);
    expect(result.C).toBe(1);
  });

  it("toReadonlyArray freezes returned array", () => {
    const result = toReadonlyArray([1, 2, 3]);

    expect(result).toEqual([1, 2, 3]);
    expect(Object.isFrozen(result)).toBe(true);
  });

  it("zipArrays pairs arrays by smallest length", () => {
    const result = zipArrays([1, 2, 3], ["a", "b"]);

    expect(result).toEqual([
      [1, "a"],
      [2, "b"],
    ]);
  });

  it("flatten flattens nested arrays", () => {
    expect(flatten([[1, 2], [3], [], [4, 5]])).toEqual([1, 2, 3, 4, 5]);
  });

  it("integration scenario: paginate unique stable-sorted records", () => {
    const records = [
      { id: "1", score: 2 },
      { id: "1", score: 2 },
      { id: "2", score: 1 },
      { id: "3", score: 3 },
      { id: "4", score: 2 },
      { id: "4", score: 2 },
    ];

    const deduped = uniqueBy(records, (record) => record.id);
    const sorted = stableSort(deduped, (left, right) => left.score - right.score);
    const page = paginateArray(sorted, 1, 3);

    expect(page.items.map((item) => item.id)).toEqual(["2", "1", "4"]);
    expect(page.total).toBe(4);
    expect(page.totalPages).toBe(2);
  });

  it("integration scenario: use countBy with partition", () => {
    const source = [
      { id: 1, active: true, tier: "gold" },
      { id: 2, active: false, tier: "silver" },
      { id: 3, active: true, tier: "gold" },
      { id: 4, active: false, tier: "bronze" },
      { id: 5, active: true, tier: "silver" },
    ];

    const [active, inactive] = partition(source, (item) => item.active);
    const activeTiers = countBy(active, (item) => item.tier);
    const inactiveTiers = countBy(inactive, (item) => item.tier);

    expect(active).toHaveLength(3);
    expect(inactive).toHaveLength(2);
    expect(activeTiers.gold).toBe(2);
    expect(activeTiers.silver).toBe(1);
    expect(inactiveTiers.silver).toBe(1);
    expect(inactiveTiers.bronze).toBe(1);
  });
});
