import type { RuleCondition } from "./rule-types";

/**
 * RuleEngine — evaluates JSON-defined conditions against a context.
 *
 * This engine is intentionally simple and transparent:
 * - All conditions must be true (AND logic)
 * - Each condition compares a field from context against a value
 * - Operators are standard comparison operators
 *
 * No external DSL library is used to keep the codebase auditable
 * and free of supply-chain risk.
 */
export class RuleEngine {
  /**
   * Evaluate all conditions against the given context.
   * Returns true only if ALL conditions pass (AND logic).
   */
  evaluate(conditions: RuleCondition[], context: Record<string, unknown>): boolean {
    return conditions.every((condition) => this.evaluateCondition(condition, context));
  }

  private evaluateCondition(
    condition: RuleCondition,
    context: Record<string, unknown>,
  ): boolean {
    const contextValue = context[condition.field];

    switch (condition.operator) {
      case "equals":
        return contextValue === condition.value;

      case "notEquals":
        return contextValue !== condition.value;

      case "greaterThan":
        return (
          typeof contextValue === "number" && contextValue > (condition.value as number)
        );

      case "lessThan":
        return (
          typeof contextValue === "number" && contextValue < (condition.value as number)
        );

      case "greaterThanOrEqual":
        return (
          typeof contextValue === "number" && contextValue >= (condition.value as number)
        );

      case "lessThanOrEqual":
        return (
          typeof contextValue === "number" && contextValue <= (condition.value as number)
        );

      case "in":
        return Array.isArray(condition.value) && condition.value.includes(contextValue);

      case "notIn":
        return Array.isArray(condition.value) && !condition.value.includes(contextValue);

      case "contains":
        return (
          typeof contextValue === "string" &&
          contextValue.includes(condition.value as string)
        );

      default:
        console.warn(`Unknown operator: ${condition.operator}`);
        return false;
    }
  }
}
