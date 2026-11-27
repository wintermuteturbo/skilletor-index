// Lists search.json and filters it as `skilletor search` does (D114): an entry matches when its
// name or description holds any of the words, ignoring case; entries holding more of them come
// first, then in the file's order. Every value is set as text, never as HTML, since descriptions
// come from the listed repositories.
"use strict";

const query = document.getElementById("q");
const status = document.getElementById("status");
const results = document.getElementById("results");
let entries = [];

function matching(words) {
  if (words.length === 0) return entries;
  const found = [];
  entries.forEach((entry, order) => {
    const name = entry.name.toLowerCase();
    const description = entry.description.toLowerCase();
    const held = words.filter((word) => name.includes(word) || description.includes(word)).length;
    if (held > 0) found.push({ entry, held, order });
  });
  found.sort((a, b) => b.held - a.held || a.order - b.order);
  return found.map((item) => item.entry);
}

// A repository's web page, for a github.com or other https remote; none for anything else.
function repositoryLink(remote) {
  if (typeof remote !== "string" || !remote.startsWith("https://")) return null;
  return remote.replace(/\.git$/, "");
}

function text(tag, className, value) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  element.textContent = value;
  return element;
}

function copyButton(command) {
  const button = text("button", "copy", "Copy");
  button.type = "button";
  button.setAttribute("aria-label", `Copy ${command}`);
  button.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(command);
      button.textContent = "Copied";
    } catch {
      button.textContent = "Select it";
    }
    setTimeout(() => { button.textContent = "Copy"; }, 1500);
  });
  return button;
}

function item(entry) {
  const li = document.createElement("li");
  const head = document.createElement("div");
  head.className = "head";
  head.append(text("span", "name", entry.name), text("span", "version", entry.version));
  if (entry.kind === "collection") head.append(text("span", "kind", "collection"));
  li.append(head, text("p", "description", entry.description));

  const link = repositoryLink(entry.repository);
  if (link) {
    const a = text("a", "repository", link.replace(/^https:\/\//, ""));
    a.href = link;
    a.rel = "noopener";
    li.append(a);
  }

  const command = `skilletor add ${entry.name}`;
  const row = document.createElement("div");
  row.className = "command";
  row.append(text("code", null, command), copyButton(command));
  li.append(row);
  return li;
}

function show() {
  const words = query.value.toLowerCase().split(/\s+/).filter(Boolean);
  const shown = matching(words);
  results.replaceChildren(...shown.map(item));
  const total = entries.length;
  if (total === 0) {
    status.textContent = "The index lists nothing yet.";
  } else if (words.length === 0) {
    status.textContent = `${total} ${total === 1 ? "package" : "packages"} listed.`;
  } else {
    status.textContent = shown.length === 0
      ? "Nothing matches. Try fewer or shorter words."
      : `${shown.length} of ${total} match.`;
  }
}

async function load() {
  try {
    const response = await fetch("search.json", { cache: "no-cache" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const file = await response.json();
    if (!Array.isArray(file)) throw new Error("search.json isn't a list");
    entries = file.filter((entry) => entry && typeof entry.name === "string"
      && typeof entry.description === "string" && typeof entry.version === "string");
    show();
  } catch (error) {
    status.textContent = `The index's search file couldn't be read (${error.message}).`;
  }
}

query.addEventListener("input", show);
load();
