# Exact Output Format - nextActionDueAt Implementation

## Complete Output Examples for All Scenarios

---

## Scenario 1: Direct Update via GraphQL

### Request

```graphql
mutation UpdateLeadNextAction {
  updateIpkLeadd(
    input: { id: "65abc123def456789012345f", nextActionDueAt: "2025-11-26T10:30:00Z" }
  ) {
    id
    name
    email
    phone
    status
    nextActionDueAt
    lastContactedAt
    createdAt
    updatedAt
    assignedRmId
    assignedRM
  }
}
```

### Response (Success)

```json
{
  "data": {
    "updateIpkLeadd": {
      "id": "65abc123def456789012345f",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "phone": "+1-234-567-8900",
      "status": "OPEN",
      "nextActionDueAt": "2025-11-26T10:30:00.000Z",
      "lastContactedAt": "2025-11-19T06:00:00.000Z",
      "createdAt": "2025-11-01T10:00:00.000Z",
      "updatedAt": "2025-11-19T07:12:24.314Z",
      "assignedRmId": "rm_12345",
      "assignedRM": "Raj Kumar"
    }
  }
}
```

### Response (Error)

```json
{
  "errors": [
    {
      "message": "Lead not found",
      "extensions": {
        "code": "BAD_REQUEST"
      }
    }
  ]
}
```

---

## Scenario 2: Auto-Update via Interaction Creation

### Request

```graphql
mutation ScheduleCallback {
  addLeadInteraction(
    input: {
      leadId: "65abc123def456789012345f"
      text: "Called customer, very interested in product. Scheduled callback for follow-up discussion"
      channel: CALL
      outcome: SCHEDULED_CALLBACK
      nextFollowUpAt: "2025-11-23T14:00:00Z"
      tags: ["CALLBACK", "INTERESTED", "PRODUCT_DEMO"]
    }
  ) {
    id
    leadId
    type
    text
    tags
    occurredAt
    meta
    authorId
  }
}
```

### Response (Success)

```json
{
  "data": {
    "addLeadInteraction": {
      "id": "evt_654321abcdef987654321fed",
      "leadId": "65abc123def456789012345f",
      "type": "INTERACTION",
      "text": "Called customer, very interested in product. Scheduled callback for follow-up discussion",
      "tags": ["CALL", "OUTCOME_SCHEDULED_CALLBACK", "CALLBACK", "INTERESTED", "PRODUCT_DEMO"],
      "occurredAt": "2025-11-19T07:12:24.314Z",
      "meta": {
        "channel": "CALL",
        "outcome": "SCHEDULED_CALLBACK",
        "nextFollowUpAt": "2025-11-23T14:00:00.000Z"
      },
      "authorId": "user_12345"
    }
  }
}
```

### What Happened in Background (Automatic)

```
Lead Update (Behind the Scenes):
{
  id: "65abc123def456789012345f"
  nextActionDueAt: "2025-11-23T14:00:00.000Z"  ← Automatically set!
  updatedAt: "2025-11-19T07:12:24.314Z"
}
```

---

## Scenario 3: Query Lead After Update

### Request

```graphql
query GetLeadWithNextAction {
  ipkLeadd(id: "65abc123def456789012345f") {
    id
    name
    nextActionDueAt
    events(limit: 1) {
      id
      type
      text
      occurredAt
      meta
    }
  }
}
```

### Response

```json
{
  "data": {
    "ipkLeadd": {
      "id": "65abc123def456789012345f",
      "name": "John Doe",
      "nextActionDueAt": "2025-11-23T14:00:00.000Z",
      "events": [
        {
          "id": "evt_654321abcdef987654321fed",
          "type": "INTERACTION",
          "text": "Called customer, very interested in product. Scheduled callback for follow-up discussion",
          "occurredAt": "2025-11-19T07:12:24.314Z",
          "meta": {
            "channel": "CALL",
            "outcome": "SCHEDULED_CALLBACK",
            "nextFollowUpAt": "2025-11-23T14:00:00.000Z"
          }
        }
      ]
    }
  }
}
```

---

## Scenario 4: Clear/Null nextActionDueAt

### Request

```graphql
mutation ClearNextAction {
  updateIpkLeadd(input: { id: "65abc123def456789012345f", nextActionDueAt: null }) {
    id
    nextActionDueAt
  }
}
```

### Response

```json
{
  "data": {
    "updateIpkLeadd": {
      "id": "65abc123def456789012345f",
      "nextActionDueAt": null
    }
  }
}
```

---

## Scenario 5: Invalid Date Handling

### Request

```graphql
mutation InvalidDate {
  updateIpkLeadd(input: { id: "65abc123def456789012345f", nextActionDueAt: "this-is-not-a-date" }) {
    id
    nextActionDueAt
  }
}
```

### Response (Gracefully Handled)

```json
{
  "data": {
    "updateIpkLeadd": {
      "id": "65abc123def456789012345f",
      "nextActionDueAt": null
    }
  }
}
```

**Note**: Invalid dates are converted to `null` safely. No error thrown.

---

## Scenario 6: Complete Lead Update with All Fields

### Request

```graphql
mutation CompleteUpdate {
  updateIpkLeadd(
    input: {
      id: "65abc123def456789012345f"
      name: "John Doe"
      email: "john@example.com"
      phone: "+1-234-567-8900"
      nextActionDueAt: "2025-11-26T10:30:00Z"
      bioText: "Customer interested in wealth management products"
    }
  ) {
    id
    name
    email
    phone
    bioText
    nextActionDueAt
    updatedAt
    assignedRM
  }
}
```

### Response

```json
{
  "data": {
    "updateIpkLeadd": {
      "id": "65abc123def456789012345f",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1-234-567-8900",
      "bioText": "Customer interested in wealth management products",
      "nextActionDueAt": "2025-11-26T10:30:00.000Z",
      "updatedAt": "2025-11-19T07:12:24.314Z",
      "assignedRM": "Raj Kumar"
    }
  }
}
```

---

## Scenario 7: Multiple Events for Same Lead

### Request

```graphql
query GetLeadWithAllEvents {
  ipkLeadd(id: "65abc123def456789012345f") {
    id
    name
    nextActionDueAt
    events(limit: 5) {
      id
      type
      text
      occurredAt
      meta
    }
  }
}
```

### Response

```json
{
  "data": {
    "ipkLeadd": {
      "id": "65abc123def456789012345f",
      "name": "John Doe",
      "nextActionDueAt": "2025-11-26T10:30:00.000Z",
      "events": [
        {
          "id": "evt_1",
          "type": "INTERACTION",
          "text": "Follow-up call completed, customer ready to invest",
          "occurredAt": "2025-11-19T07:12:24.314Z",
          "meta": {
            "channel": "CALL",
            "outcome": "READY_TO_INVEST",
            "nextFollowUpAt": "2025-11-26T10:30:00.000Z"
          }
        },
        {
          "id": "evt_2",
          "type": "INTERACTION",
          "text": "Initial contact, customer interested",
          "occurredAt": "2025-11-18T14:30:00.000Z",
          "meta": {
            "channel": "WHATSAPP",
            "outcome": "INTERESTED",
            "nextFollowUpAt": "2025-11-19T10:00:00.000Z"
          }
        },
        {
          "id": "evt_3",
          "type": "NOTE",
          "text": "Customer from referral, high priority",
          "occurredAt": "2025-11-17T09:00:00.000Z",
          "meta": null
        }
      ]
    }
  }
}
```

---

## Scenario 8: Different Date Formats (All Produce Same Result)

### Format 1: ISO String

```graphql
mutation {
  updateIpkLeadd(
    input: { id: "65abc123def456789012345f", nextActionDueAt: "2025-11-26T10:30:00Z" }
  ) {
    nextActionDueAt
  }
}
```

### Format 2: JavaScript Date (from Frontend)

```typescript
const date = new Date('2025-11-26T10:30:00Z');
// Result: 2025-11-26T10:30:00.000Z
```

### Format 3: Unix Timestamp

```typescript
const timestamp = 1732612200000; // ms since epoch
const date = new Date(timestamp);
// Result: 2025-11-26T10:30:00.000Z
```

### All Produce Same Output

```json
{
  "data": {
    "updateIpkLeadd": {
      "nextActionDueAt": "2025-11-26T10:30:00.000Z"
    }
  }
}
```

---

## Scenario 9: Batch Operations

### Request - Create Multiple Interactions

```graphql
mutation MultipleInteractions {
  interaction1: addLeadInteraction(
    input: { leadId: "lead_1", text: "Call 1", nextFollowUpAt: "2025-11-23T10:00:00Z" }
  ) {
    id
  }

  interaction2: addLeadInteraction(
    input: { leadId: "lead_2", text: "Call 2", nextFollowUpAt: "2025-11-24T10:00:00Z" }
  ) {
    id
  }
}
```

### Response

```json
{
  "data": {
    "interaction1": { "id": "evt_001" },
    "interaction2": { "id": "evt_002" }
  }
}
```

**Result**: Both leads updated with their respective nextActionDueAt values automatically.

---

## Data Types

### nextActionDueAt Field

```typescript
// GraphQL Type
type IpkLeaddEntity {
  nextActionDueAt: DateTime  // Nullable
}

// MongoDB Type
nextActionDueAt: Date | null

// JSON Response Format
"nextActionDueAt": "2025-11-26T10:30:00.000Z" | null
```

### Event Meta Field

```typescript
// GraphQL Type
type LeadEventEntity {
  meta: JSON  // Contains nextFollowUpAt
}

// MongoDB Type
meta: {
  channel?: string
  outcome?: string
  nextFollowUpAt?: string  // ISO date string
  dormantReason?: string
}

// JSON Response Format
"meta": {
  "channel": "CALL",
  "outcome": "SCHEDULED_CALLBACK",
  "nextFollowUpAt": "2025-11-23T14:00:00.000Z"
}
```

---

## Error Response Examples

### Lead Not Found

```json
{
  "errors": [
    {
      "message": "Lead not found",
      "extensions": { "code": "BAD_REQUEST" }
    }
  ]
}
```

### Invalid Input

```json
{
  "errors": [
    {
      "message": "Validation error: id is required",
      "extensions": { "code": "BAD_REQUEST" }
    }
  ]
}
```

### Database Connection Error

```json
{
  "errors": [
    {
      "message": "Database error",
      "extensions": { "code": "INTERNAL_SERVER_ERROR" }
    }
  ]
}
```

---

## Success Status Codes

- ✅ **200 OK**: Mutation/Query successful
- ✅ **200 OK + errors**: Partial success with field errors
- ❌ **400 Bad Request**: Validation/input error
- ❌ **401 Unauthorized**: Auth required
- ❌ **500 Internal Server Error**: Server error

---

## Common Response Patterns

### Updated Field Only

```json
{
  "data": {
    "updateIpkLeadd": {
      "nextActionDueAt": "2025-11-26T10:30:00.000Z"
    }
  }
}
```

### Full Object Response

```json
{
  "data": {
    "updateIpkLeadd": {
      "id": "lead_123",
      "name": "John",
      "nextActionDueAt": "2025-11-26T10:30:00.000Z",
      "updatedAt": "2025-11-19T07:12:24.314Z"
    }
  }
}
```

### Event with Metadata

```json
{
  "data": {
    "addLeadInteraction": {
      "id": "evt_123",
      "leadId": "lead_123",
      "type": "INTERACTION",
      "meta": {
        "nextFollowUpAt": "2025-11-23T14:00:00.000Z"
      }
    }
  }
}
```

---

## Frontend Integration Example

```typescript
// React Hook
const updateNextAction = async (leadId: string, date: Date) => {
  const response = await fetch('/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: `
        mutation {
          updateIpkLeadd(input: {
            id: "${leadId}"
            nextActionDueAt: "${date.toISOString()}"
          }) {
            id
            nextActionDueAt
            updatedAt
          }
        }
      `,
    }),
  });

  const json = await response.json();

  if (json.errors) {
    console.error('Error:', json.errors);
    return null;
  }

  return json.data.updateIpkLeadd;
};

// Usage
const lead = await updateNextAction('lead_123', new Date('2025-11-26T10:30:00Z'));
console.log(lead.nextActionDueAt); // "2025-11-26T10:30:00.000Z"
```

---

## Summary

All API responses follow this pattern:

```json
{
  "data": {
    "mutation_name": {
      "field1": "value1",
      "field2": "value2",
      "nextActionDueAt": "2025-11-26T10:30:00.000Z"
    }
  }
}
```

Or with errors:

```json
{
  "errors": [{ "message": "Error message" }]
}
```

**Note**: The exact format depends on which fields you request in the GraphQL query.
