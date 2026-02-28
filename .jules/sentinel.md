## 2025-05-15 - Broken Object Level Authorization in DB Sync
**Vulnerability:** Broken Access Control / IDOR in `/api/db`.
**Learning:** The cloud sync engine was designed for "local-first" ease of use, leading to an architecture where the backend blindly trusted the `userId` provided in query parameters or request bodies without verifying it against a session token.
**Prevention:** Always extract and verify user identity from a secure token (JWT) on every backend request that involves user-specific data, even in "beta" or "internal" services. Use the `extractUserIdFromToken` pattern consistently across all Lambda handlers.
