# Sleep-Fit-Stats Git Workflow

This document outlines our Git workflow for the Sleep-Fit-Stats project.

## Branch Structure

Our project maintains three types of branches:

1. **`master`** - Production-ready code
2. **`develop`** - Integration branch for testing features
3. **Feature/Issue branches** - Individual feature development

## Workflow Overview

```
master  ─────────────────────────────────┐
                                         └─── (merge when ready for production)
develop ────────┬───────────────────┬────┐
         │      │                   │    │
feature/X ┘      feature/Y ─────────┘    feature/Z
```

## Branch Naming Convention

All feature branches should follow this naming convention:

- **Feature development**: `feature/issue-{number}-{short-description}`
- **Bug fixes**: `fix/issue-{number}-{short-description}`
- **Refactoring**: `refactor/issue-{number}-{short-description}`

Example: `feature/issue-12-sleep-tracking-dashboard`

## Development Workflow

### Starting a New Feature

1. Create an issue in GitHub for the feature
2. Create a new branch from `develop`:

```powershell
git checkout develop
git pull origin develop
git checkout -b feature/issue-{number}-{description}
```

### Working on the Feature

1. Make commits with clear messages:

```powershell
git add .
git commit -m "Add sleep tracking model #12"
```

2. Push your branch to GitHub:

```powershell
git push -u origin feature/issue-{number}-{description}
```

### Completing a Feature

1. Make sure your feature branch is up to date with the develop branch:

```powershell
git checkout develop
git pull origin develop
git checkout feature/issue-{number}-{description}
git merge develop
```

2. Resolve any merge conflicts

3. Create a pull request from your feature branch to `develop` branch

   - Include "Closes #{issue-number}" in the PR description

4. After PR is approved and merged, delete the feature branch:

```powershell
git checkout develop
git pull origin develop
git branch -d feature/issue-{number}-{description}
```

### Releasing to Production

When the `develop` branch is ready for production:

1. Create a pull request from `develop` to `master`
2. Review all changes
3. Merge the PR
4. Tag the release:

```powershell
git checkout master
git pull origin master
git tag -a v{version} -m "Release version {version}"
git push origin v{version}
```

## Git Commands Quick Reference

### Branch Management

```powershell
# Create a new branch
git checkout -b feature/issue-12-sleep-tracking

# Switch branches
git checkout develop

# Delete a branch
git branch -d feature/issue-12-sleep-tracking

# List all branches
git branch -a
```

### Committing Code

```powershell
# Stage changes
git add .

# Commit with message
git commit -m "Add sleep tracking API #12"

# Push to remote
git push -u origin feature/issue-12-sleep-tracking
```

### Merging

```powershell
# Merge develop into your feature branch
git checkout feature/issue-12-sleep-tracking
git merge develop

# Resolve conflicts if needed
git add .
git commit -m "Resolve merge conflicts"
```

### Updating Your Branch

```powershell
# Update your branch with latest changes from develop
git checkout develop
git pull origin develop
git checkout feature/issue-12-sleep-tracking
git merge develop
```

## Best Practices

1. **Commit Often**: Make small, focused commits
2. **Write Clear Commit Messages**: Include issue references
3. **Keep Pull Requests Small**: Easier to review and merge
4. **Update from Develop Regularly**: Avoid major merge conflicts
5. **Use Issue References**: Link commits and PRs to issues

---

_This workflow document was last updated on June 6, 2025_
