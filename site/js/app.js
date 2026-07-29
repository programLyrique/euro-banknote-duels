import { DENOMINATIONS, DESIGNS, imagePath } from "./designs.js";
import { createSession, isValidSession, previous, rank, voteFor, winners } from "./tournament.js";
import { TEXT } from "./translations.js";

const SESSION_KEY = "euro-banknote-pairwise-session-v1";
const LANGUAGE_KEY = "euro-banknote-pairwise-language";
const DESIGN_IDS = DESIGNS.map(({ id }) => id);
const byId = Object.fromEntries(DESIGNS.map((design) => [design.id, design]));

const elements = {
  intro: document.querySelector("#intro-view"),
  home: document.querySelector("#home-link"),
  vote: document.querySelector("#vote-view"),
  results: document.querySelector("#results-view"),
  start: document.querySelector("#start-button"),
  progressLabel: document.querySelector("#progress-label"),
  progressBar: document.querySelector("#progress-bar"),
  denominations: document.querySelector("#denomination-controls"),
  sideToggle: document.querySelector("#side-toggle"),
  matchup: document.querySelector("#matchup"),
  back: document.querySelector("#back-button"),
  resultsHero: document.querySelector("#results-hero"),
  standings: document.querySelector("#standings"),
  review: document.querySelector("#review-button"),
  reset: document.querySelector("#reset-button"),
  dialog: document.querySelector("#reset-dialog"),
  confirmReset: document.querySelector("#confirm-reset"),
  live: document.querySelector("#live-region"),
};

let language = loadLanguage();
let session = loadSession();
let atHome = false;

function loadLanguage() {
  const stored = localStorage.getItem(LANGUAGE_KEY);
  if (["en", "fr", "cs"].includes(stored)) return stored;
  const browserLanguage = navigator.language.toLowerCase();
  if (browserLanguage.startsWith("fr")) return "fr";
  if (browserLanguage.startsWith("cs")) return "cs";
  return "en";
}

function loadSession() {
  try {
    const stored = JSON.parse(localStorage.getItem(SESSION_KEY));
    return isValidSession(stored, DESIGN_IDS) ? stored : null;
  } catch {
    return null;
  }
}

function saveSession() {
  if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function t(key, values = {}) {
  return Object.entries(values).reduce(
    (result, [name, value]) => result.replaceAll(`{${name}}`, String(value)),
    TEXT[language][key] ?? key,
  );
}

function applyLanguage() {
  document.documentElement.lang = language;
  document.title = t("pageTitle");
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    node.textContent = t(node.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-aria]").forEach((node) => {
    node.setAttribute("aria-label", t(node.dataset.i18nAria));
  });
  document.querySelectorAll("[data-language]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.language === language));
  });
}

function show(view) {
  elements.intro.hidden = view !== "intro";
  elements.vote.hidden = view !== "vote";
  elements.results.hidden = view !== "results";
}

function render() {
  applyLanguage();
  if (!session || atHome) {
    renderIntro();
  } else if (session.index >= session.pairs.length) {
    renderResults();
  } else {
    renderVote();
  }
}

function renderIntro() {
  show("intro");
  const label = elements.start.querySelector("[data-i18n]");
  if (!session) {
    label.dataset.i18n = "start";
    label.textContent = t("start");
  } else if (session.index >= session.pairs.length) {
    label.dataset.i18n = "viewResults";
    label.textContent = t("viewResults");
  } else {
    label.dataset.i18n = "resume";
    label.textContent = t("resume", { current: session.index + 1, total: session.pairs.length });
  }
}

function renderVote() {
  show("vote");
  const current = session.index + 1;
  const total = session.pairs.length;
  elements.progressLabel.textContent = t("progress", { current, total });
  elements.progressBar.style.width = `${(session.index / total) * 100}%`;
  elements.denominations.replaceChildren(...DENOMINATIONS.map((value) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = `€${value}`;
    button.dataset.denomination = value;
    button.setAttribute("aria-pressed", String(session.denomination === value));
    return button;
  }));
  const sideName = session.side === "front" ? t("front") : t("backSide");
  elements.sideToggle.textContent = `↻ ${t("showSide", { side: sideName })}`;
  elements.back.disabled = session.index === 0;
  renderMatchup();
}

function renderMatchup() {
  const pair = session.pairs[session.index];
  elements.matchup.replaceChildren(...pair.map((id) => designCard(byId[id])));
}

function designCard(design) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "design-card";
  button.dataset.design = design.id;
  button.setAttribute("aria-label", `${t("design", { id: design.id })}, ${design.designer}, ${t(design.theme)}`);

  const stage = document.createElement("span");
  stage.className = "image-stage";
  const image = document.createElement("img");
  image.src = imagePath(design.id, session.denomination, session.side);
  image.alt = t("imageAlt", {
    id: design.id,
    denomination: session.denomination,
    side: session.side === "front" ? t("front").toLowerCase() : t("backSide").toLowerCase(),
  });
  image.width = 1200;
  image.height = 630;
  stage.append(image);

  const copy = document.createElement("span");
  copy.className = "card-copy";
  copy.innerHTML = `<span class="design-letter">${design.id}</span><span class="design-meta"><strong>${design.designer}</strong><span>${t(design.theme)}</span></span><span class="choose-mark" aria-hidden="true">→</span>`;

  const label = document.createElement("span");
  label.className = "proposal-label";
  label.textContent = t("proposalLabel");
  button.append(stage, copy, label);
  return button;
}

function renderResults() {
  show("results");
  const winningEntries = winners(DESIGN_IDS, session.votes);
  const tied = winningEntries.length > 1;
  const title = tied
    ? t("tieTitle", { count: winningEntries.length })
    : t("resultTitle", { id: winningEntries[0].id });
  const summary = tied
    ? t("tieSummary", { wins: winningEntries[0].wins })
    : t("resultSummary", { wins: winningEntries[0].wins });
  elements.resultsHero.innerHTML = `<p class="eyebrow">${t(tied ? "tieEyebrow" : "resultEyebrow")}</p><h1>${title}</h1><p>${summary}</p><div class="winner-gallery"></div>`;
  const gallery = elements.resultsHero.querySelector(".winner-gallery");
  winningEntries.forEach(({ id, wins }) => {
    const design = byId[id];
    const card = document.createElement("div");
    card.className = "winner-card";
    card.innerHTML = `<img src="${imagePath(id, 20, "front")}" alt="${t("imageAlt", { id, denomination: 20, side: t("front").toLowerCase() })}" width="1200" height="630"><strong>${t("design", { id })} · ${design.designer}</strong><span>${t("wins", { wins })} · ${t("proposalLabel")}</span>`;
    gallery.append(card);
  });

  elements.standings.replaceChildren(...rank(DESIGN_IDS, session.votes).map(({ id, wins }) => {
    const design = byId[id];
    const item = document.createElement("li");
    item.className = "standing";
    item.innerHTML = `<span class="standing-name"><strong>${t("design", { id })}</strong><span>${design.designer}</span></span><span class="score-bar" aria-hidden="true"><span style="width: ${(wins / 9) * 100}%"></span></span><span class="standing-score">${wins} / 9</span>`;
    item.setAttribute("aria-label", `${t("design", { id })}, ${t("wins", { wins })}`);
    return item;
  }));
}

function startNewSession() {
  session = createSession(DESIGN_IDS);
  atHome = false;
  saveSession();
  renderVote();
  document.querySelector("#vote-view h1").focus?.();
}

elements.start.addEventListener("click", () => {
  if (!session) {
    startNewSession();
    return;
  }
  atHome = false;
  render();
});

elements.home.addEventListener("click", (event) => {
  event.preventDefault();
  atHome = true;
  renderIntro();
  document.querySelector("#main").focus();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

elements.denominations.addEventListener("click", (event) => {
  const button = event.target.closest("[data-denomination]");
  if (!button) return;
  session = { ...session, denomination: Number(button.dataset.denomination) };
  saveSession();
  renderVote();
});

elements.sideToggle.addEventListener("click", () => {
  session = { ...session, side: session.side === "front" ? "back" : "front" };
  saveSession();
  renderVote();
});

elements.matchup.addEventListener("click", (event) => {
  const card = event.target.closest("[data-design]");
  if (!card) return;
  const winner = card.dataset.design;
  session = voteFor(session, winner);
  saveSession();
  render();
  elements.live.textContent = t("choseAnnouncement", {
    id: winner,
    current: Math.min(session.index + 1, session.pairs.length),
    total: session.pairs.length,
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
});

elements.back.addEventListener("click", () => {
  session = previous(session);
  saveSession();
  renderVote();
});

elements.review.addEventListener("click", () => {
  session = previous(session);
  saveSession();
  renderVote();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

elements.reset.addEventListener("click", () => elements.dialog.showModal());
elements.confirmReset.addEventListener("click", () => {
  localStorage.removeItem(SESSION_KEY);
  startNewSession();
});

document.querySelectorAll("[data-language]").forEach((button) => {
  button.addEventListener("click", () => {
    language = button.dataset.language;
    localStorage.setItem(LANGUAGE_KEY, language);
    render();
  });
});

render();
