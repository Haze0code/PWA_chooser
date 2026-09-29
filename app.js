(function () {
  "use strict";

  var STORAGE_KEY = "chooser.hiddenSettings";
  var LONG_PRESS_MS = 700;

  var optionA = document.getElementById("optionA");
  var optionB = document.getElementById("optionB");
  var chooseBtn = document.getElementById("chooseBtn");
  var resultBox = document.getElementById("result");
  var resultValue = document.getElementById("resultValue");
  var errorEl = document.getElementById("error");
  var title = document.getElementById("title");

  var overlay = document.getElementById("hiddenOverlay");
  var fixedToggle = document.getElementById("fixedToggle");
  var fixedChoiceRow = document.getElementById("fixedChoiceRow");
  var fixedA = document.getElementById("fixedA");
  var fixedB = document.getElementById("fixedB");
  var closePanel = document.getElementById("closePanel");

  function loadSettings() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { fixed: false, choice: "A" };
      var parsed = JSON.parse(raw);
      return {
        fixed: !!parsed.fixed,
        choice: parsed.choice === "B" ? "B" : "A"
      };
    } catch (e) {
      return { fixed: false, choice: "A" };
    }
  }

  function saveSettings(settings) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      /* stockage indisponible, on continue sans persistance */
    }
  }

  var settings = loadSettings();

  function applySettingsToPanel() {
    fixedToggle.checked = settings.fixed;
    fixedChoiceRow.hidden = !settings.fixed;
    fixedA.checked = settings.choice === "A";
    fixedB.checked = settings.choice === "B";
  }

  // --- Appui long caché sur le titre pour ouvrir le réglage ---

  var pressTimer = null;

  function startPress() {
    clearPress();
    pressTimer = setTimeout(openPanel, LONG_PRESS_MS);
  }

  function clearPress() {
    if (pressTimer) {
      clearTimeout(pressTimer);
      pressTimer = null;
    }
  }

  function openPanel() {
    applySettingsToPanel();
    overlay.hidden = false;
  }

  title.addEventListener("pointerdown", startPress);
  title.addEventListener("pointerup", clearPress);
  title.addEventListener("pointerleave", clearPress);
  title.addEventListener("contextmenu", function (e) {
    e.preventDefault();
  });

  fixedToggle.addEventListener("change", function () {
    settings.fixed = fixedToggle.checked;
    fixedChoiceRow.hidden = !settings.fixed;
    saveSettings(settings);
  });

  fixedA.addEventListener("change", function () {
    if (fixedA.checked) {
      settings.choice = "A";
      saveSettings(settings);
    }
  });

  fixedB.addEventListener("change", function () {
    if (fixedB.checked) {
      settings.choice = "B";
      saveSettings(settings);
    }
  });

  closePanel.addEventListener("click", function () {
    overlay.hidden = true;
  });

  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) overlay.hidden = true;
  });

  // --- Tirage ---

  var spinTimer = null;

  function pickWinner() {
    if (settings.fixed) {
      return settings.choice;
    }
    return Math.random() < 0.5 ? "A" : "B";
  }

  function runChoice() {
    var a = optionA.value.trim();
    var b = optionB.value.trim();

    if (!a || !b) {
      errorEl.hidden = false;
      resultBox.hidden = true;
      return;
    }
    errorEl.hidden = true;

    var winnerKey = pickWinner();
    var winnerLabel = winnerKey === "A" ? a : b;

    chooseBtn.disabled = true;
    resultBox.hidden = false;

    var names = [a, b];
    var i = 0;
    var ticks = 14;
    var delay = 80;

    if (spinTimer) clearInterval(spinTimer);

    spinTimer = setInterval(function () {
      resultValue.textContent = names[i % 2];
      i++;
      if (i >= ticks) {
        clearInterval(spinTimer);
        spinTimer = null;
        resultValue.textContent = winnerLabel;
        chooseBtn.disabled = false;
      }
    }, delay);
  }

  chooseBtn.addEventListener("click", runChoice);

  // --- Service worker pour le mode PWA hors-ligne ---

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js").catch(function () {
        /* l'app reste utilisable sans service worker */
      });
    });
  }
})();
