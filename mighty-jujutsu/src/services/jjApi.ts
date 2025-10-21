/**
 * API service layer for JJ backend commands
 * Wraps Tauri invoke calls with type-safe interfaces
 */

import { invoke } from "@tauri-apps/api/core";
import type {
  Commit,
  Bookmark,
  StatusParams,
  InitParams,
  DiffParams,
  LogParams,
  NewChangeParams,
  DescribeParams,
  BookmarkListParams,
  BookmarkCreateParams,
  BookmarkTrackParams,
  BookmarkDeleteParams,
  GitFetchParams,
  GitPushParams,
} from "../types/jj";

/**
 * Repository operations
 */
export async function getStatus(params: StatusParams = {}): Promise<string> {
  return await invoke<string>("jj_status", {
    repoPath: params.repoPath,
  });
}

export async function initRepo(params: InitParams): Promise<string> {
  return await invoke<string>("jj_init", {
    path: params.path,
  });
}

export async function getDiff(params: DiffParams = {}): Promise<string> {
  return await invoke<string>("jj_diff", {
    repoPath: params.repoPath,
    revision: params.revision,
  });
}

/**
 * History operations
 */
export async function getLog(params: LogParams = {}): Promise<Commit[]> {
  return await invoke<Commit[]>("jj_log", {
    repoPath: params.repoPath,
    limit: params.limit,
  });
}

/**
 * Change operations
 */
export async function createNewChange(params: NewChangeParams = {}): Promise<string> {
  return await invoke<string>("jj_new", {
    repoPath: params.repoPath,
    message: params.message,
  });
}

export async function describeChange(params: DescribeParams): Promise<string> {
  return await invoke<string>("jj_describe", {
    repoPath: params.repoPath,
    message: params.message,
    changeId: params.changeId,
  });
}

/**
 * Bookmark operations
 */
export async function listBookmarks(params: BookmarkListParams = {}): Promise<Bookmark[]> {
  return await invoke<Bookmark[]>("jj_bookmark_list", {
    repoPath: params.repoPath,
  });
}

export async function createBookmark(params: BookmarkCreateParams): Promise<string> {
  return await invoke<string>("jj_bookmark_create", {
    repoPath: params.repoPath,
    name: params.name,
    revision: params.revision,
  });
}

export async function trackBookmark(params: BookmarkTrackParams): Promise<string> {
  return await invoke<string>("jj_bookmark_track", {
    repoPath: params.repoPath,
    name: params.name,
  });
}

export async function deleteBookmark(params: BookmarkDeleteParams): Promise<string> {
  return await invoke<string>("jj_bookmark_delete", {
    repoPath: params.repoPath,
    name: params.name,
  });
}

/**
 * Remote operations
 */
export async function gitFetch(params: GitFetchParams = {}): Promise<string> {
  return await invoke<string>("jj_git_fetch", {
    repoPath: params.repoPath,
    remote: params.remote,
  });
}

export async function gitPush(params: GitPushParams = {}): Promise<string> {
  return await invoke<string>("jj_git_push", {
    repoPath: params.repoPath,
    bookmark: params.bookmark,
  });
}
