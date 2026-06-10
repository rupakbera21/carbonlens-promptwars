/**
 * Type definitions for the configurable rule engine.
 * Rules are stored as JSON in the database and evaluated at runtime.
 */

export interface RuleDefinition {
  id: string;
  name: string;
  category: string;
  conditions: RuleCondition[];
  actions: RuleAction[];
  priority: number;
  active: boolean;
}

export interface RuleCondition {
  field: string;
  operator: RuleOperator;
  value: unknown;
}

export type RuleOperator =
  | "equals"
  | "notEquals"
  | "greaterThan"
  | "lessThan"
  | "greaterThanOrEqual"
  | "lessThanOrEqual"
  | "in"
  | "notIn"
  | "contains";

export interface RuleAction {
  type: "recommend" | "alert" | "badge";
  params: Record<string, unknown>;
}
