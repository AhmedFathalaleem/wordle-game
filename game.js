const MAX_GUESSES = 6;
const WORD_LENGTH = 5;
const STORAGE_KEY = "wordle-stats";
const FLIP_DELAY_MS = 300;
const FLIP_DURATION_MS = 500;

const KEYBOARD_ROWS = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  ["Enter", "z", "x", "c", "v", "b", "n", "m", "Backspace"],
];

const STATE_RANK = { absent: 0, present: 1, correct: 2 };

const boardEl = document.getElementById("board");
const keyboardEl = document.getElementById("keyboard");
const toastEl = document.getElementById("toast");
const modalOverlay = document.getElementById("modal-overlay");
const modalContent = document.getElementById("modal-content");
const statsBtn = document.getElementById("stats-btn");
const hintBtn = document.getElementById("hint-btn");
const helpBtn = document.getElementById("help-btn");
const modalClose = document.getElementById("modal-close");

const validGuessSet = new Set(VALID_GUESSES);

let answer = "";
let currentRow = 0;
let currentCol = 0;
let gameOver = false;
let isAnimating = false;
let stats = loadStats();
let tiles = [];
let keyElements = {};
const wordDefinitionCache = new Map();
const wordDefinitionPending = new Map();

function loadStats() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (_) {
    /* ignore corrupt data */
  }
  return {
    gamesPlayed: 0,
    gamesWon: 0,
    currentStreak: 0,
    maxStreak: 0,
    guessDistribution: [0, 0, 0, 0, 0, 0],
  };
}

function saveStats() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
}

function pickAnswer() {
  return ANSWERS[Math.floor(Math.random() * ANSWERS.length)];
}

function createBoard() {
  boardEl.innerHTML = "";
  tiles = [];

  for (let r = 0; r < MAX_GUESSES; r++) {
    for (let c = 0; c < WORD_LENGTH; c++) {
      const tile = document.createElement("div");
      tile.className = "tile";
      tile.dataset.state = "empty";
      tile.dataset.row = String(r);
      tile.dataset.col = String(c);
      tile.innerHTML = `
        <div class="tile-inner">
          <div class="tile-face tile-front"></div>
          <div class="tile-face tile-back"></div>
        </div>
      `;
      boardEl.appendChild(tile);
      tiles.push(tile);
    }
  }
}

function createKeyboard() {
  keyboardEl.innerHTML = "";
  keyElements = {};

  KEYBOARD_ROWS.forEach((row) => {
    const rowEl = document.createElement("div");
    rowEl.className = "keyboard-row";

    row.forEach((key) => {
      const btn = document.createElement("button");
      btn.className = "key";
      btn.dataset.key = key;
      btn.textContent = key === "Backspace" ? "⌫" : key;
      if (key === "Enter" || key === "Backspace") {
        btn.classList.add("wide");
      }
      btn.addEventListener("click", () => pressKey(key));
      rowEl.appendChild(btn);
      if (key.length === 1) {
        keyElements[key] = btn;
      }
    });

    keyboardEl.appendChild(rowEl);
  });
}

function getTile(row, col) {
  return tiles[row * WORD_LENGTH + col];
}

function getCurrentGuess() {
  let guess = "";
  for (let c = 0; c < WORD_LENGTH; c++) {
    const front = getTile(currentRow, c).querySelector(".tile-front");
    guess += front.textContent;
  }
  return guess;
}

function evaluateGuess(guess, target) {
  const result = Array(WORD_LENGTH).fill("absent");
  const answerChars = target.split("");
  const guessChars = guess.split("");

  for (let i = 0; i < WORD_LENGTH; i++) {
    if (guessChars[i] === answerChars[i]) {
      result[i] = "correct";
      answerChars[i] = null;
    }
  }

  for (let i = 0; i < WORD_LENGTH; i++) {
    if (result[i] === "correct") continue;
    const idx = answerChars.indexOf(guessChars[i]);
    if (idx !== -1) {
      result[i] = "present";
      answerChars[idx] = null;
    }
  }

  return result;
}

function updateKeyboardState(letter, state) {
  const key = keyElements[letter];
  if (!key) return;

  const current = key.dataset.state;
  const currentRank = current ? STATE_RANK[current] : -1;
  if (STATE_RANK[state] > currentRank) {
    key.dataset.state = state;
  }
}

function showToast(message, duration = 1500) {
  toastEl.textContent = message;
  toastEl.classList.remove("hidden");
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => {
    toastEl.classList.add("hidden");
  }, duration);
}

function shakeBoard() {
  boardEl.classList.remove("shake");
  void boardEl.offsetWidth;
  boardEl.classList.add("shake");
}

function addLetter(letter) {
  if (gameOver || isAnimating || currentCol >= WORD_LENGTH) return;

  const tile = getTile(currentRow, currentCol);
  tile.querySelector(".tile-front").textContent = letter;
  tile.dataset.state = "tbd";
  currentCol++;
}

function removeLetter() {
  if (gameOver || isAnimating || currentCol === 0) return;

  currentCol--;
  const tile = getTile(currentRow, currentCol);
  tile.querySelector(".tile-front").textContent = "";
  tile.dataset.state = "empty";
}

function animateRowReveal(row, evaluation) {
  return new Promise((resolve) => {
    isAnimating = true;

    evaluation.forEach((state, col) => {
      const tile = getTile(row, col);
      const letter = tile.querySelector(".tile-front").textContent;
      updateKeyboardState(letter, state);

      setTimeout(() => {
        tile.querySelector(".tile-back").textContent = letter;
        tile.dataset.state = state;
        tile.classList.add("flip");
      }, col * FLIP_DELAY_MS);
    });

    const totalTime =
      (WORD_LENGTH - 1) * FLIP_DELAY_MS + FLIP_DURATION_MS + 100;
    setTimeout(() => {
      isAnimating = false;
      resolve();
    }, totalTime);
  });
}

function recordGameEnd(won, guessesUsed) {
  stats.gamesPlayed++;
  if (won) {
    stats.gamesWon++;
    stats.currentStreak++;
    stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);
    stats.guessDistribution[guessesUsed - 1]++;
  } else {
    stats.currentStreak = 0;
  }
  saveStats();
}

function getPreferredDefinitionRank(partOfSpeech) {
  const order = [
    "noun",
    "adjective",
    "verb",
    "adverb",
    "pronoun",
    "preposition",
    "conjunction",
    "interjection",
  ];

  const normalized = partOfSpeech ? partOfSpeech.toLowerCase() : "";
  const index = order.indexOf(normalized);
  return index === -1 ? order.length : index;
}

function shortenDefinition(text) {
  const sanitized = String(text)
    .replace(/\s*\([^)]*\)/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!sanitized) return "";

  if (sanitized.length <= 140) return sanitized;

  const truncated = sanitized.slice(0, 137).trim();
  const lastSpace = truncated.lastIndexOf(" ");

  return lastSpace > 90
    ? `${truncated.slice(0, lastSpace)}…`
    : `${truncated}…`;
}

function selectBestDefinition(payload) {
  if (!Array.isArray(payload) || payload.length === 0) {
    return null;
  }

  const allMeanings = payload
    .flatMap((entry) => Array.isArray(entry?.meanings) ? entry.meanings : [])
    .sort(
      (a, b) =>
        getPreferredDefinitionRank(a?.partOfSpeech) -
        getPreferredDefinitionRank(b?.partOfSpeech),
    );

  for (const meaning of allMeanings) {
    const defs = Array.isArray(meaning?.definitions) ? meaning.definitions : [];

    for (const item of defs) {
      const text = typeof item?.definition === "string" ? item.definition : "";
      const shortened = shortenDefinition(text);
      if (shortened) {
        return shortened;
      }
    }
  }

  return null;
}

async function fetchWithTimeout(url, timeoutMs = 4000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function parseDatamuseDefinition(payload) {
  if (!Array.isArray(payload) || payload.length === 0) {
    return null;
  }

  const entry = payload[0];
  const defs = Array.isArray(entry?.defs) ? entry.defs : [];

  for (const item of defs) {
    if (typeof item !== "string") continue;

    const trimmed = item.replace(/^[a-z]+\s+/i, "").trim();
    const shortened = shortenDefinition(trimmed);
    if (shortened) {
      return shortened;
    }
  }

  return null;
}

async function fetchDictionaryDefinition(word) {
  const safeWord = String(word).trim();
  if (!safeWord) return null;

  const candidates = [
    `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(safeWord)}`,
    `https://api.datamuse.com/words?sp=${encodeURIComponent(safeWord)}&md=d&max=1`,
  ];

  for (const endpoint of candidates) {
    try {
      const response = await fetchWithTimeout(endpoint);
      if (!response.ok) continue;

      const payload = await response.json();

      const dictionaryDefinition = selectBestDefinition(payload);
      if (dictionaryDefinition) {
        return dictionaryDefinition;
      }

      const datamuseDefinition = parseDatamuseDefinition(payload);
      if (datamuseDefinition) {
        return datamuseDefinition;
      }
    } catch (_) {
      continue;
    }
  }

  return null;
}

async function getWordDefinition(word) {
  const normalized = String(word).trim().toLowerCase();
  if (!normalized) {
    return null;
  }

  if (wordDefinitionCache.has(normalized)) {
    return wordDefinitionCache.get(normalized);
  }

  if (wordDefinitionPending.has(normalized)) {
    return wordDefinitionPending.get(normalized);
  }

  const pendingRequest = fetchDictionaryDefinition(normalized)
    .then((definition) => {
      wordDefinitionCache.set(normalized, definition);
      wordDefinitionPending.delete(normalized);
      return definition;
    })
    .catch(() => {
      wordDefinitionCache.set(normalized, null);
      wordDefinitionPending.delete(normalized);
      return null;
    });

  wordDefinitionPending.set(normalized, pendingRequest);
  return pendingRequest;
}

function renderWordDefinition(word) {
  if (!word) {
    return "";
  }

  return `
    <p class="word-definition word-definition--loading" aria-live="polite">
      Loading definition…
    </p>
  `;
}

async function hydrateWordDefinition(word) {
  if (!word) return;

  const definition = await getWordDefinition(word);
  const definitionEl = modalContent.querySelector(".word-definition");

  if (!definitionEl) return;

  if (definition) {
    definitionEl.textContent = definition;
    definitionEl.classList.remove("word-definition--loading");
    return;
  }

  definitionEl.textContent = "Definition unavailable.";
  definitionEl.classList.remove("word-definition--loading");
  definitionEl.classList.add("word-definition--muted");
}

function renderStatsModal(extraMessage, word = null) {
  const winPct =
    stats.gamesPlayed === 0
      ? 0
      : Math.round((stats.gamesWon / stats.gamesPlayed) * 100);
  const maxDist = Math.max(1, ...stats.guessDistribution);

  const distRows = stats.guessDistribution
    .map(
      (count, i) => `
      <div class="dist-row">
        <span class="dist-label">${i + 1}</span>
        <div class="dist-bar-wrap">
          <div class="dist-bar" style="width: ${Math.max(
            (count / maxDist) * 100,
            count > 0 ? 8 : 0
          )}%">${count || ""}</div>
        </div>
      </div>`
    )
    .join("");

  modalContent.innerHTML = `
    ${extraMessage ? `<p class="modal-message">${extraMessage}</p>` : ""}
    ${word ? renderWordDefinition(word) : ""}
    <h2>Statistics</h2>
    <div class="modal-stats">
      <div class="stat-box">
        <div class="stat-value">${stats.gamesPlayed}</div>
        <div class="stat-label">Played</div>
      </div>
      <div class="stat-box">
        <div class="stat-value">${winPct}</div>
        <div class="stat-label">Win %</div>
      </div>
      <div class="stat-box">
        <div class="stat-value">${stats.currentStreak}</div>
        <div class="stat-label">Current Streak</div>
      </div>
      <div class="stat-box">
        <div class="stat-value">${stats.maxStreak}</div>
        <div class="stat-label">Max Streak</div>
      </div>
    </div>
    <div class="guess-distribution">
      <h3>Guess Distribution</h3>
      ${distRows}
    </div>
    <div class="modal-actions">
      <button class="btn" id="new-game-btn">Play Again</button>
    </div>
  `;

  if (word) {
    void hydrateWordDefinition(word);
  }

  document.getElementById("new-game-btn").addEventListener("click", () => {
    closeModal();
    newGame();
  });

  openModal();
}

function openModal() {
  modalOverlay.classList.remove("hidden");
}

function closeModal() {
  modalOverlay.classList.add("hidden");
}

async function submitGuess() {
  if (gameOver || isAnimating) return;

  if (currentCol < WORD_LENGTH) {
    showToast("Not enough letters");
    shakeBoard();
    return;
  }

  const guess = getCurrentGuess().toLowerCase();
  if (!validGuessSet.has(guess)) {
    showToast("Not in word list");
    shakeBoard();
    return;
  }

  const evaluation = evaluateGuess(guess, answer);
  await animateRowReveal(currentRow, evaluation);

  if (guess === answer) {
    gameOver = true;
    hintBtn.disabled = true;
    recordGameEnd(true, currentRow + 1);
    renderStatsModal(`🎉 You got it in ${currentRow + 1}!`);
    return;
  }

  currentRow++;
  currentCol = 0;

  if (currentRow >= MAX_GUESSES) {
    gameOver = true;
    hintBtn.disabled = true;
    recordGameEnd(false, MAX_GUESSES);
    renderStatsModal(`The word was <strong>${answer.toUpperCase()}</strong>`, answer);
  }
}

function pressKey(key) {
  if (gameOver || isAnimating) return;

  if (key === "Enter") {
    submitGuess();
  } else if (key === "Backspace") {
    removeLetter();
  } else if (/^[a-z]$/i.test(key)) {
    addLetter(key.toLowerCase());
  }
}

function resetBoardDisplay() {
  tiles.forEach((tile) => {
    tile.classList.remove("flip");
    tile.dataset.state = "empty";
    tile.querySelector(".tile-front").textContent = "";
    tile.querySelector(".tile-back").textContent = "";
    tile.querySelector(".tile-inner").style.transform = "";
  });
}

function resetKeyboardDisplay() {
  Object.values(keyElements).forEach((key) => {
    delete key.dataset.state;
  });
}

function newGame() {
  answer = pickAnswer();
  currentRow = 0;
  currentCol = 0;
  gameOver = false;
  isAnimating = false;
  hintBtn.disabled = false;
  resetBoardDisplay();
  resetKeyboardDisplay();
}

function revealHint(type) {
  if (gameOver) return;

  const vowels = new Set(["a", "e", "i", "o", "u"]);
  const eligibleLetters = [...new Set(answer)].filter((letter) =>
    type === "vowel" ? vowels.has(letter) : !vowels.has(letter),
  );

  if (eligibleLetters.length === 0) {
    modalContent.innerHTML = `
      <h2>No ${type} hint available</h2>
      <p class="modal-message">The target word contains no eligible ${type}.</p>
      <div class="modal-actions">
        <button class="btn" id="hint-close-btn">Close</button>
      </div>
    `;
  } else {
    const letter =
      eligibleLetters[Math.floor(Math.random() * eligibleLetters.length)];
    modalContent.innerHTML = `
      <h2>Hint</h2>
      <p class="modal-message">A ${type} in the word is:</p>
      <div class="hint-letter" aria-label="Revealed letter">${letter.toUpperCase()}</div>
      <div class="modal-actions">
        <button class="btn" id="hint-close-btn">Close</button>
      </div>
    `;
  }

  document.getElementById("hint-close-btn").addEventListener("click", closeModal);
}

function showHintModal() {
  if (gameOver) return;

  modalContent.innerHTML = `
    <h2>Need a hint?</h2>
    <p class="modal-message">Choose which kind of letter to reveal.</p>
    <div class="modal-actions hint-actions">
      <button class="btn" id="vowel-hint-btn">Vowel</button>
      <button class="btn" id="consonant-hint-btn">Consonant</button>
    </div>
  `;

  document
    .getElementById("vowel-hint-btn")
    .addEventListener("click", () => revealHint("vowel"));
  document
    .getElementById("consonant-hint-btn")
    .addEventListener("click", () => revealHint("consonant"));
  openModal();
}

function showHelpModal() {
  modalContent.innerHTML = `
    <h2>How to Play</h2>
    <p class="modal-message">
      Guess the hidden word in 6 tries.<br><br>
      Each guess must be a valid 5-letter word. Press Enter to submit.<br><br>
      After each guess, tile colors show how close you are:
    </p>
    <p><span style="display:inline-block;width:24px;height:24px;background:#6aaa64;vertical-align:middle;"></span> <strong>Green</strong> — correct letter, correct spot</p>
    <p><span style="display:inline-block;width:24px;height:24px;background:#c9b458;vertical-align:middle;"></span> <strong>Yellow</strong> — letter is in the word, wrong spot</p>
    <p><span style="display:inline-block;width:24px;height:24px;background:#787c7e;vertical-align:middle;"></span> <strong>Gray</strong> — letter not in the word</p>
    <div class="modal-actions">
      <button class="btn" id="help-close-btn">Got it</button>
    </div>
  `;
  document.getElementById("help-close-btn").addEventListener("click", closeModal);
  openModal();
}

document.addEventListener("keydown", (e) => {
  if (modalOverlay.classList.contains("hidden") === false && e.key !== "Escape") {
    return;
  }

  if (e.key === "Escape") {
    closeModal();
    return;
  }

  if (e.ctrlKey || e.metaKey || e.altKey) return;

  if (e.key === "Enter") {
    e.preventDefault();
    pressKey("Enter");
  } else if (e.key === "Backspace") {
    e.preventDefault();
    pressKey("Backspace");
  } else if (/^[a-zA-Z]$/.test(e.key)) {
    pressKey(e.key.toLowerCase());
  }
});

statsBtn.addEventListener("click", () => renderStatsModal());
hintBtn.addEventListener("click", showHintModal);
helpBtn.addEventListener("click", showHelpModal);
modalClose.addEventListener("click", closeModal);
modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) closeModal();
});

createBoard();
createKeyboard();
newGame();
