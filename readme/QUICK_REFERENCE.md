# Quick Reference - nextActionDueAt Implementation

## What Changed?

Two files were modified to auto-update `nextActionDueAt`:

### 1. LeadEventService

- **Method**: `addInteraction()` - now auto-updates lead's nextActionDueAt
- **Method**: `updateLeadNextActionDueAt()` - new helper method

### 2. IpkLeaddService

- **Method**: `buildLeadUpdateData()` - now handles nextActionDueAt field

---

## Quick Examples

### Update Directly (Frontend)

```graphql
mutation {
  updateIpkLeadd(input: { id: "lead_123", nextActionDueAt: "2025-11-26T10:30:00Z" }) {
    id
    nextActionDueAt
  }
}
```

### Auto-Update via Interaction (Frontend)

```graphql
mutation {
  addLeadInteraction(
    input: {
      leadId: "lead_123"
      text: "Callback scheduled"
      channel: CALL
      outcome: SCHEDULED_CALLBACK
      nextFollowUpAt: "2025-11-23T14:00:00Z"
    }
  ) {
    id
    meta
  }
}
```

**Result**: Lead's nextActionDueAt automatically set to "2025-11-23T14:00:00Z"

---

## What Happens?

### When interaction is created with nextFollowUpAt:

```
addLeadInteraction(nextFollowUpAt: date)
        ↓
   Create LeadEvent
        ↓
   Store nextFollowUpAt in event.meta
        ↓
   Call updateLeadNextActionDueAt()
        ↓
Lead.nextActionDueAt = date ✅
```

### When lead is directly updated:

```
updateIpkLeadd(nextActionDueAt: date)
        ↓
   buildLeadUpdateData()
        ↓
   Parse date (supports string, Date, null)
        ↓
   Prisma.update()
        ↓
Lead.nextActionDueAt = date ✅
```

---

## Output Format

### Updated Lead

```json
{
  "id": "lead_123",
  "name": "John Doe",
  "nextActionDueAt": "2025-11-26T10:30:00Z",
  "updatedAt": "2025-11-19T07:12:24.314Z"
}
```

### LeadEvent (when interaction created)

```json
{
  "id": "evt_123",
  "leadId": "lead_123",
  "type": "INTERACTION",
  "text": "Callback scheduled",
  "meta": {
    "channel": "CALL",
    "outcome": "SCHEDULED_CALLBACK",
    "nextFollowUpAt": "2025-11-23T14:00:00Z"
  }
}
```

---

## Input Formats Supported

```typescript
// ISO String
nextActionDueAt: "2025-11-26T10:30:00Z" ✅

// Date object
nextActionDueAt: new Date("2025-11-26T10:30:00Z") ✅

// Null (clears field)
nextActionDueAt: null ✅

// Invalid date (safely converted to null)
nextActionDueAt: "invalid" ✅ → null
```

---

## Error Handling

- ✅ Try-catch blocks prevent crashes
- ✅ Invalid dates converted to null
- ✅ Auto-update non-blocking
- ✅ Errors logged to console
- ✅ Function returns null on failure

---

## Testing

```bash
# 1. Test direct update
mutation {
  updateIpkLeadd(input: { id: "123", nextActionDueAt: "2025-11-26T10:00:00Z" })
}

# 2. Test interaction with follow-up
mutation {
  addLeadInteraction(input: {
    leadId: "123",
    nextFollowUpAt: "2025-11-23T10:00:00Z"
  })
}

# 3. Verify lead was updated
query {
  ipkLeadd(id: "123") { nextActionDueAt }
}

# 4. Check event history
query {
  ipkLeadd(id: "123") {
    events { meta }
  }
}
```

---

## Code Location

### LeadEventService

File: `src/app/lead_event/lead-event.service.ts`

- Line ~63: `addInteraction()` - modified
- Line ~320: `updateLeadNextActionDueAt()` - added

### IpkLeaddService

File: `src/app/lead/ipk-leadd.service.ts`

- Line ~142: `buildLeadUpdateData()` - modified
- Added nextActionDueAt parsing logic

---

## GraphQL Schema

The system uses existing GraphQL types:

```graphql
type IpkLeaddEntity {
  id: ID!
  name: String
  nextActionDueAt: DateTime # ← This field
  # ... other fields
}

type LeadEventEntity {
  id: ID!
  leadId: ID!
  meta: JSON # ← Contains nextFollowUpAt
  # ... other fields
}

input UpdateIpkLeaddInput {
  id: ID!
  nextActionDueAt: DateTime # ← Can be set here
  # ... other fields
}
```

---

## Flow Diagram

```
┌─────────────────────────────────────┐
│  User Updates Lead (Frontend)       │
└────────────────┬────────────────────┘
                 │
        ┌────────▼─────────┐
        │ updateIpkLeadd() │
        └────────┬─────────┘
                 │
        ┌────────▼──────────────────┐
        │ buildLeadUpdateData()     │
        │ Parses nextActionDueAt    │
        └────────┬──────────────────┘
                 │
        ┌────────▼──────────────────┐
        │ Prisma.ipkLeadd.update()  │
        │ Saves to MongoDB          │
        └────────┬──────────────────┘
                 │
        ┌────────▼──────────────────┐
        │ Return Updated Lead       │
        │ with nextActionDueAt      │
        └────────────────────────────┘


┌──────────────────────────────────────────┐
│  User Creates Interaction (Frontend)     │
└────────────┬─────────────────────────────┘
             │
    ┌────────▼──────────────┐
    │ addLeadInteraction()  │
    └────────┬──────────────┘
             │
    ┌────────▼─────────────────┐
    │ createEvent() - Save      │
    │ LeadEvent to DB          │
    │ meta.nextFollowUpAt      │
    └────────┬─────────────────┘
             │
    ┌────────▼──────────────────────────┐
    │ updateLeadNextActionDueAt()       │
    │ AUTO-UPDATE lead.nextActionDueAt  │
    └────────┬──────────────────────────┘
             │
    ┌────────▼──────────────────┐
    │ Return LeadEvent          │
    │ + Lead Updated ✅         │
    └──────────────────────────┘
```

---

## Key Features

✅ **Auto-Update**: Interaction with follow-up auto-updates lead  
✅ **Manual Update**: Direct field update supported  
✅ **Audit Trail**: nextFollowUpAt stored in event metadata  
✅ **Type Safe**: Full TypeScript support  
✅ **Error Handling**: Graceful fallbacks  
✅ **Date Parsing**: Supports multiple input formats  
✅ **Non-blocking**: Auto-update doesn't block event creation  
✅ **No Migration**: Uses existing schema

---

## Common Mistakes to Avoid

❌ **Don't**: Pass invalid date string without try-catch
✅ **Do**: System handles it (converts to null)

❌ **Don't**: Expect synchronous update from interaction
✅ **Do**: It updates async in background

❌ **Don't**: Query lead immediately after interaction
✅ **Do**: Wait for response or refetch

❌ **Don't**: Forget the `nextFollowUpAt` field in interaction
✅ **Do**: Include it in mutation if you want auto-update

---

## Related Files

- `NEXT_ACTION_DUE_AT_UPDATE.md` - Full specification
- `IMPLEMENTATION_COMPLETE.md` - Complete implementation guide
- `src/app/lead_event/lead-event.service.ts` - Implementation
- `src/app/lead/ipk-leadd.service.ts` - Implementation

---

## Support

Everything is working! No additional setup needed.

Just use the mutations as shown in the examples above.
