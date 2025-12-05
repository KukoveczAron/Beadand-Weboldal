// Basic 16‑step patterns for each icon per track
const BASE_PATTERNS = {
  kick: {
    pattern1: "x------xx-x---x-",
    pattern2: "x---x---x---x---",
    pattern3: "xx----xx--------"
  },
  snare: {
    pattern1: "----x-------x---",
    pattern2: "--x----x--x----x",
    pattern3: "----x-------x---"
  },
  closedhat: {
    pattern1: "x-x-x-x-x-x-x-x-",
    pattern2: "--x--x-x--x--x-x",
    pattern3: "xxxxxxxxxxxxxxxx"
  },
  openhat: {
    pattern1: "-x--------------",
    pattern2: "----x-------x---",
    pattern3: "-------x--x-----"
  }
};

// One Audio object per hit type
const audioMap = {
  kick: new Audio("audio/kick.mp3"),
  snare: new Audio("audio/snare.mp3"),
  closedhat: new Audio("audio/closedhat.mp3"),
  openhat: new Audio("audio/openhat.mp3")
};

let bpm = 100;
let currentStep = 0;
let loopTimer = null;

// Active combined pattern per track: 16‑char strings
const activePatterns = {
  kick: ".".repeat(16),
  snare: ".".repeat(16),
  closedhat: ".".repeat(16),
  openhat: ".".repeat(16)
};

document.addEventListener("DOMContentLoaded", () => {
  const bpmSlider = document.getElementById("bpm");
  const bpmValue = document.getElementById("bpm-value");
  const playBtn = document.getElementById("play-btn");
  const stopBtn = document.getElementById("stop-btn");
  const clearBtn = document.getElementById("clear-btn");

  bpmSlider.addEventListener("input", () => {
    bpm = Number(bpmSlider.value);
    bpmValue.textContent = bpm;
    if (loopTimer) {
      startLoop(); // restart with new tempo
    }
  });

  playBtn.addEventListener("click", startLoop);
  stopBtn.addEventListener("click", stopLoop);
  clearBtn.addEventListener("click", clearAll);

  setupCharacters();
  buildStepVisuals();
});

function setupCharacters() {
  const characters = document.querySelectorAll(".character");

  characters.forEach(char => {
    const track = char.dataset.track;
    const icons = char.querySelectorAll(".sound-icon");

    icons.forEach(icon => {
      icon.addEventListener("click", () => {
        const patternName = icon.dataset.sound;

        icon.classList.toggle("active");
        recomputeTrackPattern(track);
      });
    });
  });
}

function recomputeTrackPattern(track) {
  const chars = document.querySelectorAll(`.character[data-track="${track}"] .sound-icon`);
  let combined = Array(16).fill(".");

  chars.forEach(icon => {
    if (!icon.classList.contains("active")) return;
    const patternName = icon.dataset.sound;
    const pat = BASE_PATTERNS[track][patternName];

    Array.from(pat).forEach((ch, i) => {
      if (ch === "x") combined[i] = "x";
    });
  });

  activePatterns[track] = combined.join("");
}

function startLoop() {
  stopLoop();

  const intervalMs = (60_000 / bpm) / 4; // 16th notes
  currentStep = 0;

  loopTimer = setInterval(() => {
    playStep(currentStep);
    highlightStep(currentStep);
    currentStep = (currentStep + 1) % 16;
  }, intervalMs);
}

function stopLoop() {
  if (loopTimer) {
    clearInterval(loopTimer);
    loopTimer = null;
  }
}

function clearAll() {
  document.querySelectorAll(".sound-icon.active").forEach(btn => {
    btn.classList.remove("active");
  });

  Object.keys(activePatterns).forEach(track => {
    activePatterns[track] = ".".repeat(16);
  });
}

function playStep(stepIndex) {
  Object.entries(activePatterns).forEach(([track, pattern]) => {
    if (pattern[stepIndex] === "x") {
      const audio = audioMap[track];
      if (!audio) return;
      audio.currentTime = 0;
      audio.play();
    }
  });
}

function buildStepVisuals() {
  const stepsContainer = document.getElementById("steps");
  stepsContainer.innerHTML = "";
  for (let i = 0; i < 16; i++) {
    const div = document.createElement("div");
    div.className = "step";
    div.dataset.index = i;
    stepsContainer.appendChild(div);
  }
}

function highlightStep(index) {
  const steps = document.querySelectorAll(".step");
  steps.forEach(step => step.classList.remove("active"));
  const current = document.querySelector(`.step[data-index="${index}"]`);
  if (current) current.classList.add("active");
}
