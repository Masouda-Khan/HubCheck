/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as assignments from "../assignments.js";
import type * as checklistRuns from "../checklistRuns.js";
import type * as checklistTemplates from "../checklistTemplates.js";
import type * as dashboard from "../dashboard.js";
import type * as flags from "../flags.js";
import type * as inspections from "../inspections.js";
import type * as locations from "../locations.js";
import type * as seed from "../seed.js";
import type * as shoutouts from "../shoutouts.js";
import type * as students from "../students.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  assignments: typeof assignments;
  checklistRuns: typeof checklistRuns;
  checklistTemplates: typeof checklistTemplates;
  dashboard: typeof dashboard;
  flags: typeof flags;
  inspections: typeof inspections;
  locations: typeof locations;
  seed: typeof seed;
  shoutouts: typeof shoutouts;
  students: typeof students;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
