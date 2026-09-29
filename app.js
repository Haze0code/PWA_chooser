(function () {
  "use strict";

  var STORAGE_KEY = "chooser.hiddenSettings";
  var LONG_PRESS_MS = 700;
  var MIN_OPTIONS = 2;
  var MAX_OPTIONS = 8;
  var DOT_COLORS = [
    "#6ea8fe", "#ff8fa3", "#7ee787", "#f2cc60",
    "#c792ea", "#7ad9d9", "#ffa657", "#ff7b72"
  ];

  var optionsList = document.getElementById("optionsList");
  var addOptionBtn = document.getElementById("addOptionBtn");
  var chooseBtn = document.getElementById("chooseBtn");
  var resultBox = document.getElementById("result");
  var resultValue = document.getElementById("resultValue");
  var errorEl = document.getElementById("error");
  var title = document.getElementById("title");

  var overlay = document.getElementById("hiddenOverlay");
  var fixedToggle = document.getElementById("fixedToggle");
  var fixedChoiceRow = document.getElementById("fixedChoiceRow");
  var closePanel = document.getElementById("closePanel");

  var nextId = 1;
  var options = [
    { id: nextId++, value: "" },
    { id: nextId++, value: "" }
  ];

  function loadSettings() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { fixed: false, choiceId: null };
      var parsed = JSON.parse(raw);
      return {
        fixed: !!parsed.fixed,
        choiceId: typeof parsed.choiceId === "number" ? parsed.choiceId : null
      };
    } catch (e) {
      return { fixed: false, choiceId: null };
    }
  }

  function saveSettings(s) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    } catch (e) {
      /* stockage indisponible, on continue sans persistance */
    }
  }

  var settings = loadSettings();

  // --- Liste des options (2 a 8) ---

  function renderOptions() {
    optionsList.innerHTML = "";

    options.forEach(function (opt, idx) {
      var row = document.createElement("div");
      row.className = "input-group";
      row.style.setProperty("--dot-color", DOT_COLORS[idx % DOT_COLORS.length]);

      var dot = document.createElement("span");
      dot.className = "dot";

      var input = document.createElement("input");
      input.type = "text";
      input.maxLength = 40;
      input.autocomplete = "off";
      input.placeholder = "Option " + (idx + 1);
      input.value = opt.value;
      input.addEventListener("input", function () {
        opt.value = input.value;
      });

      row.appendChild(dot);
      row.appendChild(input);

      if (options.length > MIN_OPTIONS) {
        var removeBtn = document.createElement("button");
        removeBtn.type = "button";
        removeBtn.className = "remove-option";
        removeBtn.textContent = "×";
        removeBtn.setAttribute("aria-label", "Supprimer cette option");
        removeBtn.addEventListener("click", function () {
          removeOption(opt.id);
        });
        row.appendChild(removeBtn);
      }

      optionsList.appendChild(row);
    });

    addOptionBtn.disabled = options.length >= MAX_OPTIONS;
  }

  function addOption() {
    if (options.length >= MAX_OPTIONS) return;
    options.push({ id: nextId++, value: "" });
    renderOptions();
    var inputs = optionsList.querySelectorAll("input");
    inputs[inputs.length - 1].focus();
  }

  function removeOption(id) {
    if (options.length <= MIN_OPTIONS) return;
    options = options.filter(function (o) {
      return o.id !== id;
    });
    if (settings.choiceId === id) {
      settings.fixed = false;
      settings.choiceId = null;
      saveSettings(settings);
    }
    renderOptions();
  }

  addOptionBtn.addEventListener("click", addOption);

  renderOptions();

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

  function renderFixedChoiceOptions() {
    fixedChoiceRow.innerHTML = "";
    options.forEach(function (opt, idx) {
      var label = document.createElement("label");
      label.className = "radio-row";

      var radio = document.createElement("input");
      radio.type = "radio";
      radio.name = "fixedChoice";
      radio.value = String(opt.id);
      radio.checked = settings.choiceId === opt.id;

      var span = document.createElement("span");
      span.textContent = (opt.value.trim() || ("Option " + (idx + 1))) + " gagne";

      label.appendChild(radio);
      label.appendChild(span);
      fixedChoiceRow.appendChild(label);
    });
  }

  function openPanel() {
    fixedToggle.checked = settings.fixed;
    fixedChoiceRow.hidden = !settings.fixed;
    renderFixedChoiceOptions();
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

  fixedChoiceRow.addEventListener("change", function (e) {
    if (e.target && e.target.name === "fixedChoice") {
      settings.choiceId = Number(e.target.value);
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

  function filledOptions() {
    return options.filter(function (o) {
      return o.value.trim() !== "";
    });
  }

  function pickWinner(filled) {
    if (settings.fixed) {
      var fixedMatch = filled.filter(function (o) {
        return o.id === settings.choiceId;
      })[0];
      if (fixedMatch) return fixedMatch;
    }
    return filled[Math.floor(Math.random() * filled.length)];
  }

  function runChoice() {
    var filled = filledOptions();

    if (filled.length < MIN_OPTIONS) {
      errorEl.hidden = false;
      resultBox.hidden = true;
      return;
    }
    errorEl.hidden = true;

    var winner = pickWinner(filled);
    var names = filled.map(function (o) {
      return o.value.trim();
    });

    chooseBtn.disabled = true;
    resultBox.hidden = false;

    var i = 0;
    var ticks = 14;
    var delay = 80;

    if (spinTimer) clearInterval(spinTimer);

    spinTimer = setInterval(function () {
      resultValue.textContent = names[i % names.length];
      i++;
      if (i >= ticks) {
        clearInterval(spinTimer);
        spinTimer = null;
        resultValue.textContent = winner.value.trim();
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
