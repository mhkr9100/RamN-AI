## 2026-02-28 - [Accessible Destructive Actions]
**Learning:** In highly compact, icon-heavy sidebars, destructive actions like 'Delete' are often too close to navigation elements, increasing the risk of accidental clicks. Adding a confirmation step not only prevents errors but provides a clear "undo" path in the user's mental model. Icons without labels are completely inaccessible to screen reader users and provide poor affordance for new users.

**Action:** Always wrap destructive sidebar actions in a confirmation modal and ensure all navigation rail icons have explicit ARIA labels.
