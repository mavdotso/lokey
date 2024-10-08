/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as auth from "../auth.js";
import type * as authAdapter from "../authAdapter.js";
import type * as credentials from "../credentials.js";
import type * as credentialsRequests from "../credentialsRequests.js";
import type * as files from "../files.js";
import type * as http from "../http.js";
import type * as limits from "../limits.js";
import type * as stripe from "../stripe.js";
import type * as subscriptions from "../subscriptions.js";
import type * as types from "../types.js";
import type * as users from "../users.js";
import type * as workspaceInvites from "../workspaceInvites.js";
import type * as workspaces from "../workspaces.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  authAdapter: typeof authAdapter;
  credentials: typeof credentials;
  credentialsRequests: typeof credentialsRequests;
  files: typeof files;
  http: typeof http;
  limits: typeof limits;
  stripe: typeof stripe;
  subscriptions: typeof subscriptions;
  types: typeof types;
  users: typeof users;
  workspaceInvites: typeof workspaceInvites;
  workspaces: typeof workspaces;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
