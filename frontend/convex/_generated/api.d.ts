/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as ai from "../ai.js";
import type * as mockTests from "../mockTests.js";
import type * as previousPapers from "../previousPapers.js";
import type * as questions from "../questions.js";
import type * as scrapedMaterials from "../scrapedMaterials.js";
import type * as seed from "../seed.js";
import type * as studyMaterials from "../studyMaterials.js";
import type * as subjects from "../subjects.js";
import type * as syllabus from "../syllabus.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  ai: typeof ai;
  mockTests: typeof mockTests;
  previousPapers: typeof previousPapers;
  questions: typeof questions;
  scrapedMaterials: typeof scrapedMaterials;
  seed: typeof seed;
  studyMaterials: typeof studyMaterials;
  subjects: typeof subjects;
  syllabus: typeof syllabus;
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
