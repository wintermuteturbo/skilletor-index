# skilletor-index

The public index of [skilletor](https://skilletor.bartoldi.xyz): agent skills from public git repositories, which `skilletor search` finds and `skilletor add @owner/skill` installs. This repository is the index's source; Cloudflare serves its files at `https://index.skilletor.bartoldi.xyz`. The index hosts no skill's files: each line points at a repository, a commit and the skill's folder.

## Use it

skilletor 0.3.1 and later use this index by default, as the registry named `skilletor`, for every scope no registry of your own serves:

```sh
skilletor search diagrams
skilletor add -g @wintermuteturbo/diagrams
```

With skilletor 0.2.0, add it to a manifest, your user manifest `~/.config/skilletor/skilletor.toml` or a project's `skilletor.toml`. The URL ends in two slashes because 0.2.0 refuses an index URL with nothing after the host's `/`. When it's the only registry a manifest names, it serves every scope, whatever `scopes` lists:

```toml
[registries.skilletor]
index = "https://index.skilletor.bartoldi.xyz//"
scopes = ["@wintermuteturbo"]
```

0.3.0 uses the index by default too, but can't install the skills whose repository keeps its licence in a `LICENSE.md` or `LICENSE.txt` above them; update to 0.3.1.

## What gets listed

- **Names.** A skill is `@<owner>/<skill>`, `<owner>` being its repository's GitHub owner, and the scope is that owner's. The maintainers may list an owner's public skills until the owner claims the scope with a pull request from that account, or as a member of that organization. From then on only the owner adds lines to it.
- **Licences.** Only skills under OSI-approved licences, read from the skill's `license` frontmatter when it's an SPDX expression, else from a licence file in its folder, else from the repository's. A skill without one, or under another licence, isn't listed.
- **Versions.** A skill's version is its own tag (`<skill>@1.2.0` or `<skill>-v1.2.0`), else the repository's newest semver tag (`v1.2.0`). In a repository with no tag, it's `0.0.0-<commit time>-<commit>`, which any release outranks. A new version is listed only when the skill's folder changes.
- **Not listed:** copies of a skill in other agents' folders (`.claude/skills/`, `.<agent>/skills/`) and translations under `docs/<lang>/`.

## Add your skills

- **Propose a repository:** open a pull request that adds its URL to `repositories.txt`, one repository per line. A repository outside GitHub is followed by a space and the owner whose scope its skills take. Once it merges, the daily refresh lists the repository's skills, and their later versions as they're tagged.
- **Publish a skill:** run `skilletor publish` in the skill's repository. It opens a pull request with the skill's line, and adds the repository to `repositories.txt`, so later versions are refreshed too.

Every pull request runs `skilletor-index check --osi`, and a maintainer merges it.

## Removing a listing

Lines are never edited or deleted, because lockfiles record them. To remove a skill, its owner asks in an issue, and every version is marked yanked. A yanked version stays installable for the lockfiles that recorded it, and `add` and `search` no longer offer it.

## How it works

| File | Holds |
|---|---|
| `config.json` | The index's protocol, name and search file, and where `skilletor publish` opens its pull requests |
| `packages/@<owner>/<skill>.jsonl` | One line per version: the repository, commit, folder, tree digest and licence |
| `repositories.txt` | The repositories the daily refresh lists |
| `index.html`, `browse.js`, `browse.css` | The page at `https://index.skilletor.bartoldi.xyz/` that lists the index and filters it as `skilletor search` does |

- **Check**, on every pull request: each line validates, its content matches its tree digest, and its licence is the one the content names and OSI-approved.
- **Refresh**, daily at 06:17 UTC and by hand: lists every repository in `repositories.txt` again and opens a pull request from the `refresh` branch with the new lines.
- **Deploy**, on every push to main: checks the index again, writes `search.json` and deploys the files and the page.

`skilletor-index` is skilletor's index tool, installed from [skilletor's releases](https://github.com/wintermuteturbo/skilletor-releases) at the version and checksum pinned in `.github/actions/skilletor-index/action.yml`.
