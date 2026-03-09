# Fork Maintenance Guide

This fork maintains patches on top of [openclaw/openclaw](https://github.com/openclaw/openclaw) for the verapillars use case.

## Current Patches

### xhigh Thinking Support for Additional Models

**File:** `src/auto-reply/thinking.ts`

Adds extended thinking (`effort: "max"`) support for:
- `anthropic/claude-opus-4-6`
- `anthropic/claude-sonnet-4-6`
- `novita/zai-org/glm-5`
- `novita/moonshotai/kimi-k2.5`
- `novita/minimax/minimax-m2.5`
- `novita/qwen/qwen3.5-397b-a17b`

## Update Workflow

When a new upstream release is published:

```bash
# 1. Fetch and preview
cd /tmp/openclaw-fork
git fetch upstream --tags
git log HEAD..upstream/main --oneline  # See what's new
```

### 2. Pre-Merge Patch Analysis (CRITICAL)

For each patched file, diff against upstream:

```bash
git diff upstream/main -- src/auto-reply/thinking.ts
```

Classify each patch:
- ✅ **Still needed** — Upstream doesn't have this feature
- ❌ **No longer needed** — Upstream added equivalent (drop our patch)
- ⚠️ **Needs adaptation** — Upstream changed file structure (rebuild patch)

Document findings before merging.

### 3. Merge

```bash
git merge upstream/main
# Resolve conflicts if any
# Apply adaptations identified in step 2
```

### 4. Post-Merge Validation

```bash
# Verify patches still present
pnpm install && pnpm build
```

### 5. Push Fork

```bash
git push origin main
```

### 6. Update Homebrew Tap

```bash
cd /tmp/homebrew-tap
REV=$(cd /tmp/openclaw-fork && git log -1 --format="%H")
# Edit Formula/openclaw-fork.rb: update revision and version
git commit -am "chore: bump to v2026.3.X" && git push
```

## Installation

```bash
brew tap verapillars/openclaw
brew install openclaw-fork
```

## Updating

```bash
brew untap verapillars/openclaw --force
brew tap verapillars/openclaw
brew upgrade openclaw-fork
```

## Related

- Upstream: [openclaw/openclaw](https://github.com/openclaw/openclaw)
- Homebrew Tap: [verapillars/homebrew-openclaw](https://github.com/verapillars/homebrew-openclaw)
