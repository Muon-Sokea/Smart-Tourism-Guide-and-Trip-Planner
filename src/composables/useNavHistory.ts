import { computed, ref } from 'vue'
import type { Router } from 'vue-router'

/**
 * Tracks the user's real navigation trail so in-page Back buttons step back
 * through every page they visited (Explore → Details → Booking → …),
 * exactly like browser history, instead of jumping to a hardcoded page.
 *
 * Root-cause design (why this replaced the old parallel stack):
 * - The browser's own history is the single source of truth. vue-router stamps
 *   every history entry with a monotonically increasing `position` in
 *   history.state; this module keeps a small mirror of the current tab's
 *   in-app entries, reconciled by that position on every navigation.
 *   A hand-popped parallel stack desyncs from real history (in-app Back used
 *   to `push`, creating entries), which sent Back buttons to wrong pages or
 *   skipped pages.
 * - `goBack()` calls `router.back()` — a true one-step browser back that
 *   creates no new history entries. Because the previous entry is verified to
 *   be the immediate in-app predecessor, Back can never exit the site or land
 *   on an unexpected page.
 * - When there is no in-app previous page (direct visit, fresh tab, start of
 *   the trail), goBack falls back with `router.replace`, so the fallback can
 *   never loop Back onto the page it replaced.
 * - The mirror persists in sessionStorage, so reloading a page keeps Back
 *   working against the tab's real history.
 */

interface TrailEntry {
  /** Full path including query, e.g. /services/hotel/3?day=2 */
  fullPath: string
  /** Browser history position vue-router stamped on this entry. */
  position: number
}

const TRAIL_STORAGE_KEY = 'travelgo-nav-trail'
const MAX_DEPTH = 50

function loadTrail(): TrailEntry[] {
  try {
    const raw = sessionStorage.getItem(TRAIL_STORAGE_KEY)
    const parsed = raw ? (JSON.parse(raw) as TrailEntry[]) : []
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (entry) => entry && typeof entry.fullPath === 'string' && typeof entry.position === 'number'
    )
  } catch {
    return []
  }
}

const trail = ref<TrailEntry[]>(loadTrail())

let routerRef: Router | null = null

function persistTrail() {
  try {
    sessionStorage.setItem(TRAIL_STORAGE_KEY, JSON.stringify(trail.value))
  } catch {
    // Storage unavailable — the in-memory trail still covers this session.
  }
}

/** Browser history position of the current entry (stamped by vue-router). */
function currentPosition(): number | null {
  if (typeof window === 'undefined') return null
  const state = window.history.state as { position?: unknown } | null
  return typeof state?.position === 'number' ? state.position : null
}

/**
 * Mirror the browser's history into the trail. Called by the router's
 * afterEach hook on every confirmed navigation — never by components.
 */
export function recordNavigation(fullPath: string) {
  const position = currentPosition()
  if (position === null) return

  const items = trail.value
  const top = items[items.length - 1]

  if (top && top.position === position) {
    // Same history entry: initial load, a guard redirect, or a re-render.
    // Update in place so no duplicate entries are ever created.
    top.fullPath = fullPath
  } else if (!top || position > top.position) {
    // Forward navigation (or the first page of this tab's session).
    items.push({ fullPath, position })
    if (items.length > MAX_DEPTH) items.shift()
  } else {
    // Position moved backward: the browser's Back (one or more steps).
    // Truncate the trail to the entry we landed on; reseed when the position
    // is unknown to this tab (e.g. a trail left over from an older session).
    let cutoff = -1
    for (let i = items.length - 1; i >= 0; i--) {
      if (items[i].position === position) {
        cutoff = i
        break
      }
      if (items[i].position < position) break
    }
    if (cutoff >= 0) {
      items.splice(cutoff + 1)
      items[cutoff].fullPath = fullPath
    } else {
      trail.value = [{ fullPath, position }]
    }
  }
  persistTrail()
}

/** Human label for a back button based on where the user came from. */
export function backLabelFor(path: string | null, fallbackLabel = 'Back to Explore'): string {
  if (!path) return fallbackLabel
  if (path === '/') return 'Back to Home'
  if (path.startsWith('/explore') || path.startsWith('/destinations')) return 'Back to Explore'
  if (path.startsWith('/services/')) return 'Back to Service'
  if (path.startsWith('/services')) return 'Back to Explore'
  if (path.startsWith('/book/')) return 'Back to Booking'
  if (path.startsWith('/bookings')) return 'Back to My Bookings'
  if (path.startsWith('/trips')) return 'Back to My Trips'
  if (path.startsWith('/favorites')) return 'Back to Favorites'
  if (path.startsWith('/trip-planner')) return 'Back to Trip Planner'
  if (path.startsWith('/map')) return 'Back to Map'
  if (path.startsWith('/profile')) return 'Back to Profile'
  if (path.startsWith('/settings')) return 'Back to Settings'
  return 'Go Back'
}

export function setNavHistoryRouter(router: Router) {
  routerRef = router
}

export function useNavHistory() {
  /** How many pages of this tab's session are tracked. */
  function historyDepth(): number {
    return trail.value.length
  }

  /**
   * The page the user was on before the current one, or null when there is no
   * in-app previous page (direct visit, fresh tab, or start of the trail).
   * Only returned when it is the true immediate predecessor in browser
   * history — otherwise a step back could skip pages.
   */
  const previousFullPath = computed(() => {
    const previous = trail.value[trail.value.length - 2]
    if (!previous) return null
    const position = currentPosition()
    if (position === null) return null
    return previous.position === position - 1 ? previous.fullPath : null
  })

  /**
   * Step back one page — the immediately previous page the user came from —
   * using the browser's real history. Falls back to `fallback` (replaced, not
   * pushed, so it can never loop) when this page has no in-app previous page.
   */
  function goBack(fallback = '/explore') {
    const router = routerRef
    if (!router) return
    if (previousFullPath.value !== null) {
      router.back()
      return
    }
    const current = router.currentRoute.value.fullPath
    if (fallback && fallback !== current) {
      router.replace(fallback)
    }
    // fallback === current: already at the beginning of the flow — do nothing
    // rather than stacking a duplicate entry or looping on the same page.
  }

  return { goBack, historyDepth, previousFullPath }
}
