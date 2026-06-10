import { expect, test } from "vitest";
import { cn } from "../../shared/utils/cn";

test("cn merges tailwind classes correctly", () => {
  expect(cn("p-4", "m-4")).toBe("p-4 m-4");
  expect(cn("p-4", { "m-4": true, "text-red-500": false })).toBe("p-4 m-4");
  expect(cn("px-2 py-1", "p-4")).toBe("p-4"); // tailwind-merge resolves conflicts
});
