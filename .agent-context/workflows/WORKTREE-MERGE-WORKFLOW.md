# Worktree-Safe Merge Workflow

**Version**: 1.0.0
**Created**: 2026-03-04
**Source**: ED-0001 retro — `gh pr merge --delete-branch` fails in worktrees

## Problem

When merging PRs from a git worktree, `gh pr merge --delete-branch` fails
because it tries to switch the local checkout to `main` after merge. This
conflicts when `main` is already checked out in another worktree.

## Worktree-Safe Merge Procedure

### For agents working in worktrees

```bash
# 1. Merge the PR (squash or merge, WITHOUT --delete-branch)
gh pr merge <PR-NUMBER> --squash

# 2. Delete the remote branch separately
git push origin --delete feature/<TASK-ID>-description

# 3. Do NOT try to switch branches locally — the worktree stays on its branch
```

### For planner cleaning up after task completion

```bash
# 1. Remove the worktree (from the main repo, not from inside the worktree)
git worktree remove .claude/worktrees/<TASK-ID>

# 2. Delete the local branch (now safe since worktree is gone)
git branch -d feature/<TASK-ID>-description

# 3. Prune stale worktree references
git worktree prune
```

### Batch cleanup (all completed worktrees)

```bash
# List all worktrees
git worktree list

# Remove completed ones
for wt in .claude/worktrees/ED-*; do
  task=$(basename "$wt")
  echo "Removing worktree: $task"
  git worktree remove "$wt" 2>/dev/null || echo "  (still has changes)"
done

# Prune stale references
git worktree prune
```

## Key Rules

1. **Never use `--delete-branch`** with `gh pr merge` when working in a worktree
2. **Never switch branches** inside a worktree — it defeats the isolation purpose
3. **Clean up worktrees from the main repo**, not from inside them
4. **Prune after cleanup** to keep `git worktree list` accurate
