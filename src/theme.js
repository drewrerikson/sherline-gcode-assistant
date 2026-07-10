export const themes = ["light", "dark", "party"];

export function applyTheme(theme, root = document.body, storage = localStorage) {
  const selectedTheme = themes.includes(theme) ? theme : "light";
  root.classList.remove(...themes.map((name) => `theme-${name}`));
  if (selectedTheme !== "light") {
    root.classList.add(`theme-${selectedTheme}`);
  }
  document.querySelectorAll(".theme-button").forEach((button) => {
    button.classList.toggle("active", button.dataset.theme === selectedTheme);
  });
  storage.setItem("sherline-theme", selectedTheme);
  return selectedTheme;
}

export function loadTheme(storage = localStorage) {
  return storage.getItem("sherline-theme") || "light";
}
