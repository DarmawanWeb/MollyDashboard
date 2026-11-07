/**
 * App shell preferences saved per browser: the collapsed sidebar and the
 * presentation mode of the visitor display. They live on <html> as
 * attributes, set before the first paint by UI_INIT_SCRIPT so a reload
 * (a kiosk in presentation mode, a collapsed sidebar) never flashes:
 *
 *   html[data-sidebar="collapsed"]   icon-only sidebar (lg and up)
 *   html[data-presentation="on"]     visitor display without the operator chrome
 *
 * `?present=1` / `?present=0` on the display URL switches presentation on or
 * off and saves it (for kiosk launchers).
 */

export const UI_STORAGE_KEY = "molly-ui";

export interface UiPrefs {
  sidebarCollapsed: boolean;
  presentation: boolean;
}

export const DEFAULT_UI_PREFS: UiPrefs = {
  sidebarCollapsed: false,
  presentation: false,
};

/** Presentation mode only applies to the visitor display. */
export const PRESENTATION_PATH = "/";

export function readUiPrefs(): UiPrefs {
  try {
    const raw = JSON.parse(
      localStorage.getItem(UI_STORAGE_KEY) ?? "{}",
    ) as Partial<UiPrefs>;
    return {
      sidebarCollapsed: raw.sidebarCollapsed === true,
      presentation: raw.presentation === true,
    };
  } catch {
    return DEFAULT_UI_PREFS;
  }
}

export function saveUiPrefs(prefs: UiPrefs): void {
  try {
    localStorage.setItem(UI_STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // private mode / storage disabled: the choice lasts for this page
  }
}

/** `?present=1` → true, `?present=0` → false, otherwise null. */
export function presentParam(search: string): boolean | null {
  const value = new URLSearchParams(search).get("present");
  if (value === "1" || value === "true") return true;
  if (value === "0" || value === "false") return false;
  return null;
}

/** Mirror the preferences on <html> (CSS variants follow). */
export function applyUiToDocument(
  sidebarCollapsed: boolean,
  presenting: boolean,
): void {
  const root = document.documentElement;
  if (sidebarCollapsed) root.setAttribute("data-sidebar", "collapsed");
  else root.removeAttribute("data-sidebar");
  if (presenting) root.setAttribute("data-presentation", "on");
  else root.removeAttribute("data-presentation");
}

/** Runs in <head> before the body paints. Keep it dependency-free. */
export const UI_INIT_SCRIPT = `(function(){var r=document.documentElement;try{var p=JSON.parse(localStorage.getItem("${UI_STORAGE_KEY}")||"{}");if(p.sidebarCollapsed===true)r.setAttribute("data-sidebar","collapsed");var q=new URLSearchParams(location.search).get("present");var on=q==="1"||q==="true"?true:q==="0"||q==="false"?false:p.presentation===true;if(on&&location.pathname==="${PRESENTATION_PATH}")r.setAttribute("data-presentation","on");}catch(e){}})();`;
