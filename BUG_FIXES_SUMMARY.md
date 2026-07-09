# Bug Fixes Summary

## ✅ BUG 1: White Screen Crash on Profile Picture Save

**Problem:** Uploading and saving profile pictures caused app crashes due to storing full-resolution images as base64 without compression, causing localStorage quota errors.

**Files Modified:**
- `src/components/common/PhotoUpload.jsx`
- `src/pages/SquadEdit/SquadEdit.jsx`
- `src/pages/EditPlayer/EditPlayer.jsx`
- `src/components/ErrorBoundary.jsx` (new)
- `src/App.jsx`

**Fixes Applied:**
1. Added image compression in PhotoUpload component (max 300x300px, JPEG quality 0.7)
2. Compression happens before base64 conversion using canvas API
3. Added try-catch error handling in both squad and player save handlers
4. Created ErrorBoundary component that catches render errors and shows reload UI
5. Wrapped entire app with ErrorBoundary to prevent white screens

---

## ✅ BUG 2: Long-press Booking Selection Triggering on Scroll

**Problem:** Scrolling over booking cards incorrectly triggered long-press selection.

**Files Modified:**
- `src/components/booking/BookingCard.jsx`

**Fixes Applied:**
1. Record touch start position (X/Y coordinates) on touchstart
2. Added touchmove handler that calculates distance moved from start
3. If movement exceeds 10px in any direction, cancel the long-press timer
4. Only trigger "select booking" if timer completes without movement threshold being exceeded
5. Changed timer from 500ms to 450ms for better responsiveness

---

## ✅ BUG 3: Diagonal Trend Line Overlapping Chart Label

**Problem:** Revenue chart line visually crossed through the green badge in top-right corner.

**Files Modified:**
- `src/pages/Stats/Stats.jsx`

**Fixes Applied:**
1. Added `position: relative; z-index: 10` to the revenue badge
2. Added solid background color with backdrop filter to ensure badge stays on top
3. Badge now renders above chart line even when line passes behind it

---

## ✅ BUG 4: Bar Chart Y-Axis Numbers Not Visible

**Problem:** Peak Booking Hours chart Y-axis labels were invisible due to color contrast issues.

**Files Modified:**
- `src/pages/Stats/Stats.jsx`

**Fixes Applied:**
1. Changed YAxis tick fontSize from 10 to 11 for better visibility
2. Tick color already uses `var(--text-muted)` which adapts to light/dark mode
3. Increased YAxis width from 25 to 30 to prevent label clipping
4. Increased left margin from 0 to 5 for better spacing

---

## ✅ BUG 5: Bottom Navbar Keyboard Configuration (Initial Fix - Later Revised in Bug 9)

**Problem:** When keyboard opened, bottom navbar moved up and floated above keyboard instead of staying fixed or hiding.

**Files Modified:**
- `capacitor.config.json`
- `src/components/layout/BottomNavbar.jsx`
- `package.json` (installed @capacitor/keyboard)

**Initial Fixes Applied:**
1. Added Keyboard plugin config to capacitor.config.json with `"resize": "none"`
2. Installed @capacitor/keyboard package
3. Added keyboard visibility state tracking in BottomNavbar
4. Added keyboardWillShow and keyboardWillHide listeners
5. BottomNavbar hid when keyboard was visible

**Note:** This approach was later revised in Bug 9 to implement proper native Android behavior where the nav stays fixed and keyboard overlays it, rather than hiding the nav.

---

## Testing Instructions

### BUG 1 - Profile Picture Crash:
1. Go to Edit Player or Squad Edit
2. Upload a large profile picture (>1MB)
3. Save the changes
4. App should NOT crash and image should be compressed

### BUG 2 - Long-press vs Scroll:
1. Go to Bookings list
2. Try scrolling by sliding finger over bookings
3. Scroll should work without triggering selection
4. Hold finger still for 450ms - should trigger long-press selection

### BUG 3 - Chart Label Overlap:
1. Go to Stats page
2. Check Revenue Over Time chart
3. Green badge in top-right should be clearly visible above the line

### BUG 4 - Y-Axis Visibility:
1. Go to Stats page
2. Check Peak Booking Hours bar chart
3. Y-axis numbers (0, 1, 2, etc.) should be visible in both light and dark modes

### BUG 5 - Keyboard Navbar:
1. Go to any page with search/input field
2. Tap input to open keyboard
3. Bottom navbar should disappear when keyboard opens
4. Bottom navbar should reappear when keyboard closes

---

## Files Changed Summary

**New Files:**
- `src/components/ErrorBoundary.jsx`

**Modified Files:**
- `src/components/common/PhotoUpload.jsx`
- `src/pages/SquadEdit/SquadEdit.jsx`
- `src/pages/EditPlayer/EditPlayer.jsx`
- `src/App.jsx`
- `src/components/booking/BookingCard.jsx`
- `src/pages/Stats/Stats.jsx`
- `capacitor.config.json`
- `src/components/layout/BottomNavbar.jsx`
- `package.json` (@capacitor/keyboard added)

---

## Build/Deploy Notes

1. After these changes, run `npm install` to ensure @capacitor/keyboard is installed
2. Rebuild the Android app: `npm run build && npx cap sync android`
3. Test on physical device as keyboard behavior differs from emulator
4. Clear app storage if testing profile picture fixes to start fresh

---

## ✅ BUG 7: Edit Player Layout Should Match Edit Squad + Reduce Top Spacing

**Problem:** 
(a) EditPlayer had excessive vertical spacing between profile picture, name field, and other fields compared to SquadEdit.
(b) Excessive vertical space at the TOP of EditPlayer card - between card top and avatar/close button, making card feel top-heavy.
(c) Red close button (✕) was unnecessary and caused layout complexity.

**Files Modified:**
- `src/pages/EditPlayer/EditPlayer.jsx`

**Fixes Applied:**
1. **Removed close button entirely** - users can use "Revert" button or navigate back instead
2. Profile picture now perfectly centered horizontally (matches SquadEdit exactly)
3. Layout simplified to: `<div className="flex flex-col items-center py-2">` (identical to SquadEdit)
4. Changed outer container spacing from `space-y-5` to `space-y-4` (matches SquadEdit)
5. Changed PhotoUpload size from `"large"` to `"medium"` (matches SquadEdit)
6. Both forms now have identical compact spacing and structure
7. **Result**: Clean, centered layout with minimal top padding, avatar sits close to card edge

---

## ✅ BUG 8: Chart Point Labels Should Be Vertically Aligned

**Problem:** Revenue chart data point labels (e.g. "3.0K", "14.0K") were offset horizontally to the side of points instead of being centered vertically above/below.

**Files Modified:**
- `src/pages/Stats/Stats.jsx`

**Fixes Applied:**
1. Removed `isFirst` and `isLast` horizontal offset logic
2. Removed dynamic `anchor` calculation (start/end/middle)
3. Set all labels to use `textAnchor="middle"` for centered alignment
4. Removed all `dx` horizontal offset (was 12/-12 for first/last)
5. Kept only `dy` vertical offset: -10px above for peaks, +18px below for valleys
6. All labels now render directly above or below their data points on the same vertical axis

---

## ✅ BUG 9: Native Android Keyboard Behavior - Bottom Nav Fixed

**Problem:** 
(a) Bottom navigation bar would move/animate when keyboard opens instead of staying fixed.
(b) Need proper native Android behavior where keyboard overlays the nav, not pushes it.
(c) Inputs need to scroll into view without moving the nav bar.

**Files Modified:**
- `capacitor.config.json`
- `src/components/layout/BottomNavbar.jsx`
- `src/components/layout/MobileLayout.jsx`

**Fixes Applied:**

**1. Capacitor Keyboard Configuration:**
- Confirmed `"resize": "none"` in capacitor.config.json
- This prevents the webview from resizing when keyboard opens
- Gives full manual control over keyboard behavior

**2. Bottom Navbar - Always Visible & Fixed:**
- **REMOVED** keyboard show/hide listeners (was hiding nav when keyboard opened)
- **REMOVED** conditional render (`if (isKeyboardVisible) return null`)
- Nav now stays permanently fixed at `bottom: 0` with `position: fixed`
- Keyboard overlays the nav bar (native Android behavior)
- Nav never animates, translates, or repositions

**3. Content Area - Auto Scroll for Inputs:**
- Added `focusin` event listener to main content area
- When input/textarea/select gains focus, automatically scrolls it into view
- Uses `scrollIntoView({ behavior: 'smooth', block: 'center' })`
- 300ms delay to ensure keyboard is opening
- Content scrolls independently while nav stays fixed

**4. Layout Structure:**
- Fixed viewport positioning: `position: fixed; inset: 0`
- Flex column layout with independently scrolling main area
- Content has proper padding-bottom to account for nav bar
- Nav anchored to actual viewport bottom, not affected by content resize

**Result:**
✅ Bottom nav stays perfectly fixed at screen bottom
✅ Keyboard opens and overlays the nav bar
✅ Content scrolls to bring focused input into view
✅ No nav movement, animation, or repositioning
✅ True native Android keyboard behavior

---

## ✅ BUG 9 (LEGACY): Dismiss Keyboard on Outside Tap

**Note:** This fix remains in place but is now integrated with the native keyboard behavior above.

**Files Modified:**
- `src/components/layout/MobileLayout.jsx` (already updated in Bug 9 main fix)

**Fixes Applied:**
1. `handleContentClick` detects clicks outside input fields
2. Calls `.blur()` on active input when tapping outside
3. Works seamlessly with fixed nav bar behavior

---

## Testing Instructions (Additional Bugs 7-9)

### BUG 7 - Layout Consistency:
1. Go to Edit Player page and enter edit mode
2. Go to Edit Squad page
3. Compare spacing between profile photo, name field, and other fields
4. Both should have identical compact spacing (space-y-4)
5. Photo avatars should be same size (medium)

### BUG 8 - Chart Label Alignment:
1. Go to Stats page
2. Check Revenue Over Time chart
3. All data point labels should be centered directly above or below their dots
4. No labels should be offset to the left or right
5. Valley point labels go below, peak/normal labels go above

### BUG 9 - Native Android Keyboard Behavior:
1. Go to any page with input field (e.g., Edit Player, BookingForm)
2. Tap input at the bottom of a long form
3. **Verify keyboard opens and overlays the bottom nav**
4. **Verify bottom nav does NOT move, animate, or disappear**
5. **Verify input scrolls into view automatically (centered)**
6. Tap anywhere outside the input
7. Keyboard should dismiss immediately
8. Bottom nav should remain in same position throughout
9. Test with multiple inputs - nav should never move

**Expected Native Android Behavior:**
- Bottom nav permanently fixed at screen bottom
- Keyboard slides up and covers the nav
- Content area scrolls to show focused input
- Nav never hides, moves, or animates


---

## Files Changed Summary (All 9 Bugs)

**New Files:**
- `src/components/ErrorBoundary.jsx`

**Modified Files:**
- `src/components/common/PhotoUpload.jsx`
- `src/pages/SquadEdit/SquadEdit.jsx`
- `src/pages/EditPlayer/EditPlayer.jsx`
- `src/App.jsx`
- `src/components/booking/BookingCard.jsx`
- `src/pages/Stats/Stats.jsx`
- `capacitor.config.json`
- `src/components/layout/BottomNavbar.jsx`
- `src/components/layout/MobileLayout.jsx`
- `package.json` (@capacitor/keyboard added)
