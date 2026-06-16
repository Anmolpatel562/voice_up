export type Theme = "light" | "dark" | "system";

export const THEME_STORAGE_KEY = "voiceup-theme";

export const THEMES: { value: Theme; label: string }[] = [
  { value: "system", label: "System" },
  { value: "dark", label: "Dark" },
  { value: "light", label: "Light" },
];
