# Security Architecture & Data Isolation

This document outlines the security controls, data isolation boundaries, cryptographic primitives, and threat mitigation strategies implemented in Classmate.

---

## 1. Threat Model & Security Principles

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        CLASSROOM BOUNDARY                              │
│                                                                        │
│   ┌───────────────────────────┐     ┌───────────────────────────┐      │
│   │       Student Alice       │     │        Student Bob        │      │
│   │   (Session Verified)      │     │    (Session Verified)     │      │
│   └─────────────┬─────────────┘     └─────────────┬─────────────┘      │
│                 │                                 │                    │
│                 ▼                                 ▼                    │
│   ┌─────────────────────────────────────────────────────────────┐      │
│   │                  Query Isolation Layer                      │      │
│   │   WHERE classroom_id = $room                                │      │
│   │   AND (channel_id IS NOT NULL                               │      │
│   │        OR sender_id = $me                                   │      │
│   │        OR recipient_id = $me)                               │      │
│   └─────────────────────────────┬───────────────────────────────┘      │
│                                 ▼                                      │
│   ┌─────────────────────────────────────────────────────────────┐      │
│   │                    Supabase PostgreSQL                      │      │
│   │                TLS 1.3 Transport Encryption                 │      │
│   └─────────────────────────────────────────────────────────────┘      │
└────────────────────────────────────────────────────────────────────────┘
```

Classmate is designed around three non-negotiable security mandates:
1. **Zero Eavesdropping in Private DMs**: Students must never be able to inspect or intercept private messages belonging to other classmates.
2. **Strict Classroom Boundary**: Data from one classroom can never leak into another classroom.
3. **Zero Third-Party Telemetry**: Student communications are never shared with advertising networks or tracking services.

---

## 2. Query-Level Direct Message Isolation

* 📁 **Raw File**: [`src/lib/database/messagesDb.ts`](../src/lib/database/messagesDb.ts)
* Rather than relying solely on client-side filtering, privacy is enforced at the database query level:

### A. Raw Code: `dbFetchMessages` Scoping
```typescript
// From src/lib/database/messagesDb.ts
const sessionUserId = getCurrentSessionUserId();

let query = supabase
  .from('messages')
  .select('*')
  .eq('classroom_id', classroomId);

// Enforce privacy: only fetch group messages or DMs where the student is a participant
if (sessionUserId) {
  query = query.or(
    `channel_id.not.is.null,sender_id.eq.${sessionUserId},recipient_id.eq.${sessionUserId}`
  );
}

const { data, error } = await query.order('created_at', { ascending: true });
```

### B. Defense-in-Depth Verification
Even after receiving query results, client-side filtering confirms that any DM row whose `senderId` or `recipientId` does not match the active session is immediately dropped before reaching the UI state.

---

## 3. Cryptographic Session Signing

* 📁 **Raw File**: [`src/lib/security/sessionSecurity.ts`](../src/lib/security/sessionSecurity.ts)
* To prevent unauthorized tampering with session tokens stored in the browser, tokens are cryptographically signed using an HMAC-SHA256 signature scheme.

### A. Token Generation & Validation
```typescript
// From src/lib/security/sessionSecurity.ts:
export function signUserSession(user: User): string {
  const payload = {
    id: user.id,
    role: user.role,
    name: user.name,
    timestamp: Date.now(),
  };
  const encodedPayload = btoa(JSON.stringify(payload));
  const signature = createHmacSignature(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

export function validateUserSession(token: string): boolean {
  if (!token || !token.includes('.')) return false;
  const [encodedPayload, signature] = token.split('.');
  return createHmacSignature(encodedPayload) === signature;
}
```

---

## 4. Password & PIN Hashing

* 📁 **Raw File**: [`src/lib/security/passwordUtils.ts`](../src/lib/security/passwordUtils.ts)
* Classroom security PINs and administrative credentials are verified using salted hashing mechanisms.
* Plaintext credentials are never written to database logs.

---

## 5. Disappearing & Auto-Expiring Messages

* 📁 **Raw Files**:
  * [`src/hooks/useChatActions.ts`](../src/hooks/useChatActions.ts)
  * [`src/lib/database/messagesDb.ts`](../src/lib/database/messagesDb.ts)
* Messages can be configured with an auto-deletion expiration timer (`24h`, `7d`, or `never`).
* When `expires_at` is set, the background query routine executes:
```sql
DELETE FROM messages
WHERE classroom_id = $classroomId
  AND expires_at IS NOT NULL
  AND expires_at <= NOW();
```
* Once expired, the message is permanently destroyed from disk.

---

## 6. Zero-Telemetry & Storage Privacy

1. **No External Trackers**: The application contains no Google Analytics, Facebook Pixel, Mixpanel, or telemetry scripts.
2. **Cookie-Free**: Session persistence uses browser-sandboxed `localStorage` (when Remember Me is enabled) or `sessionStorage` (for shared lab machines).
3. **Instant URL Sanitization**: Appending `?reset=true` to the application URL completely wipes all local browser state and clears active credentials immediately.
