import { useState } from "react";
import "./App.css";
import type { Commit, Bookmark } from "./types/jj";
import {
  getStatus,
  getLog,
  getDiff,
  createNewChange,
  describeChange,
  listBookmarks,
  createBookmark,
  trackBookmark,
  deleteBookmark,
  gitFetch,
  gitPush,
} from "./services/jjApi";

function App() {
  const [status, setStatus] = useState<string>("");
  const [commits, setCommits] = useState<Commit[]>([]);
  const [diff, setDiff] = useState<string>("");
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");

  const [diffRevision, setDiffRevision] = useState<string>("");
  const [newChangeMessage, setNewChangeMessage] = useState<string>("");
  const [describeMessage, setDescribeMessage] = useState<string>("");
  const [bookmarkName, setBookmarkName] = useState<string>("");
  const [trackBookmarkName, setTrackBookmarkName] = useState<string>("");
  const [deleteBookmarkName, setDeleteBookmarkName] = useState<string>("");

  async function handleGetStatus() {
    try {
      setError("");
      const result = await getStatus();
      setStatus(result);
    } catch (e) {
      setError(`Error getting status: ${e}`);
    }
  }

  async function handleGetLog() {
    try {
      setError("");
      const result = await getLog({ limit: 20 });
      setCommits(result);
    } catch (e) {
      setError(`Error getting log: ${e}`);
    }
  }

  async function handleGetDiff() {
    try {
      setError("");
      const result = await getDiff({ revision: diffRevision || undefined });
      setDiff(result);
    } catch (e) {
      setError(`Error getting diff: ${e}`);
    }
  }

  async function handleNewChange() {
    try {
      setError("");
      const result = await createNewChange({ message: newChangeMessage || undefined });
      setMessage(result);
      setNewChangeMessage("");
      await handleGetLog();
    } catch (e) {
      setError(`Error creating change: ${e}`);
    }
  }

  async function handleDescribe() {
    try {
      setError("");
      const result = await describeChange({ message: describeMessage });
      setMessage(result);
      setDescribeMessage("");
      await handleGetLog();
    } catch (e) {
      setError(`Error describing change: ${e}`);
    }
  }

  async function handleListBookmarks() {
    try {
      setError("");
      const result = await listBookmarks();
      setBookmarks(result);
    } catch (e) {
      setError(`Error listing bookmarks: ${e}`);
    }
  }

  async function handleCreateBookmark() {
    try {
      setError("");
      const result = await createBookmark({ name: bookmarkName });
      setMessage(result);
      setBookmarkName("");
      await handleListBookmarks();
    } catch (e) {
      setError(`Error creating bookmark: ${e}`);
    }
  }

  async function handleTrackBookmark() {
    try {
      setError("");
      const result = await trackBookmark({ name: trackBookmarkName });
      setMessage(result);
      setTrackBookmarkName("");
      await handleListBookmarks();
    } catch (e) {
      setError(`Error tracking bookmark: ${e}`);
    }
  }

  async function handleDeleteBookmark() {
    try {
      setError("");
      const result = await deleteBookmark({ name: deleteBookmarkName });
      setMessage(result);
      setDeleteBookmarkName("");
      await handleListBookmarks();
    } catch (e) {
      setError(`Error deleting bookmark: ${e}`);
    }
  }

  async function handleFetch() {
    try {
      setError("");
      const result = await gitFetch();
      setMessage(result);
      await handleGetLog();
      await handleListBookmarks();
    } catch (e) {
      setError(`Error fetching: ${e}`);
    }
  }

  async function handlePush() {
    try {
      setError("");
      const result = await gitPush();
      setMessage(result);
    } catch (e) {
      setError(`Error pushing: ${e}`);
    }
  }

  return (
    <main className="container">
      <h1>Mighty Jujutsu</h1>
      <p className="subtitle">A simple JJ (Jujutsu) GUI</p>

      {error && <div className="error">{error}</div>}
      {message && <div className="message">{message}</div>}

      <div className="panels">
        <section className="panel">
          <h2>Repository Status</h2>
          <button onClick={handleGetStatus}>Refresh Status</button>
          {status && <pre className="output">{status}</pre>}
        </section>

        <section className="panel">
          <h2>Commit History</h2>
          <button onClick={handleGetLog}>Refresh Log</button>
          {commits.length > 0 && (
            <div className="commits">
              {commits.map((commit) => (
                <div key={commit.change_id} className="commit">
                  <div className="commit-header">
                    <strong>{commit.description || "(no description)"}</strong>
                    {commit.is_working_copy && <span className="badge">WC</span>}
                  </div>
                  <div className="commit-details">
                    <div>Change: {commit.change_id.substring(0, 12)}</div>
                    <div>Commit: {commit.commit_id.substring(0, 12)}</div>
                    <div>Author: {commit.author.name}</div>
                    {commit.branches.length > 0 && (
                      <div>Branches: {commit.branches.join(", ")}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="panel">
          <h2>Diff Viewer</h2>
          <div className="form-group">
            <input
              type="text"
              value={diffRevision}
              onChange={(e) => setDiffRevision(e.target.value)}
              placeholder="Revision (leave empty for @)"
            />
            <button onClick={handleGetDiff}>Get Diff</button>
          </div>
          {diff && <pre className="output">{diff}</pre>}
        </section>

        <section className="panel">
          <h2>Changes</h2>
          <div className="form-group">
            <h3>New Change</h3>
            <input
              type="text"
              value={newChangeMessage}
              onChange={(e) => setNewChangeMessage(e.target.value)}
              placeholder="Change message (optional)"
            />
            <button onClick={handleNewChange}>Create New Change</button>
          </div>
          <div className="form-group">
            <h3>Describe Current Change</h3>
            <input
              type="text"
              value={describeMessage}
              onChange={(e) => setDescribeMessage(e.target.value)}
              placeholder="Description"
            />
            <button onClick={handleDescribe} disabled={!describeMessage}>
              Describe
            </button>
          </div>
        </section>

        <section className="panel">
          <h2>Bookmarks</h2>
          <button onClick={handleListBookmarks}>Refresh Bookmarks</button>
          {bookmarks.length > 0 && (
            <div className="bookmarks">
              {bookmarks.map((bookmark) => (
                <div key={bookmark.name} className="bookmark">
                  <strong>{bookmark.name}</strong>
                  <span> → {bookmark.target.substring(0, 12)}</span>
                  {bookmark.is_tracking && <span className="badge">Tracking</span>}
                  {bookmark.remote && <span> (remote: {bookmark.remote})</span>}
                </div>
              ))}
            </div>
          )}
          <div className="form-group">
            <h3>Create Bookmark</h3>
            <input
              type="text"
              value={bookmarkName}
              onChange={(e) => setBookmarkName(e.target.value)}
              placeholder="Bookmark name"
            />
            <button onClick={handleCreateBookmark} disabled={!bookmarkName}>
              Create
            </button>
          </div>
          <div className="form-group">
            <h3>Track Bookmark</h3>
            <input
              type="text"
              value={trackBookmarkName}
              onChange={(e) => setTrackBookmarkName(e.target.value)}
              placeholder="Bookmark name (e.g., main@origin)"
            />
            <button onClick={handleTrackBookmark} disabled={!trackBookmarkName}>
              Track
            </button>
          </div>
          <div className="form-group">
            <h3>Delete Bookmark</h3>
            <input
              type="text"
              value={deleteBookmarkName}
              onChange={(e) => setDeleteBookmarkName(e.target.value)}
              placeholder="Bookmark name"
            />
            <button onClick={handleDeleteBookmark} disabled={!deleteBookmarkName}>
              Delete
            </button>
          </div>
        </section>

        <section className="panel">
          <h2>Remote Operations</h2>
          <div className="button-group">
            <button onClick={handleFetch}>Git Fetch</button>
            <button onClick={handlePush}>Git Push</button>
          </div>
        </section>
      </div>
    </main>
  );
}

export default App;
