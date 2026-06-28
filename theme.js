(function () {
  const themeLabels = {
    rose: "Rose Garden",
    night: "Moonlit Porch",
    picnic: "Picnic Day",
    clouds: "Cloud Letters"
  };

  const themeKey = "romantic-site-theme";
  // --- Coder-only surat background ---
  // Set this to a relative path (e.g. 'assets/surat-bg.jpg') to replace the
  // background image used on the surat (letter) page. Leave as null to keep
  // the default CSS background. Only edit this value in code — there is no UI.
  const SURAT_BG_PATH = 'assets/5cb9adbedde2ae590ce809994f52be1f.jpg'; // <-- Change path here to enable custom surat bg

  const themeName = document.querySelector("#themeName");
  const themeButtons = [...document.querySelectorAll("[data-theme-choice]")];
  const settingsPanel = document.querySelector("#settingsPanel");
  const settingsToggle = document.querySelector("#settingsToggle");
  const playlistToggle = document.querySelector('#playlistToggle');
  const playlistPanel = document.querySelector('.playlist-panel');

  function writeTheme(theme) {
    try {
      localStorage.setItem(themeKey, theme);
    } catch {
      return false;
    }
    return true;
  }

  function readTheme() {
    try {
      return localStorage.getItem(themeKey);
    } catch {
      return null;
    }
  }

  function setTheme(theme) {
    const nextTheme = themeLabels[theme] ? theme : "rose";
    document.documentElement.dataset.theme = nextTheme;

    if (themeName) {
      themeName.textContent = themeLabels[nextTheme];
    }

    themeButtons.forEach((button) => {
      const isActive = button.dataset.themeChoice === nextTheme;
      button.classList.toggle("active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });

    writeTheme(nextTheme);
  }

  themeButtons.forEach((button) => {
    button.addEventListener("click", () => setTheme(button.dataset.themeChoice));
  });

  if (settingsToggle && settingsPanel) {
    settingsToggle.addEventListener("click", () => {
      const isOpen = settingsPanel.classList.toggle("open");
      settingsToggle.setAttribute("aria-expanded", String(isOpen));
    });

    document.addEventListener("click", (event) => {
      if (!settingsPanel.contains(event.target)) {
        settingsPanel.classList.remove("open");
        settingsToggle.setAttribute("aria-expanded", "false");
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        settingsPanel.classList.remove("open");
        settingsToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  if (playlistToggle && playlistPanel) {
    playlistToggle.addEventListener('click', (e) => {
      const isHidden = playlistPanel.classList.toggle('hidden');
      playlistToggle.setAttribute('aria-expanded', String(!isHidden));
    });
    playlistToggle.dataset.playlistToggleBound = 'true';
  }

  // close panels on page load
  if (settingsPanel) {
    settingsPanel.classList.remove('open');
  }
  if (settingsToggle) {
    settingsToggle.setAttribute('aria-expanded', 'false');
  }
  if (playlistPanel) {
    playlistPanel.classList.add('hidden');
  }
  if (playlistToggle) {
    playlistToggle.setAttribute('aria-expanded', 'false');
  }

  setTheme(readTheme() || document.documentElement.dataset.theme || "rose");

  // Apply coder-configured surat background if provided
  try {
    if (SURAT_BG_PATH) {
      const letterStage = document.querySelector('.letter-page .background-stage');
      if (letterStage) {
        letterStage.style.background = `linear-gradient(180deg, rgba(8,10,20,0.62), rgba(8,10,20,0.4)), url('${SURAT_BG_PATH}') center/cover no-repeat`;
      }
    }
  } catch (e) {
    // silent
  }
})();
