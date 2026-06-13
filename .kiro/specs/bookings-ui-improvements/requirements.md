# Requirements Document

## Introduction

This feature introduces UI/UX improvements to the Turf Manager Pro bookings interface, addressing user-requested enhancements that were previously lost. The improvements include header modifications, calendar behavior changes, booking card redesign, bug fixes for new booking data persistence, and verification of multi-select functionality. These changes enhance the visual hierarchy, improve interaction patterns, and fix data integrity issues in the booking creation flow.

## Glossary

- **Bookings_Page**: The main Bookings screen component that displays the list of bookings, calendar, and filtering controls
- **Header**: The top-level navigation bar displaying the app logo, theme toggle, and utility icons
- **Haptics_Toggle**: An interactive UI control that enables/disables vibration feedback across the application
- **Booking_Calendar**: A collapsible calendar widget showing bookings with status indicators via colored dots
- **Filter_Menu**: A dropdown interface displaying payment status filter options (Paid, Partial, Pending)
- **Booking_Card**: An individual booking display card showing booking details, status, and payment information
- **Booking_Form**: The Add/Edit Booking form interface for creating or updating booking records
- **Multi_Select_Mode**: An interaction mode allowing users to select multiple bookings or players for batch operations
- **localStorage**: Browser-based persistent storage mechanism for saving user preferences
- **navigator.vibrate()**: Browser API for triggering haptic feedback on supported devices
- **Status_Border**: A 4-pixel left-edge accent border on booking cards indicating payment status
- **Sport_Pill**: A rounded badge displaying the sport name with an emoji icon and status-colored background
- **Booking_ID**: A unique alphanumeric identifier for each booking (format: #BK00XX)
- **Payment_Status**: The current payment state of a booking (Paid, Partial, or Pending)
- **Form_State**: The in-memory data structure holding user input values during booking creation/editing
- **Bottom_Nav**: The floating navigation bar at the bottom of the screen with Bookings, Players, Stats, and Settings tabs

## Requirements

### Requirement 1: Header Haptics Toggle Integration

**User Story:** As a user, I want to replace the notification bell icon with a haptics toggle in the header, so that I can easily enable or disable vibration feedback throughout the app.

#### Acceptance Criteria

1. THE Header SHALL remove the Bell icon component from the top-right icon group
2. THE Header SHALL display a Vibrate icon (from lucide-react) in place of the Bell icon
3. WHEN Haptics_Toggle is in the ON state, THE Header SHALL apply a teal tint color to the Vibrate icon
4. WHEN Haptics_Toggle is in the OFF state, THE Header SHALL apply a muted/strikethrough visual appearance to the Vibrate icon
5. WHEN a user clicks the Vibrate icon, THE Header SHALL toggle the haptics enabled state
6. THE Header SHALL persist the haptics preference to localStorage using the key "haptics-enabled"
7. THE Header SHALL load the haptics preference from localStorage on initialization
8. WHEN haptics is enabled and a user performs a button click action, THE application SHALL call navigator.vibrate() with appropriate duration
9. WHEN haptics is enabled and a user performs a form submit action, THE application SHALL call navigator.vibrate() with appropriate duration

### Requirement 2: Header Subtitle Removal

**User Story:** As a user, I want a cleaner header without redundant subtitle information, so that the screen real estate is better utilized.

#### Acceptance Criteria

1. THE Bookings_Page SHALL remove the "Premium turf dashboard" subtitle text from the header section
2. THE Bookings_Page SHALL maintain the weekday label (e.g., "SATURDAY") in uppercase brand color
3. THE Bookings_Page SHALL maintain the date display (e.g., "13 Jun") in large bold text
4. THE Bookings_Page SHALL remove any container elements that were solely used for the subtitle block

### Requirement 3: Calendar Always-Expanded Behavior

**User Story:** As a user, I want the calendar to remain always visible without manual expansion, so that I can quickly reference dates without extra interactions.

#### Acceptance Criteria

1. THE Booking_Calendar SHALL initialize in the expanded state by default
2. THE Booking_Calendar SHALL remove the collapsible dropdown toggle functionality
3. THE Booking_Calendar SHALL remove the ChevronDown icon that previously controlled visibility
4. THE Booking_Calendar SHALL remove the onClick handler that toggled the open state
5. THE Booking_Calendar SHALL display the calendar grid immediately without animation delay
6. THE Booking_Calendar SHALL default to "Week" view on initial render

### Requirement 4: Filter Icon Repositioning

**User Story:** As a user, I want the filter icon positioned inline with the period tabs, so that all filtering controls are visually grouped together.

#### Acceptance Criteria

1. THE Bookings_Page SHALL remove the Filter_Menu component from its current position above the Booking_Calendar
2. THE Bookings_Page SHALL position the Filter_Menu component below the Booking_Calendar
3. THE Bookings_Page SHALL display the Filter_Menu icon inline at the right end of the "All | This Week | This Month | This Year" filter pills row
4. THE Bookings_Page SHALL align the Filter_Menu vertically centered with the filter pills
5. THE Bookings_Page SHALL maintain the Filter_Menu functionality and dropdown behavior in the new position

### Requirement 5: Booking Card Visual Redesign

**User Story:** As a user, I want redesigned booking cards with improved visual hierarchy and clearer status indicators, so that I can quickly scan and understand booking information.

#### Acceptance Criteria

1. THE Booking_Card SHALL arrange content in a three-row layout with consistent spacing
2. THE Booking_Card SHALL display the sport emoji and name in a Sport_Pill badge in the top-left of Row 1
3. THE Booking_Card SHALL apply a tinted background color to the Sport_Pill matching the Payment_Status color scheme
4. THE Booking_Card SHALL display the booking amount in bold text in the top-right of Row 1
5. WHEN Payment_Status is "Paid", THE Booking_Card SHALL color the amount text green (#10b981)
6. WHEN Payment_Status is "Partial", THE Booking_Card SHALL color the amount text amber (#f59e0b)
7. WHEN Payment_Status is "Pending", THE Booking_Card SHALL color the amount text red (#ef4444)
8. THE Booking_Card SHALL display the turf/ground name in bold text in Row 2
9. THE Booking_Card SHALL display date/time/players with icons in the left portion of Row 3
10. THE Booking_Card SHALL display the status badge pill in the right portion of Row 3
11. THE Booking_Card SHALL remove all current tinted backgrounds (pink/orange/green)
12. THE Booking_Card SHALL apply a standard white/surface color background
13. THE Booking_Card SHALL add a 4-pixel left Status_Border colored by Payment_Status
14. WHEN Payment_Status is "Paid", THE Booking_Card SHALL color the Status_Border green (#10b981)
15. WHEN Payment_Status is "Partial", THE Booking_Card SHALL color the Status_Border amber (#f59e0b)
16. WHEN Payment_Status is "Pending", THE Booking_Card SHALL color the Status_Border red (#ef4444)
17. THE Booking_Card SHALL display the Booking_ID in small muted text in the top-right corner area
18. THE Booking_Card SHALL format the Booking_ID with a "#" prefix if not already present

### Requirement 6: Booking Form Data Persistence Bug Fix

**User Story:** As a user, I want my selected sport, turf, and player count to be correctly saved when creating a new booking, so that the booking displays accurate information.

#### Acceptance Criteria

1. WHEN a user submits the Booking_Form, THE Booking_Form SHALL read the sportId value from Form_State
2. WHEN a user submits the Booking_Form, THE Booking_Form SHALL read the turfId value from Form_State
3. WHEN a user submits the Booking_Form, THE Booking_Form SHALL read the playerIds array from Form_State for Individual bookings
4. WHEN a user submits the Booking_Form, THE Booking_Form SHALL read the teams array from Form_State for Team bookings
5. THE Booking_Form SHALL validate that sportId is not empty before submission
6. THE Booking_Form SHALL validate that turfId is not empty before submission
7. THE Booking_Form SHALL validate that playerIds contains at least one player for Individual bookings before submission
8. THE Booking_Form SHALL validate that teams contains at least one team for Team bookings before submission
9. THE Booking_Form SHALL persist the sportId field in the booking object passed to addBooking()
10. THE Booking_Form SHALL persist the turfId field in the booking object passed to addBooking()
11. THE Booking_Form SHALL persist the playerIds field in the booking object passed to addBooking() for Individual bookings
12. THE Booking_Form SHALL persist the teams field in the booking object passed to addBooking() for Team bookings
13. WHEN a booking is created with valid sport/turf/players data, THE Booking_Card SHALL display the correct sport name instead of "Sport"
14. WHEN a booking is created with valid sport/turf/players data, THE Booking_Card SHALL display the correct turf name instead of "Unknown Turf"
15. WHEN a booking is created with valid sport/turf/players data, THE Booking_Card SHALL display the correct player count instead of "0 players"

### Requirement 7: Multi-Select Mode Verification

**User Story:** As a user, I want to verify that multi-select functionality works correctly for batch operations on bookings and players, so that I can efficiently manage multiple items.

#### Acceptance Criteria

1. THE Bookings_Page SHALL display a floating "+" button docked in a curved notch on the Bottom_Nav
2. THE Players_Page SHALL display a floating "+" button docked in a curved notch on the Bottom_Nav
3. THE Stats_Page SHALL NOT display the floating "+" button
4. THE Settings_Page SHALL NOT display the floating "+" button
5. WHEN a user performs a long-press gesture on a Booking_Card, THE Bookings_Page SHALL enter Multi_Select_Mode
6. WHEN a user performs a long-press gesture on a Player_Card, THE Players_Page SHALL enter Multi_Select_Mode
7. WHEN Multi_Select_Mode is active, THE Booking_Card SHALL display a checkbox overlay
8. WHEN Multi_Select_Mode is active, THE Booking_Card SHALL highlight selected items with a visual indicator
9. WHEN Multi_Select_Mode is active and exactly 1 item is selected, THE bottom action bar SHALL display: [X button][count][Edit button][Delete button]
10. WHEN Multi_Select_Mode is active and 2 or more items are selected, THE bottom action bar SHALL display: [X button][count][Delete button]
11. WHEN Multi_Select_Mode is active, THE X button SHALL exit Multi_Select_Mode and clear selections
12. WHEN Multi_Select_Mode is active with 1 item selected, THE Edit button SHALL navigate to the edit form for that item
13. WHEN Multi_Select_Mode is active, THE Delete button SHALL trigger a confirmation dialog for the selected items
14. WHEN a user confirms deletion, THE application SHALL remove all selected items from the data store
