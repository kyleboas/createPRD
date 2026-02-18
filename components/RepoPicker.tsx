'use client';

import { ChangeEvent, useEffect, useMemo, useState } from 'react';

type Repo = {
  id: number;
  name: string;
  fullName: string;
  owner: string;
  private: boolean;
  permissions: {
    admin?: boolean;
    maintain?: boolean;
    push?: boolean;
    triage?: boolean;
    pull?: boolean;
  };
  writeLikelyAllowed: boolean;
};

type SessionResponse = {
  authenticated: boolean;
  selectedRepo?: Repo | null;
};

export function RepoPicker() {
  const [authenticated, setAuthenticated] = useState(false);
  const [repos, setRepos] = useState<Repo[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<Repo | null>(null);
  const [query, setQuery] = useState('');
  const [repoMeta, setRepoMeta] = useState<{ defaultBranch: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const sessionResponse = await fetch('/api/session', { cache: 'no-store' });
        const session = (await sessionResponse.json()) as SessionResponse;

        setAuthenticated(session.authenticated);
        if (!session.authenticated) {
          setRepos([]);
          setSelectedRepo(null);
          return;
        }

        const reposResponse = await fetch('/api/github/repos', { cache: 'no-store' });
        if (!reposResponse.ok) {
          throw new Error('Could not load repositories');
        }

        const payload = (await reposResponse.json()) as { repositories: Repo[] };
        setRepos(payload.repositories);

        if (session.selectedRepo) {
          const match = payload.repositories.find((repo) => repo.id === session.selectedRepo?.id);
          setSelectedRepo(match ?? session.selectedRepo);
        }
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Failed to load repository data');
      } finally {
        setLoading(false);
      }
    };

    load().catch(() => setError('Failed to initialize repository picker'));
  }, []);

  useEffect(() => {
    if (!selectedRepo) {
      setRepoMeta(null);
      return;
    }

    const loadRepoMeta = async () => {
      const response = await fetch(
        `/api/github/repo-meta?owner=${selectedRepo.owner}&repo=${selectedRepo.name}`,
        {
          cache: 'no-store',
        },
      );

      if (!response.ok) {
        setRepoMeta(null);
        return;
      }

      const payload = (await response.json()) as { defaultBranch: string };
      setRepoMeta(payload);
    };

    loadRepoMeta().catch(() => setRepoMeta(null));
  }, [selectedRepo]);

  const filteredRepos = useMemo(() => {
    const normalizedQuery = query.toLowerCase().trim();

    if (!normalizedQuery) {
      return repos;
    }

    return repos.filter(
      (repo) =>
        repo.fullName.toLowerCase().includes(normalizedQuery) ||
        repo.owner.toLowerCase().includes(normalizedQuery),
    );
  }, [query, repos]);

  const handleSelectRepo = async (event: ChangeEvent<HTMLSelectElement>) => {
    const repoId = Number(event.currentTarget.value);
    const repo = repos.find((item) => item.id === repoId) ?? null;
    setSelectedRepo(repo);

    await fetch('/api/session', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ selectedRepo: repo }),
    });

    window.dispatchEvent(new Event('session-updated'));
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.reload();
  };

  return (
    <section className="panel">
      <h2>Repository picker</h2>

      {!authenticated ? (
        <div className="stack-sm">
          <p className="panel-muted">
            Sign in with GitHub to list repositories and choose a target repository.
          </p>
          <a className="button" href="/api/auth/github">
            Sign in with GitHub
          </a>
        </div>
      ) : (
        <div className="stack-sm">
          <div className="row-between">
            <p className="panel-muted">Search and select a repository to target.</p>
            <button className="button button-secondary" onClick={handleLogout} type="button">
              Sign out
            </button>
          </div>

          {error ? <p className="error-text">{error}</p> : null}

          <label htmlFor="repo-search">Filter repositories</label>
          <input
            id="repo-search"
            placeholder="owner/repo"
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />

          <label htmlFor="repo-select">Available repositories</label>
          <select
            id="repo-select"
            disabled={loading || filteredRepos.length === 0}
            onChange={handleSelectRepo}
            value={selectedRepo?.id ?? ''}
          >
            <option value="">Select a repository…</option>
            {filteredRepos.map((repo) => {
              const warning = repo.writeLikelyAllowed ? '' : ' (read-only likely)';
              return (
                <option key={repo.id} value={repo.id}>
                  {repo.fullName}
                  {warning}
                </option>
              );
            })}
          </select>

          {selectedRepo ? (
            <div className="selected-repo">
              <h3>Selected repository</h3>
              <p>
                <strong>{selectedRepo.fullName}</strong>
              </p>
              <p>
                Access: {selectedRepo.permissions.admin ? 'admin' : selectedRepo.permissions.push ? 'write' : 'read'}
              </p>
              <p>Default branch: {repoMeta?.defaultBranch ?? 'loading…'}</p>
              {!selectedRepo.writeLikelyAllowed ? (
                <p className="warning-text">
                  This repository may not allow direct writes with your current permissions.
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}
