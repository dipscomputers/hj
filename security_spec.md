# DIPs Computers Student Management CRM - Security Rules Specification

This document details the Zero-Trust security design and the validation constraints for our Firestore database, strictly aligning with the Firebase integration directives.

## 1. Zero-Trust Data Invariants

Our data rules enforce strict mathematical accuracy and structure at the network layer, ensuring zero corruption or spoofing:

1. **Authentication Requirement**: No read or write is allowed without a valid, email-verified Google Sign-In session (`request.auth.uid != null && request.auth.token.email_verified == true`).
2. **Numeric Fees Balance Integrity**: A student's reported `balanceFees` must be strictly equal to `totalFees` minus `paidAmount`, and all fees values must be non-negative.
3. **Receipt Traceability**: Installments are bounded up to 50 items. Each installment must possess a valid billing receipt format (`RC-[0-9]{4}-[0-9]{3,5}`).
4. **ID Sanitization Guard**: Document key identifiers must match regex `^[a-zA-Z0-9_\-]+$` to prevent malicious path-escaping or poisoning.
5. **Timestamp Immutability**: All creation audit fields must match `request.time` exactly upon insertion and cannot be overwritten.

---

## 2. The "Dirty Dozen" Attack Payloads (Validation Failure Cases)

Here are the 12 malicious payloads designed to threaten the database, which we explicitly block at the rules layer to protect DIPs Computers CRM:

### Payload 1: Unauthenticated Read/Snoop Attempt
*   **Attack Vector**: Attempting to read `/students/stud-123` without an active auth cookie or token headers.
*   **Outcome**: Reject unconditionally.

### Payload 2: Spoofed Owner Identity
*   **Attack Vector**: Writing an enquiry with a student ID that is formatted to look like a administrative token or trying to set owner ID to a different administrator's UID.
*   **Outcome**: Reject since auth must match `request.auth.uid`.

### Payload 3: Shadow Field Injection (Shadow Update)
*   **Attack Vector**: An update request inserting an un-schema'd field `isSuperAdmin: true` to `/settings/configs`.
*   **Outcome**: Reject via strict `affectedKeys().hasOnly(...)` filter.

### Payload 4: Overspending Fees Injection
*   **Attack Vector**: Setting `paidAmount: 100000` whilst keeping `totalFees: 5000` to forge artificial scholarship credit.
*   **Outcome**: Reject because mathematical relation must form `balanceFees >= 0` and match `totalFees - paidAmount`.

### Payload 5: Negative Payments Fraud
*   **Attack Vector**: Injecting a negative numeric payment installment (`amount: -2500`) to falsely reverse fee registers.
*   **Outcome**: Reject because installment amount must exceed `0`.

### Payload 6: Unbounded Array Wallet Exhaustion (Denial of Wallet)
*   **Attack Vector**: Uploading a single student record loaded with 5,000 artificial mock installment records to exceed the document 1MB limits.
*   **Outcome**: Reject because installment arrays are strictly limited to `.size() <= 50`.

### Payload 7: Junk Character Poisoning (XSS / SQLi injection in IDs)
*   **Attack Vector**: Using a massive string with junk characters as a Student ID (e.g. `stud-<script>alert('xss')</script>`).
*   **Outcome**: Reject because key patterns must strictly pass regex `^[a-zA-Z0-9_\-]+$`.

### Payload 8: Immutable Creation Date Modification
*   **Attack Vector**: Fudging historical accounting dates by updating the immutable `CreatedDate` or `admissionDate` in a student document.
*   **Outcome**: Reject because creation stamps cannot be modified.

### Payload 9: Future Timestamp Fraud
*   **Attack Vector**: Setting the installment payment date to a year ahead (`2027-12-31`) to forge forward-dated credit.
*   **Outcome**: Reject because write times must match `request.time`.

### Payload 10: Fake Course Override
*   **Attack Vector**: Inserting an enquiry for a course that is not in the approved database register (e.g. `course: 'Hacking 101'`).
*   **Outcome**: Reject since courses must form part of the allowed enum set or are strictly size-checked strings.

### Payload 11: PII Leak Sideload Query
*   **Attack Vector**: Attempting blanket listing of student profiles with public fields without limiting by verified domains or ownership bounds.
*   **Outcome**: Reject because list access evaluates query limits and matching records.

### Payload 12: Invalid Enum Theme Injection
*   **Attack Vector**: Writing a `themeColor` modification payload in `settings` with a non-existent color keyword (e.g. `themeColor: 'royal-neon-pink'`).
*   **Outcome**: Reject because theme colors must conform strictly to `blue`, `indigo`, `emerald`, `slate`, or `violet`.

---

## 3. Test Coverage Strategy (Test Suite Representation)

The validation behavior is simulated via standard test logic using local Firestore SDK runners asserting `firebase.assertSucceeds` or `firebase.assertFails`:

```typescript
// firestore.rules.test.ts
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';

describe("DIPs Computers Systems - Security Fortress", () => {
  let testEnv;

  before(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: "glowing-crowbar-6cf5x",
      firestore: { host: "localhost", port: 8080 }
    });
  });

  it("should fail to read student ledger if unauthorized", async () => {
    const context = testEnv.unauthenticatedContext();
    const db = context.firestore();
    await assertFails(db.collection("students").doc("stud-123").get());
  });

  it("should prevent arbitrary updates adding superadmin flags", async () => {
    const context = testEnv.authenticatedContext("staff-user", { email_verified: true });
    const db = context.firestore();
    await assertFails(db.collection("settings").doc("configs").update({
      isSuperAdmin: true
    }));
  });
});
```
