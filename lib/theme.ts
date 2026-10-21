export type ThemePref = "system" | "dark" | "light";
export const THEME_STORAGE_KEY = "plotedu-theme";
export const THEME_PREFS: readonly ThemePref[] = ["system", "dark", "light"];

/** Dark is the brand default; System follows the OS for the whole app. */
export const DEFAULT_THEME: ThemePref = "dark";

/** Inline, pre-paint: apply the stored preference to <html>. */
export const THEME_BOOT_SCRIPT = `try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t!=="system"&&t!=="light")t="dark";document.documentElement.dataset.themePref=t}catch(e){}`;

/** Apply and persist a theme preference (client only). */
export function applyThemePref(next: ThemePref): void {
  document.documentElement.dataset.themePref = next;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, next);
  } catch {
    // Storage unavailable (private mode): preference lasts for this page only.
  }
}
