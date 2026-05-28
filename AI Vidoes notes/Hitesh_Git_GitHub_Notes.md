# 🌿 Git & GitHub — Complete Notes (Hitesh Choudhary Series)
> Every concept, every command, every workflow — from version control basics to open source contribution.

---

## 📌 Table of Contents
1. [What is Git? — The Big Picture](#1-what-is-git--the-big-picture)
2. [Git vs GitHub — Critical Difference](#2-git-vs-github--critical-difference)
3. [Setup — Installing Git](#3-setup--installing-git)
4. [Key Terminology](#4-key-terminology)
5. [Starting a Repository — git init](#5-starting-a-repository--git-init)
6. [Checking Status — git status](#6-checking-status--git-status)
7. [The Three Stages of Git](#7-the-three-stages-of-git)
8. [Staging Files — git add](#8-staging-files--git-add)
9. [Committing — git commit](#9-committing--git-commit)
10. [Viewing History — git log](#10-viewing-history--git-log)
11. [Atomic Commits — The Right Way to Commit](#11-atomic-commits--the-right-way-to-commit)
12. [Git Configuration — git config](#12-git-configuration--git-config)
13. [.gitignore — Hiding Sensitive Files](#13-gitignore--hiding-sensitive-files)
14. [Inside the .git Folder](#14-inside-the-git-folder)
15. [How Commits Work Internally (Hashing)](#15-how-commits-work-internally-hashing)
16. [Branches — git branch](#16-branches--git-branch)
17. [Switching Branches — git checkout / git switch](#17-switching-branches--git-checkout--git-switch)
18. [Merging Branches — git merge](#18-merging-branches--git-merge)
19. [Merge Conflicts — How to Resolve](#19-merge-conflicts--how-to-resolve)
20. [git diff — Comparing Changes](#20-git-diff--comparing-changes)
21. [git stash — Temporary Shelf](#21-git-stash--temporary-shelf)
22. [git checkout for Time Travel](#22-git-checkout-for-time-travel)
23. [git rebase — Rewriting History](#23-git-rebase--rewriting-history)
24. [GitHub — Remote Repository Setup](#24-github--remote-repository-setup)
25. [SSH Key Setup](#25-ssh-key-setup)
26. [Connecting to GitHub — git remote](#26-connecting-to-github--git-remote)
27. [Pushing Code — git push](#27-pushing-code--git-push)
28. [Pulling & Fetching — git pull vs git fetch](#28-pulling--fetching--git-pull-vs-git-fetch)
29. [Cloning a Repository — git clone](#29-cloning-a-repository--git-clone)
30. [Open Source Contribution — The Full Workflow](#30-open-source-contribution--the-full-workflow)
31. [All Commands Quick Reference](#31-all-commands-quick-reference)

---

## 1. What is Git? — The Big Picture

Imagine you are building a complex video game level. You don't want to do everything in one go — you need **checkpoints** so that if something goes wrong, you can go back to the last safe point.

**Git is exactly that for software.**

Git is a **Version Control System (VCS)** — it keeps track of every file change in your project and lets you create checkpoints (called commits) so you can:
- Go back to any previous state of your code
- See exactly what changed between any two points in time
- Collaborate with 100 other developers on the same codebase safely

**Why do you need this?**
- Software breaks. You need to go back to when it worked.
- Multiple engineers work on the same file. You need to coordinate.
- You need a history of who changed what, when, and why.

> 💡 **Hitesh's goal for this series:** Not to memorize thousands of commands, but to understand the **workflow** of git — what happens behind the scenes, what's inside the `.git` folder, and why each command exists.

---

## 2. Git vs GitHub — Critical Difference

This confuses most beginners. They are **two completely different things**:

| | Git | GitHub |
|---|---|---|
| **What it is** | Software (a program) | Service/Platform (a website) |
| **What it does** | Tracks changes in your local files | Stores your git history online (cloud) |
| **Who made it** | Linus Torvalds | Microsoft (acquired) |
| **Alternatives** | Nothing — git is git | GitLab, BitBucket, many others |
| **Without the other** | Works fine locally | Needs git to function |

**Simple analogy:**
- Git = the software on your computer that takes photos (commits) of your code
- GitHub = the Google Photos account where you store and share those photos

Other services like GitHub:
- **GitLab** — popular alternative, especially for private projects
- **BitBucket** — popular in enterprises (Atlassian ecosystem)

---

## 3. Setup — Installing Git

### Download Git
Website: **git-scm.com** (SCM = Source Control Management)

The website auto-detects your OS and gives you the right installer. Install is simple: open file → Next → I Agree → Done.

### Verify Installation

```bash
git --version
# or
git -v
```

Output example:
```
git version 2.39.1
```

> **Note:** Git is very stable software. Anything above version 2.1 works fine. Git never ships breaking changes.

### Recommended Tools
- **Terminal:** Warp (Mac/Linux) — redesigned terminal, very modern. Any terminal works.
- **Code Editor:** VS Code — best for visualizing git changes alongside code
- **VS Code Plugin:** GitLens — shows commit history, branches, and diffs visually inside VS Code

---

## 4. Key Terminology

| Term | Meaning |
|---|---|
| **Repository (Repo)** | A folder being tracked by git. Just a regular folder + git tracking. |
| **Commit** | A checkpoint/snapshot of your files at a specific point in time |
| **Staging Area** | An intermediate zone between writing code and committing |
| **Branch** | An alternative timeline of your codebase |
| **HEAD** | A pointer showing where you currently are in the git history |
| **Remote** | A version of your repository stored online (GitHub, GitLab, etc.) |
| **Clone** | Download a remote repository to your local machine |
| **Push** | Upload your local commits to the remote repository |
| **Pull** | Download latest changes from remote to local |
| **Fork** | Create your own copy of someone else's repository |
| **Pull Request (PR)** | Request to merge your changes into someone else's repository |

---

## 5. Starting a Repository — git init

Installing git does NOT mean git is tracking your folders. You must explicitly tell git which folder to track.

**Check current situation first:**
```bash
git status
# If not a git repo: "fatal: not a git repository"
```

**Initialize git in a folder:**
```bash
cd my-project/
git init
```

Output:
```
Initialized empty Git repository in /path/to/my-project/.git/
hint: Using 'master' as the name for the initial branch.
```

**Important rules:**
- Run `git init` only **ONCE per project** — at the very beginning
- Do NOT run `git init` inside a folder that is already a git repository
- Git tracking is folder-specific — initializing one folder does NOT track sibling folders

**Example: 3 folders, but only track 2:**
```bash
mkdir git-one git-two git-three
cd git-one && git init    # ← now tracked
cd ../git-two && git init # ← now tracked
# git-three is never initialized → never tracked
```

---

## 6. Checking Status — git status

**The most important command in git. Run it constantly.**

```bash
git status
```

What it tells you:
- Which branch you're on
- What files are untracked (git doesn't know about them yet)
- What files are in the staging area (ready to commit)
- What files have been modified since last commit

**Example outputs:**

Fresh, empty repository:
```
On branch master
No commits yet
nothing to commit (create/copy files to start)
```

After creating files (but not adding them):
```
On branch master
Untracked files:
  (use "git add <file>..." to include in what will be committed)
        test1.txt
        test2.txt
```

After `git add test1.txt`:
```
On branch master
Changes to be committed:
  (use "git rm --cached <file>..." to unstage)
        new file:   test1.txt

Untracked files:
        test2.txt
```

After committing:
```
On branch master
nothing to commit, working tree clean
```

> 💡 **Habit to build:** Run `git status` before and after every operation. Make it automatic like breathing.

---

## 7. The Three Stages of Git

This is the core workflow of git. Every change goes through these three stages:

```
┌─────────────────────────────────────────────────────────────────┐
│  WORKING              STAGING              LOCAL REPO           │
│  DIRECTORY            AREA                 (Committed)          │
│                                                                  │
│  [Your code files] → git add → [Ready to  → git commit → [Safe │
│  (changes made        ──────    commit]      ─────────   check- │
│   not yet tracked)             (staged)                  point] │
│                                                                  │
│  ← ─ ─ ─ ─ ─ ─ ─  git restore  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ → │
└─────────────────────────────────────────────────────────────────┘
                                          ↓ git push
                                    REMOTE REPO (GitHub)
```

**Stage 1 — Working Directory:**
You write code, create files, delete files. Git knows about them but is not tracking changes yet.

**Stage 2 — Staging Area:**
You've decided these changes are ready. Like pressing "Yes" on the game save dialog. Not committed yet, but selected for next commit. You can add or remove files from here.

**Stage 3 — Local Repository (Committed):**
The checkpoint is saved. This is permanent history in your local `.git` folder.

**Stage 4 — Remote Repository (GitHub):**
You push your commits online. Safe forever, shareable with team.

---

## 8. Staging Files — git add

```bash
# Add a specific file
git add filename.txt

# Add multiple specific files (space-separated)
git add file1.txt file2.txt

# Add all files in current directory (use with caution!)
git add .
```

**Why not always use `git add .`?**
Using `.` adds everything including sensitive files (API keys, passwords). Always be intentional about what you're staging. Add only files that are ready.

**Remove a file from staging (unstage):**
```bash
git rm --cached filename.txt
```

This removes the file from staging area but keeps it in your working directory.

---

## 9. Committing — git commit

A commit = a permanent checkpoint. It requires a message explaining what this checkpoint contains.

**The right way to commit:**
```bash
git commit -m "your commit message here"
```

**What `-m` does:** Provides the commit message directly in the command line. Without `-m`, git opens your default text editor (usually Vim — scary for beginners).

**If you accidentally open Vim:**
- Press `Esc` first
- Then type `:q` → Enter (quit)
- Or type `:q!` → Enter (force quit)

**To change default editor to VS Code:**
```bash
git config --global core.editor "code --wait"
```

**Pro shortcut — add + commit together:**
```bash
git commit -am "your message"
# -a = add all tracked (modified) files
# -m = message
# Note: This only stages already-tracked files, not brand new files
```

**What happens after commit:**
```bash
git status
# "nothing to commit, working tree clean"
# Your committed file disappears from the untracked/modified list
```

---

## 10. Viewing History — git log

```bash
# Full log (shows hash, author, date, message)
git log

# Compact one-line log
git log --oneline

# Example output of git log --oneline:
# 4c8a3b1 (HEAD -> master) add third and fourth file
# f2e1a90 add second file to code base
# 8d3c7e2 add file one
```

**What you see in full `git log`:**
```
commit 4c8a3b1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b
Author: Your Name <your@email.com>
Date:   Mon Jan 1 12:00:00 2024 +0530

    add file one
```

**Each commit shows:**
- Full SHA hash (unique identifier)
- Author name + email
- Date and time
- Commit message

> 💡 The short 6-8 character hash from `git log --oneline` is unique enough for your repository in 99.99% of cases.

---

## 11. Atomic Commits — The Right Way to Commit

**Atomic commit = one commit does one thing.**

Don't fix 10 bugs and commit everything together. Instead:
- One commit per bug fix
- One commit per feature
- One commit per component

**Why?**
- Easier to understand the history
- Easier to revert a single change
- This is the standard in professional companies

**Commit message style:**
There's a debate about this but the **official git recommendation** is:

> Use present tense, imperative mood — give orders to your codebase.

```bash
# Good ✅ (imperative - giving orders)
git commit -m "add navbar to homepage"
git commit -m "fix login bug in auth module"
git commit -m "update database connection config"

# Less preferred ❌ (past tense)
git commit -m "added navbar to homepage"
git commit -m "fixed login bug"
```

Think of it as: "Hey codebase, **do this**."

---

## 12. Git Configuration — git config

Git needs to know who you are when making commits (so the log shows the right author).

### Set your name and email (do this once, globally):
```bash
git config --global user.name "Your Name"
git config --global user.email "your@email.com"
```

Use quotes around values — especially for names with spaces.

### Set VS Code as default editor (avoids Vim hell):
```bash
# First: In VS Code → Cmd+Shift+P → "Install code command in PATH"
# Then:
git config --global core.editor "code --wait"
# --wait makes git wait until you close the file before continuing
```

### View your global config file:
```bash
cat ~/.gitconfig
```

Output shows:
```
[user]
    name = Your Name
    email = your@email.com
[core]
    editor = code --wait
```

### Config scope — Global vs Local:
```bash
# Global: applies to ALL git repos on your system (stored in ~/.gitconfig)
git config --global user.name "Your Name"

# Local: applies only to THIS specific repo (stored in .git/config)
git config user.name "Work Name"
```

Most people use global for name and email.

---

## 13. .gitignore — Hiding Sensitive Files

### Why .gitignore?

Some files must never be committed:
- `.env` — contains API keys, database passwords, secret tokens
- `node_modules/` — massive folder, auto-generated, not your code
- `.DS_Store` — Mac system files
- Build artifacts, cache files

If these get pushed to GitHub, anyone can see your API keys → your AWS account can get billed thousands of dollars, your OpenAI credits depleted, etc.

### Creating .gitignore:

```bash
touch .gitignore
```

**Rules:**
- File name must be exactly `.gitignore` (starts with dot, all lowercase)
- Place it in the root of your repo

### What to write inside .gitignore:

```
# Ignore a specific file
.env

# Ignore all files with this extension
*.log

# Ignore an entire folder
node_modules/

# Ignore a folder but not a specific file inside it
build/
!build/important.txt

# Ignore VS Code settings folder
.vscode/
```

### After adding to .gitignore:

Run `git status` — those files will no longer appear as untracked. Git completely ignores them.

### Generate .gitignore automatically:

Go to **gitignore.io** (or search "gitignore generator") → type your tech stack (node, django, react, etc.) → click Create → copy and paste the result.

VS Code also has plugins for this. No need to write it manually.

---

## 14. Inside the .git Folder

When you run `git init`, git creates a hidden folder called `.git` in your project:

```bash
ls -la   # shows hidden files
# → .git/
```

**Never manually edit files inside `.git/` — you can corrupt your entire repository.**

**What's inside .git:**
```
.git/
├── HEAD          ← points to current branch
├── config        ← repository-level configuration
├── description
├── hooks/        ← scripts that run before/after commits
├── info/
├── logs/         ← history of where HEAD pointed
├── objects/      ← all your commits/files stored here
└── refs/
    ├── heads/    ← branches (master, main, navbar, etc.)
    └── tags/
```

### HEAD file:
```bash
cat .git/HEAD
# → ref: refs/heads/master
```
HEAD always points to your current branch. When you switch branches, this file changes.

### refs/heads/:
Each branch is a file here. The file contains the commit hash that the branch points to:
```bash
cat .git/refs/heads/master
# → 4c8a3b1d2e3f4a5b6c7d8e9f...  (the hash of latest commit)
```

### hooks/ folder:
Contains sample scripts you can activate to run code automatically:
- `pre-commit` — runs before every commit (validate commit message format, run tests)
- `pre-push` — runs before every push
- `commit-msg` — validate/format commit message

Companies use hooks to enforce ticket IDs in commit messages, run linters, etc.

---

## 15. How Commits Work Internally (Hashing)

Each commit is a snapshot identified by a **SHA-1 hash** (a unique 40-character string).

**What makes up a commit:**
```
Commit 1 (first commit):
├── Hash:    abc123...
├── Message: "add index file"
├── Author:  Your Name
├── Date:    2024-01-01
├── Parent:  null  ← first commit has no parent
└── Files:   snapshot of all tracked files

Commit 2:
├── Hash:    def456...  ← generated from parent hash + content
├── Message: "update index file"
├── Author:  Your Name
├── Date:    2024-01-02
├── Parent:  abc123...  ← points to previous commit
└── Files:   snapshot of all tracked files

Commit 3:
├── Hash:    ghi789...
├── Parent:  def456...
└── ...
```

**Why this matters:**
- Every commit knows its parent → you can traverse the entire history backwards
- The hash is generated from the commit content + parent hash → if anyone tampers with history, hashes won't match → git detects corruption
- This chain of parent pointers is how git lets you "go back in time"

---

## 16. Branches — git branch

### What is a Branch?

A branch is an **alternative timeline** of your codebase. Multiple developers can work on the same project simultaneously without affecting each other's work.

```
Main branch (master/main):
○ ── ○ ── ○ ── ○ ── ○
                 ↓
         create 'navbar' branch:
○ ── ○ ── ○ ── ○ ── ○  ← master (still advancing)
              ╲
               ○ ── ○  ← navbar branch (parallel work)
```

Git is always on some branch. The default is called `master` (old) or `main` (modern standard).

### Branch Commands:

```bash
# See all branches (* = current branch)
git branch

# Create a new branch
git branch navbar
git branch bug-fix
git branch feature-login

# Delete a branch (after merging)
git branch -d navbar

# Rename current branch (e.g., master → main)
git branch -M main
```

---

## 17. Switching Branches — git checkout / git switch

```bash
# Switch to an existing branch
git checkout navbar
git switch navbar      # newer syntax, same effect

# Create a new branch AND switch to it (one command)
git checkout -b footer
git switch -c footer   # newer syntax, same effect
```

**What happens when you switch branches:**
Files in your working directory change! Files that exist in one branch but not the other appear/disappear. This is expected and normal.

```bash
# Example:
git checkout navbar
ls    # → navbar.html (exists here)
git checkout master
ls    # → navbar.html GONE (only exists in navbar branch)
```

**Rule: Always commit before switching branches.**
If you have uncommitted changes, git may refuse to switch (or worse, bring those changes into the new branch).

---

## 18. Merging Branches — git merge

When you're done working on a branch, bring its code into another branch (usually main/master).

**Important: Switch to the branch you want to RECEIVE the changes first.**

```bash
# Scenario: Bring navbar branch into master
git checkout master        # be on master (receiver)
git merge navbar           # bring navbar's code in
```

### Type 1 — Fast Forward Merge:
When master hasn't moved while you were working on your branch. Git just moves the master pointer forward.

```
Before merge:
○ ── ○ ──── (master stops here)
       ╲
        ○ ── ○ (navbar keeps going)

After fast-forward merge:
○ ── ○ ── ○ ── ○  (master now points to latest)
```

No merge commit needed — clean, simple.

### Type 2 — Three-Way Merge:
When both master AND your branch have new commits. Git creates a special "merge commit."

```
Before:
○ ── ○ ── ○ ── ○  (master kept working)
       ╲
        ○ ── ○    (navbar worked in parallel)

After merge:
○ ── ○ ── ○ ── ○ ── ○ (merge commit)
       ╲               /
        ○ ── ○ ── ────
```

Git opens your editor for the merge commit message (default: "Merge branch 'navbar'"). Save and close the file to complete.

---

## 19. Merge Conflicts — How to Resolve

Conflicts happen when **two branches changed the same part of the same file** in different ways. Git can't decide which version to keep — you must decide manually.

### When does a conflict occur?

```
master branch: index.html line 5 says "Footer added"
navbar branch: index.html line 5 says "Footer was added successfully"
```

Both changed the same line → conflict.

### What git does:

When you run `git merge navbar` and there's a conflict:
```
CONFLICT (content): Merge conflict in index.html
Automatic merge failed; fix conflicts and then commit the result.
```

### What the conflict looks like in the file:

```html
<<<<<<< HEAD
Footer added
=======
Footer was added successfully
>>>>>>> navbar
```

**Reading the conflict markers:**
- Everything between `<<<<<<< HEAD` and `=======` = current branch's version (what you had)
- Everything between `=======` and `>>>>>>> navbar` = incoming branch's version (what's being merged in)
- You must keep one, or write something entirely new

### How to resolve:

**Option A — VS Code (easiest):**
VS Code shows "Accept Current Change | Accept Incoming Change | Accept Both Changes" buttons. Click one.

**Option B — Manual:**
Delete everything you don't want, including ALL the marker lines (`<<<`, `===`, `>>>`):
```html
<!-- Before resolving: -->
<<<<<<< HEAD
Footer added
=======
Footer was added successfully
>>>>>>> navbar

<!-- After resolving (keeping incoming): -->
Footer was added successfully
```

Save the file, then:
```bash
git add index.html          # mark as resolved
git commit -m "merge navbar branch"  # complete the merge
```

> 💡 **There is no magic automation for conflicts.** Git cannot decide which code to keep — that's a human decision. It requires a conversation with the person whose code is conflicting with yours.

---

## 20. git diff — Comparing Changes

### What git diff shows:
The difference between **the same file at two different points in time**. NOT comparing two different files.

```bash
# Compare working directory vs staging area (unstaged changes)
git diff

# Compare staging area vs last commit (what's about to be committed)
git diff --staged

# Compare two specific commits
git diff abc123 def456

# Compare two commits (alternative syntax)
git diff abc123..def456

# Compare two branches
git diff master..navbar
```

### How to read the output:

```
diff --git a/index.html b/index.html
--- a/index.html       ← this is "file A" (the older version)
+++ b/index.html       ← this is "file B" (the newer version)
@@ -1,4 +1,6 @@
 <html>
-<h1>Old heading</h1>     ← lines in file A (older version)
+<h1>New heading</h1>     ← lines in file B (newer version)
+<p>New paragraph</p>     ← lines in file B (newer version)
 </html>
```

**CRITICAL: Read the symbols correctly:**
- `---` does NOT mean "deleted code" → it means "this is file A (older version)"
- `+++` does NOT mean "added code" → it means "this is file B (newer version)"
- Lines starting with `-` = present in file A (older) but not file B
- Lines starting with `+` = present in file B (newer) but not file A

**This is the #1 mistake beginners make with git diff.**

If you reverse the order of commit IDs in the command, the `+` and `-` symbols flip! This confirms they represent file A and file B, not added/removed.

**Exit the diff viewer:** Press `q`

---

## 21. git stash — Temporary Shelf

### The Problem:

You're working on bug-fix branch, mid-way through your changes (not committed yet). Your colleague urgently needs help on the footer branch. But git won't let you switch branches because you have uncommitted changes.

```bash
git switch footer
# ERROR: Your local changes to the following files would be overwritten...
# Please commit your changes or stash them before you switch branches.
```

### The Solution — git stash:

Stash temporarily saves your uncommitted work without committing it, lets you switch branches, and you can come back and restore your work later.

```bash
# Save current work to stash
git stash

# Now you can switch branches
git switch footer
# → Work on footer, help colleague

# Come back to your branch
git switch bug-fix

# Restore your saved work
git stash pop
```

### More stash commands:

```bash
# See all stashed items
git stash list
# Output:
# stash@{0}: WIP on bug-fix: abc123 some message
# stash@{1}: WIP on master: def456 other message

# Apply a specific stash (without removing it from list)
git stash apply stash@{0}

# Apply and remove from list (same as pop but explicit)
git stash pop
```

### Important caveats:

**Stash is NOT branch-specific.** You can pop a stash that was created on one branch onto a completely different branch. Be very careful with this — it can cause unexpected changes.

**Best practice:** Always check `git stash list` before popping. Know exactly what you're restoring and where.

**Stash is temporary.** Don't rely on stash for long-term storage of work. Commit when you're done.

---

## 22. git checkout for Time Travel

Git lets you travel back in time and see how your code looked at any previous commit.

### Go back to a specific commit:

```bash
# See your commit history first
git log --oneline

# Output:
# a1b2c3d (HEAD -> master) add footer
# e4f5g6h add hero section
# i7j8k9l add navbar
# m0n1o2p add index file  ← go back to here

# Checkout a specific commit (paste the hash)
git checkout m0n1o2p
```

Output: `HEAD is now at m0n1o2p add index file`

Now your files look exactly as they did at that commit. You're in **"detached HEAD" state** — HEAD is not pointing to a branch tip.

### Go back by number of commits:

```bash
# Go back 2 commits from HEAD
git checkout HEAD~2
# HEAD~1 = 1 commit back
# HEAD~2 = 2 commits back
```

### Come back to present:

```bash
# Most common way — just checkout the branch
git checkout master
git switch master

# If you forgot which branch you came from
git reflog   # shows history of where HEAD was → use to get back
```

### Restore a file to last commit state:

```bash
git restore filename.txt
# Discards ALL changes to this file since last commit
# WARNING: This is destructive — changes are lost forever
```

---

## 23. git rebase — Rewriting History

### ⚠️ CAUTION: Rebase rewrites commit history. Be very careful.

Real incident: Students ran rebase wrong in the last hour of a hackathon and their entire project got corrupted. They couldn't participate.

### What is rebase?

Rebase is an **alternative to merging** that keeps a cleaner, linear commit history. Instead of creating ugly merge commits, it "replants" your branch on top of the target branch.

**Merge creates:**
```
○ ── ○ ── ○ ── M  ← ugly merge commit
       ╲      /
        ○ ── ○
```

**Rebase creates:**
```
○ ── ○ ── ○ ── ○ ── ○  ← clean linear history
```

### The golden rule of rebase:

> **NEVER run rebase when on the main/master branch.**
> Only run rebase when on a feature/bug-fix branch.

### How to rebase:

```bash
# Make sure you are on your FEATURE branch (not main!)
git branch
# → * bug-fix   ← good, I'm on bug-fix

# Rebase your branch onto master
# (This means: take all my bug-fix commits and replay them on top of master)
git rebase master
```

**What this does:**
- Takes your branch's commits
- Temporarily removes them
- Updates your branch base to the latest master
- Replays your commits on top
- Result: clean linear history, no merge commits

### Handling conflicts during rebase:

```bash
git rebase master
# CONFLICT: Merge conflict in index.html
```

Steps to resolve:
1. Open the conflicting file and fix it (same as regular merge conflict)
2. Stage the fixed file:
   ```bash
   git add index.html
   ```
3. Continue the rebase (do NOT use `git commit`!):
   ```bash
   git rebase --continue
   ```
4. Git opens editor for the commit message → save and close
5. Continue until all conflicts resolved

**If you get scared mid-rebase and want to cancel:**
```bash
git rebase --abort
# Returns everything to how it was before rebase started
```

### When to use rebase vs merge:

| Situation | Use |
|---|---|
| Keeping a clean, linear commit history | Rebase |
| Working alone on a feature branch | Rebase |
| Work shared with other people | Merge (safer) |
| Pushing to GitHub | Generally avoid rebase (never rebase shared commits) |
| You're unsure | Merge (always safer) |

> 💡 Some companies REQUIRE rebase. Some forbid it. Know your company's convention.

---

## 24. GitHub — Remote Repository Setup

### What is GitHub?

GitHub is a cloud platform to:
- Back up your git repository online
- Collaborate with other developers
- Host open source projects
- Code review via Pull Requests
- CI/CD automation via GitHub Actions

### Create an account:
Go to github.com → Sign up → Verify email → Done.

### Create a new repository:
GitHub → New Repository → Fill in:
- **Repository name** (e.g., `learn-git`)
- **Public vs Private**
- Don't add README/gitignore from GitHub if you already have a local repo

---

## 25. SSH Key Setup

GitHub doesn't accept username/password for pushing code. You must use **SSH keys**.

### Why SSH?
SSH keys are cryptographic key pairs:
- **Private key** = stays on your computer (never share)
- **Public key** = you paste this on GitHub

When you push code, GitHub verifies you are who you say you are by checking if your private key matches the public key you registered.

### Step 1 — Generate SSH key:

```bash
# Mac/Linux (in terminal):
ssh-keygen -t ed25519 -C "your@email.com"

# When prompted for file location: press Enter (use default)
# When prompted for passphrase: press Enter (leave empty) or set one
```

This creates two files:
- `~/.ssh/id_ed25519` (private key — never share)
- `~/.ssh/id_ed25519.pub` (public key — this goes on GitHub)

### Step 2 — Add key to SSH agent (Mac):

```bash
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519
```

### Step 3 — Copy your public key:

```bash
# Mac:
pbcopy < ~/.ssh/id_ed25519.pub

# Linux:
cat ~/.ssh/id_ed25519.pub   # then manually copy the output
```

### Step 4 — Add to GitHub:

GitHub → Settings → SSH and GPG keys → New SSH key → Paste public key → Save

**For Windows:** Use Git Bash (installed with git), follow the same commands. GitHub documentation has Windows-specific instructions.

> ⚠️ Always refer to GitHub's official documentation (docs.github.com → search "SSH") — the algorithms and steps change over time and docs are always current.

---

## 26. Connecting to GitHub — git remote

### Check existing remotes:
```bash
git remote -v
# Empty = no remote configured
# Otherwise shows:
# origin  git@github.com:username/repo.git (fetch)
# origin  git@github.com:username/repo.git (push)
```

### Add a remote:
```bash
git remote add origin git@github.com:username/repo-name.git
# "origin" = the name we're giving this remote (convention, can be anything)
# The URL = your GitHub repo's SSH URL
```

### Rename a remote:
```bash
git remote rename origin production
# Changes the name from "origin" to "production"
```

### Remove a remote:
```bash
git remote remove origin
```

### Why is it called "origin"?
`origin` is just a conventional name for the main remote. It could be called anything (`superman`, `github`, `production`). But everybody calls it `origin` — don't change it.

---

## 27. Pushing Code — git push

### Basic push:
```bash
git push origin main
# Push local "main" branch to remote "origin"

git push origin master
# Push local "master" branch to remote "origin"
```

### First push — rename branch and set upstream:

If your local branch is `master` but GitHub wants `main`:
```bash
git branch -M main          # rename master → main
git remote add origin URL   # connect to GitHub
git push -u origin main     # push AND set upstream
```

### What is `-u` (upstream)?

The `-u` flag links your local branch to the remote branch permanently. After doing this once:

```bash
# Instead of:
git push origin main

# You can just write:
git push
# Git automatically knows: push main to origin/main
```

This works because git remembers the upstream link you set with `-u`.

Full equivalent:
```bash
git push --set-upstream origin main
# Same as: git push -u origin main
```

### Push any branch (not just main):
```bash
git push origin bug-fix
git push origin footer
```

---

## 28. Pulling & Fetching — git pull vs git fetch

When collaborators push changes to GitHub, you need to bring them to your local machine.

### git fetch:

```bash
git fetch origin
```

- Downloads all changes from remote into your LOCAL REPO
- **Does NOT update your working directory**
- Like "let me check what's new on GitHub without actually applying it"
- Safe — your current work is not affected

### git pull:

```bash
git pull origin main
# or just:
git pull   # if upstream is set
```

- Downloads changes from remote AND merges them into your working directory
- `git pull` = `git fetch` + `git merge`
- Your files get updated immediately

### When to use which:

| Situation | Command |
|---|---|
| Want to see what changed before applying | `git fetch` |
| Confident the changes won't conflict | `git pull` |
| Working in a team, cautious | `git fetch` then review, then `git merge` |
| Quick update for solo project | `git pull` |

---

## 29. Cloning a Repository — git clone

Download any GitHub repository (yours or someone else's) to your local machine.

```bash
git clone https://github.com/username/repo-name.git
# Creates a new folder named repo-name with all the code inside

# Or clone into a specific folder name:
git clone https://github.com/username/repo-name.git my-folder-name
```

**What git clone does:**
- Downloads ALL files and ALL git history
- Sets up `origin` remote automatically pointing to the cloned URL
- Checks out the default branch

**HTTPS vs SSH URL:**
- HTTPS: `https://github.com/username/repo.git` — simpler, browser-like
- SSH: `git@github.com:username/repo.git` — requires SSH key setup, more secure

Most people use HTTPS for cloning public repos they're just reading. Use SSH for repos you'll push to.

---

## 30. Open Source Contribution — The Full Workflow

### What is Open Source?

Open source is a **philosophy**: software should be distributed freely so programmers can save time and contribute back to the community. It's your **donation of code** to the developer community.

> ⚠️ Common misconception: "Open source contribution = job guarantee." **NOT TRUE.** It may help open doors as proof you can read large codebases and write quality code, but it's not guaranteed. Treat it as a donation — not a transaction.

### The 5-Step Process:

**Step 1 — TALK to maintainers first**
Before writing a single line of code:
- Find the project on GitHub → Issues tab → open a new issue
- Or contact via Discord/Slack/Twitter
- Ask: "Can I work on this feature/bug?"
- Wait for response. **Don't start coding without confirmation.**

Why? Because maintainers might already be working on it, or might have a different approach in mind. Jumping in without talking wastes everyone's time.

**Step 2 — Open an Issue**
Create an issue documenting:
- What bug you found / what feature you want to add
- Why it's valuable
- How you plan to implement it

Get the issue **assigned to you** so others know you're working on it.

**Step 3 — Fork the Repository**
```bash
# On GitHub: Repository → Fork → Create Fork
# This creates your own copy of the repo under YOUR GitHub account
```

Then clone YOUR fork (not the original):
```bash
git clone git@github.com:YOUR-USERNAME/repo-name.git
```

**Step 4 — Create a feature branch**
NEVER work on main/master directly.

```bash
git checkout -b fix-navbar-bug
# or
git switch -c add-login-feature
```

Make your changes, commit them:
```bash
git add .
git commit -m "fix: navbar link not working on mobile"
```

Push to YOUR fork:
```bash
git push origin fix-navbar-bug
```

**Step 5 — Create a Pull Request (PR)**
On GitHub, after pushing your branch, you'll see "Compare & pull request" button.

Fill in:
- **Title:** Clear, specific (not "update readme")
- **Description:** Detailed explanation of:
  - What problem does this fix?
  - What did you change?
  - How to test it?
  - Screenshots if UI changes

```
Example PR description:

## Problem
The navbar contact link was returning 404 on mobile browsers.

## Changes Made
- Fixed anchor tag href in navbar.html (line 23)
- Added contact.html page with form

## Testing
- Tested on Chrome mobile, Safari iOS, Firefox Android

## Screenshots
[attach screenshots if UI changes]
```

Take your time writing this. A good PR description shows professionalism.

**Step 6 — Iterate on Feedback**
Maintainers will review and may ask for changes. This is NORMAL.

- Don't get upset if changes are requested
- Respond professionally to comments
- Make requested changes, push again (updates the same PR automatically)
- Have patience — maintainers have full-time jobs too

**Step 7 — PR Merged! 🎉**
Your code is now part of the open source project. Share it on Twitter and LinkedIn!

### What is a Fork exactly?

A fork creates YOUR OWN COPY of someone else's repository under your GitHub account:
- Original: `original-author/project`
- Your fork: `your-username/project`

You have full control over your fork. Make all changes there. Then request the original author to pull your changes via Pull Request.

### What about spamming?

There was a real incident where thousands of people started making trivial "fix readme typo" pull requests to popular open source repos (like Express.js) just to get a GitHub contribution badge. This is called **spam PRs** and is frowned upon by the entire community.

> **Add value. Don't spam.** If you're fixing code → great. If you're fixing a one-character typo in a readme just for a badge → please don't.

---

## 31. All Commands Quick Reference

### Setup & Config

```bash
git --version                          # check git version
git config --global user.name "Name"   # set name
git config --global user.email "e@m"  # set email
git config --global core.editor "code --wait"  # set VS Code as editor
cat ~/.gitconfig                       # view global config
```

### Repository

```bash
git init                   # initialize git in current folder (run once per project)
git status                 # check status (run often!)
```

### Staging & Commits

```bash
git add filename.txt       # stage specific file
git add file1 file2        # stage multiple files
git add .                  # stage everything (be careful!)
git rm --cached filename   # unstage a file
git commit -m "message"    # commit with message
git commit -am "message"   # add tracked files + commit in one step
git restore filename.txt   # discard changes (back to last commit)
```

### History

```bash
git log                    # full commit history
git log --oneline          # compact one-line history
git reflog                 # history of where HEAD pointed
```

### Branches

```bash
git branch                 # list all branches
git branch navbar          # create a branch
git branch -M main         # rename current branch
git branch -d navbar       # delete a branch
git checkout navbar        # switch to branch
git switch navbar          # switch to branch (newer)
git checkout -b footer     # create + switch in one command
git switch -c footer       # create + switch in one command (newer)
```

### Merging

```bash
# First: switch to the branch receiving the merge
git checkout master
git merge navbar           # merge navbar into master
```

### Comparing

```bash
git diff                   # working directory vs staging
git diff --staged          # staging vs last commit
git diff commit1 commit2   # between two commits
git diff branch1..branch2  # between two branches
```

### Stashing

```bash
git stash                  # save uncommitted work temporarily
git stash pop              # restore most recent stash
git stash list             # see all stashes
git stash apply stash@{0}  # apply specific stash (keep in list)
```

### Time Travel

```bash
git checkout abc123        # go to a specific commit
git checkout HEAD~2        # go back 2 commits
git checkout master        # come back to latest
git reflog                 # find your way back if lost
```

### Rebase (⚠️ caution)

```bash
# Make sure you're on FEATURE branch, NOT main
git rebase master          # rebase current branch onto master
git rebase --continue      # continue after resolving conflicts
git rebase --abort         # cancel rebase entirely
```

### Remote & GitHub

```bash
git remote -v              # see remote connections
git remote add origin URL  # connect to GitHub repo
git remote rename old new  # rename a remote
git remote remove origin   # remove a remote
git push origin main       # push to GitHub
git push -u origin main    # push + set upstream (do this once)
git push                   # push (after upstream is set)
git pull                   # fetch + merge from remote
git fetch origin           # download remote changes (no merge)
git clone URL              # download a repo to local machine
```

---

## The Complete Git Workflow Summary

```
1. Start a project:
   mkdir my-project && cd my-project
   git init

2. Write code (create/modify files)

3. Check what's going on:
   git status

4. Stage the changes you want:
   git add specific-file.txt

5. Commit with a meaningful message:
   git commit -m "add login feature"

6. Repeat 2-5 for each logical unit of work

7. Connect to GitHub (first time only):
   git remote add origin git@github.com:username/repo.git
   git push -u origin main

8. Push subsequent changes:
   git push

9. Pull changes from teammates:
   git pull

10. Create feature branches:
    git switch -c new-feature
    # ... work ...
    git merge new-feature  (from main branch)
```

---

*Notes from Hitesh Choudhary's Git & GitHub series — complete coverage of version control concepts, git init/add/commit/log, configuration, .gitignore, .git folder internals, hashing, branches, merging, merge conflicts, git diff, git stash, time travel with checkout, git rebase (with caution), GitHub setup with SSH, remote connections, push/pull/fetch/clone, and open source contribution workflow with fork and pull requests.*
