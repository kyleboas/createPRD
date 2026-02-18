import { NextRequest, NextResponse } from 'next/server';

import { GitHubApiError } from '@/lib/github/client';
import { commitFilesToBranch } from '@/lib/github/commits';
import { getFileIfExists, resolveTargetPath } from '@/lib/github/contents';
import { getRepoMetadata } from '@/lib/github/repos';
import { getSession } from '@/lib/session';
import { toFeatureSlug } from '@/lib/slug';

type CommitRequestBody = {
  featurePrompt?: unknown;
  approvedPrd?: unknown;
  tasksMarkdown?: unknown;
  dryRun?: unknown;
};

export async function POST(request: NextRequest) {
  const session = getSession();

  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  if (!session.selectedRepo) {
    return NextResponse.json({ error: 'Select a repository before committing' }, { status: 400 });
  }

  const body = (await request.json()) as CommitRequestBody;
  const featurePrompt = typeof body.featurePrompt === 'string' ? body.featurePrompt.trim() : '';
  const approvedPrd = typeof body.approvedPrd === 'string' ? body.approvedPrd.trim() : '';
  const tasksMarkdown = typeof body.tasksMarkdown === 'string' ? body.tasksMarkdown.trim() : '';
  const dryRun = body.dryRun === true;

  if (!featurePrompt) {
    return NextResponse.json({ error: 'Feature prompt is required' }, { status: 400 });
  }

  if (!approvedPrd) {
    return NextResponse.json({ error: 'Approved PRD snapshot is required' }, { status: 400 });
  }

  if (!tasksMarkdown) {
    return NextResponse.json({ error: 'Tasks markdown is required' }, { status: 400 });
  }

  const { owner, name: repo, fullName } = session.selectedRepo;
  const slug = toFeatureSlug(featurePrompt);

  try {
    const repoMeta = await getRepoMetadata({ owner, repo, accessToken: session.accessToken });
    const defaultBranch = repoMeta.defaultBranch;

    const basePrdPath = `tasks/prd-${slug}.md`;
    const baseTasksPath = `tasks/tasks-${slug}.md`;

    const [prdExists, tasksExists] = await Promise.all([
      getFileIfExists({
        owner,
        repo,
        path: basePrdPath,
        ref: defaultBranch,
        accessToken: session.accessToken,
      }),
      getFileIfExists({
        owner,
        repo,
        path: baseTasksPath,
        ref: defaultBranch,
        accessToken: session.accessToken,
      }),
    ]);

    const finalPrdPath = resolveTargetPath(basePrdPath, prdExists.exists);
    const finalTasksPath = resolveTargetPath(baseTasksPath, tasksExists.exists);
    const collisionDetected = prdExists.exists || tasksExists.exists;

    if (dryRun) {
      return NextResponse.json({
        review: {
          repository: fullName,
          branch: defaultBranch,
          files: {
            prd: `/${finalPrdPath}`,
            tasks: `/${finalTasksPath}`,
          },
          collisionDetected,
          versioningApplied: collisionDetected,
        },
      });
    }

    const commit = await commitFilesToBranch({
      owner,
      repo,
      branch: defaultBranch,
      accessToken: session.accessToken,
      message: `docs: add PRD and tasks for ${slug}`,
      files: [
        {
          path: finalPrdPath,
          content: approvedPrd,
        },
        {
          path: finalTasksPath,
          content: tasksMarkdown,
        },
      ],
    });

    return NextResponse.json({
      success: true,
      repository: fullName,
      branch: defaultBranch,
      commitSha: commit.sha,
      files: [`/${finalPrdPath}`, `/${finalTasksPath}`],
      collisionDetected,
      versioningApplied: collisionDetected,
    });
  } catch (error) {
    if (error instanceof GitHubApiError) {
      const branchProtectionLikely =
        (error.status === 403 || error.status === 422) &&
        /protected branch|protection|update is not allowed|protected/i.test(error.message);

      if (branchProtectionLikely) {
        return NextResponse.json(
          {
            error:
              'Commit blocked by branch protection rules on the default branch. No files were written. Adjust repository rules or choose another target.',
          },
          { status: 409 },
        );
      }

      return NextResponse.json(
        {
          error: error.message,
        },
        { status: error.status },
      );
    }

    return NextResponse.json({ error: 'Failed to commit PRD and tasks' }, { status: 500 });
  }
}
