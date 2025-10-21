/**
 * TypeScript type definitions matching Rust backend models
 */

export interface Author {
  name: string;
  email: string;
  timestamp: string;
}

export interface Commit {
  change_id: string;
  commit_id: string;
  author: Author;
  committer: Author;
  description: string;
  branches: string[];
  tags: string[];
  is_working_copy: boolean;
}

export interface Bookmark {
  name: string;
  target: string;
  is_tracking: boolean;
  remote: string | null;
}

/**
 * Command parameter types
 */
export interface StatusParams {
  repoPath?: string;
}

export interface InitParams {
  path: string;
}

export interface DiffParams {
  repoPath?: string;
  revision?: string;
}

export interface LogParams {
  repoPath?: string;
  limit?: number;
}

export interface NewChangeParams {
  repoPath?: string;
  message?: string;
}

export interface DescribeParams {
  repoPath?: string;
  message: string;
  changeId?: string;
}

export interface BookmarkListParams {
  repoPath?: string;
}

export interface BookmarkCreateParams {
  repoPath?: string;
  name: string;
  revision?: string;
}

export interface BookmarkTrackParams {
  repoPath?: string;
  name: string;
}

export interface BookmarkDeleteParams {
  repoPath?: string;
  name: string;
}

export interface GitFetchParams {
  repoPath?: string;
  remote?: string;
}

export interface GitPushParams {
  repoPath?: string;
  bookmark?: string;
}
