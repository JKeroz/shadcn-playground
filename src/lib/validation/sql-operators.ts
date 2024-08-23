import { z } from "zod"

export const DEFAULT_COMPARISON_OPERATORS = [
  { name: '=', description: 'Equals', value: true },
  { name: '<>', description: 'Not equals', value: true},
  { name: '<', description: 'Less than', value: true },
  { name: '<=', description: 'Less than or equal', value: true},
  { name: '>', description: 'Greater than', value: true },
  { name: '>=', description: 'Greater than or equal', value: true },
  // { name: 'AND', description: 'Logical AND' },
  // { name: 'OR', description: 'Logical OR' },
  // { name: 'NOT', description: 'Logical NOT' },
  { name: 'LIKE', description: 'Case-sensitive pattern matching', value: true},
  { name: 'ILIKE', description: 'Case-insensitive pattern matching', value: true},
  // { name: 'BETWEEN', description: 'Within a range' },
  // { name: 'IN', description: 'Within a list of values' },
  { name: 'IS NULL', description: 'Is null', value: false },
  { name: 'IS NOT NULL', description: 'Is not null', value: false },
  // { name: '@@', description: 'Text search match' },
  // { name: '@> ', description: 'Contains (array)' },
  // { name: '<@', description: 'Is contained by (array)' },
  // { name: '&&', description: 'Overlap (array)' },
  // { name: 'NOT LIKE', description: 'Does not match pattern' },
  // { name: 'WHERE NOT', description: 'Excludes rows matching condition' },
  // { name: 'NOT IN', description: 'Not within a list of values' },
  // { name: 'NOT EXISTS', description: 'Negates the existence of rows' }
] as const
export type DefaultComparisonOperators = typeof DEFAULT_COMPARISON_OPERATORS[number]

export const DEFAULT_LOGICAL_OPERATORS = ['WHERE', 'AND', 'OR'] as const

const DEFAULT_COMPARISON_OPERATORS_ENUM = DEFAULT_COMPARISON_OPERATORS.map((x) => x.name)
export const LogicalOperatorsEnum = z.enum(DEFAULT_LOGICAL_OPERATORS)
export type LogicalOperators = z.infer<typeof LogicalOperatorsEnum>

export const ComparisonOperatorsEnum = z.enum([DEFAULT_COMPARISON_OPERATORS_ENUM[0], ...DEFAULT_COMPARISON_OPERATORS_ENUM])
export type ComparisonOperators = z.infer<typeof ComparisonOperatorsEnum>