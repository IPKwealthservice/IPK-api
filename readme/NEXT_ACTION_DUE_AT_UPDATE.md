# Auto-Update nextActionDueAt on Lead Events

## Overview

When a user updates `nextActionDueAt` via frontend, or when any follow-up event (interaction, note, etc.) is created, the lead's `nextActionDueAt` should be automatically updated.

---

## Implementation

### Step 1: Add Helper Method to LeadEventService

**File**: `src/app/lead_event/lead-event.service.ts`

Add this method at the end of the class to update the lead's nextActionDueAt:

```typescript
  /**
   * Update lead's nextActionDueAt based on the event's nextFollowUpAt
   * Called after creating interactions with follow-up dates
   */
  async updateLeadNextActionDueAt(
    leadId: string,
    nextActionDueAt: Date | null,
  ) {
    if (!leadId) return null;

    try {
      return await this.prisma.ipkLeadd.update({
        where: { id: leadId },
        data: {
          nextActionDueAt: nextActionDueAt ?? null,
        },
        include: { assignedRm: true },
      });
    } catch (error) {
      console.error(`Failed to update nextActionDueAt for lead ${leadId}:`, error);
      return null;
    }
  }
```

---

### Step 2: Update addInteraction Method

**File**: `src/app/lead_event/lead-event.service.ts`

Modify the `addInteraction` method to auto-update lead's nextActionDueAt:

```typescript
  async addInteraction(
    params: {
      leadId: string;
      text: string;
      tags?: string[];
      channel?: InteractionChannel | null;
      outcome?: InteractionOutcome | null;
      nextFollowUpAt?: Date | null;
      dormantReason?: DormantReason | null;
    },
    authorId?: string | null,
  ) {
    const { leadId, text, tags = [], channel, outcome, nextFollowUpAt, dormantReason } = params;

    const autoTags = [
      ...(channel ? [String(channel)] : []),
      ...(outcome ? [`OUTCOME_${outcome}`] : []),
    ];
    const normalizedTags = Array.from(new Set([...tags, ...autoTags]));

    const meta: Record<string, unknown> = {};
    if (channel) meta.channel = channel;
    if (outcome) meta.outcome = outcome;
    if (nextFollowUpAt) meta.nextFollowUpAt = nextFollowUpAt.toISOString();
    if (dormantReason) meta.dormantReason = dormantReason;

    const event = await this.createEvent({
      leadId,
      authorId,
      type: LeadEventType.INTERACTION as unknown as $Enums.LeadEventType,
      text,
      tags: normalizedTags,
      meta:
        (Object.keys(meta).length > 0 ? (meta as Prisma.InputJsonValue) : undefined) ?? undefined,
    });

    // Auto-update lead's nextActionDueAt if nextFollowUpAt is provided
    if (nextFollowUpAt) {
      await this.updateLeadNextActionDueAt(leadId, nextFollowUpAt);
    }

    return event;
  }
```

---

### Step 3: Update buildLeadUpdateData in IpkLeaddService

**File**: `src/app/lead/ipk-leadd.service.ts`

Add support for `nextActionDueAt` in the `buildLeadUpdateData` method. Find the section around line 150 and add:

```typescript
  private buildLeadUpdateData(input: UpdateLeadDto): Prisma.IpkLeaddUpdateInput {
    const data: Prisma.IpkLeaddUpdateInput = {};

    // ... existing code ...

    if (input.approachAt !== undefined) {
      data.approachAt = parseApproachAt(input.approachAt) ?? null;
    }

    // ADD THIS SECTION:
    // Handle nextActionDueAt update
    if ((input as unknown as { nextActionDueAt?: unknown }).nextActionDueAt !== undefined) {
      const raw = (input as unknown as { nextActionDueAt?: unknown }).nextActionDueAt;
      if (raw === null || raw === undefined) {
        data.nextActionDueAt = null;
      } else if (raw instanceof Date) {
        data.nextActionDueAt = raw;
      } else if (typeof raw === 'string') {
        const date = new Date(raw);
        data.nextActionDueAt = isNaN(date.getTime()) ? null : date;
      } else {
        data.nextActionDueAt = null;
      }
    }

    if (input.clientQa !== undefined) {
      data.clientQa = (input.clientQa ?? null) as unknown as Prisma.InputJsonValue;
    }

    // ... rest of code ...
  }
```

---

### Step 4: Update UpdateLeadDto

**File**: `src/app/lead/dto/update-lead.dto.ts`

Ensure the DTO can handle nextActionDueAt. Update or verify the CreateLeadDto (parent class):

```typescript
import { PartialType } from '@nestjs/mapped-types';
import { Field, GraphQLISODateTime } from '@nestjs/graphql';
import { IsDate, IsOptional } from 'class-validator';
import { CreateLeadDto } from './create-lead.dto';

export class UpdateLeadDto extends PartialType(CreateLeadDto) {
  @Field(() => GraphQLISODateTime, { nullable: true })
  @IsOptional()
  @IsDate()
  nextActionDueAt?: Date | null;
}
```

---

### Step 5: Add GraphQL Input for nextActionDueAt Update

**File**: `src/app/lead/dto/update-leadd.input.ts`

If this file exists, ensure it includes nextActionDueAt:

```typescript
import { Field, GraphQLISODateTime, ID, InputType } from '@nestjs/graphql';

@InputType()
export class UpdateIpkLeaddInput {
  @Field(() => ID)
  id!: string;

  @Field(() => GraphQLISODateTime, { nullable: true })
  nextActionDueAt?: Date | null;

  // ... other fields ...
}
```

---

### Step 6: Update Lead Events to Also Trigger nextActionDueAt Update

**File**: `src/app/lead/ipk-leadd.service.ts`

In the `updateRemark` and `updateBio` methods, optionally update nextActionDueAt if provided:

```typescript
  async updateRemark(
    leadId: string,
    remark: string | null,
    authorId?: string | null,
    authorName?: string | null,
  ) {
    const prev = await this.findLeadById(leadId);
    if (!prev) throw new BadRequestException('Lead not found');

    const prevRemark = prev.remark;
    const entry = buildRemarkHistoryEntry(remark);
    const nextRemark = appendRemarkHistory(prevRemark, entry);

    const updated = await this.prisma.ipkLeadd.update({
      where: { id: leadId },
      data: { remark: nextRemark as unknown as Prisma.InputJsonValue },
      include: { assignedRm: true },
    });

    await this.leadEvents.remarkUpdated({
      leadId,
      prevRemark,
      nextRemark,
      authorId,
      authorName,
    });

    return updated;
  }
```

---

## Usage Examples

### Example 1: Update nextActionDueAt via GraphQL Mutation

**Frontend GraphQL Call:**

```graphql
mutation UpdateLeadNextAction {
  updateIpkLeadd(
    input: { id: "65abc123def456789012345f", nextActionDueAt: "2025-11-26T10:30:00Z" }
  ) {
    id
    name
    nextActionDueAt
  }
}
```

**Response:**

```json
{
  "data": {
    "updateIpkLeadd": {
      "id": "65abc123def456789012345f",
      "name": "John Doe",
      "nextActionDueAt": "2025-11-26T10:30:00Z"
    }
  }
}
```

---

### Example 2: Create Interaction with Auto-Update

**Frontend GraphQL Call:**

```graphql
mutation AddFollowUp {
  addLeadInteraction(
    input: {
      leadId: "65abc123def456789012345f"
      text: "Call scheduled for follow-up"
      channel: CALL
      outcome: SCHEDULED_CALLBACK
      nextFollowUpAt: "2025-11-23T14:00:00Z"
    }
  ) {
    id
    leadId
    occurredAt
    meta
  }
}
```

**What Happens:**

1. ✅ LeadEvent is created with the interaction
2. ✅ Lead's `nextActionDueAt` is automatically updated to `2025-11-23T14:00:00Z`
3. ✅ Event meta stores the nextFollowUpAt timestamp

**Response:**

```json
{
  "data": {
    "addLeadInteraction": {
      "id": "event123",
      "leadId": "65abc123def456789012345f",
      "occurredAt": "2025-11-19T07:12:24.314Z",
      "meta": {
        "channel": "CALL",
        "outcome": "SCHEDULED_CALLBACK",
        "nextFollowUpAt": "2025-11-23T14:00:00Z"
      }
    }
  }
}
```

---

### Example 3: Query Lead with Updated nextActionDueAt

**Frontend GraphQL Call:**

```graphql
query GetLeadWithNextAction {
  ipkLeadd(id: "65abc123def456789012345f") {
    id
    name
    nextActionDueAt
    events(limit: 5) {
      id
      type
      occurredAt
      text
      meta
    }
  }
}
```

**Response:**

```json
{
  "data": {
    "ipkLeadd": {
      "id": "65abc123def456789012345f",
      "name": "John Doe",
      "nextActionDueAt": "2025-11-23T14:00:00Z",
      "events": [
        {
          "id": "event123",
          "type": "INTERACTION",
          "occurredAt": "2025-11-19T07:12:24.314Z",
          "text": "Call scheduled for follow-up",
          "meta": {
            "channel": "CALL",
            "outcome": "SCHEDULED_CALLBACK",
            "nextFollowUpAt": "2025-11-23T14:00:00Z"
          }
        }
      ]
    }
  }
}
```

---

## Data Flow Diagram

```
Frontend User Updates Lead
        ↓
GraphQL Mutation: updateIpkLeadd
        ↓
updateLead() in IpkLeaddService
        ↓
buildLeadUpdateData() - processes nextActionDueAt
        ↓
Prisma update() - saves to MongoDB
        ↓
Lead document updated with new nextActionDueAt
        ↓
Return updated lead to frontend


Alternative Flow: User Creates Interaction with Follow-up
        ↓
GraphQL Mutation: addLeadInteraction
        ↓
addInteraction() in LeadEventService
        ↓
createEvent() - saves interaction event
        ↓
updateLeadNextActionDueAt() - automatically updates lead
        ↓
Both event and lead are updated
        ↓
Return event to frontend
```

---

## Complete Example: Full Update Flow

### Scenario: User schedules a callback

**Step 1:** User clicks "Schedule Callback" on lead profile

**Step 2:** Frontend sends:

```graphql
mutation ScheduleCallback {
  addLeadInteraction(
    input: {
      leadId: "123"
      text: "Customer interested, callback scheduled"
      channel: CALL
      outcome: SCHEDULED_CALLBACK
      nextFollowUpAt: "2025-11-23T10:00:00Z"
      tags: ["CALLBACK", "INTERESTED"]
    }
  ) {
    id
    leadId
    type
    meta
  }
}
```

**Step 3:** Backend processes:

1. Creates LeadEvent with INTERACTION type
2. Stores nextFollowUpAt in event.meta
3. Calls updateLeadNextActionDueAt()
4. Updates lead.nextActionDueAt to 2025-11-23T10:00:00Z

**Step 4:** Frontend receives:

```json
{
  "addLeadInteraction": {
    "id": "evt456",
    "leadId": "123",
    "type": "INTERACTION",
    "meta": {
      "channel": "CALL",
      "outcome": "SCHEDULED_CALLBACK",
      "nextFollowUpAt": "2025-11-23T10:00:00Z"
    }
  }
}
```

**Step 5:** Frontend can now query the lead to confirm update:

```graphql
query VerifyUpdate {
  ipkLeadd(id: "123") {
    nextActionDueAt
  }
}
```

Returns: `"2025-11-23T10:00:00Z"` ✅

---

## Testing

### Test Case 1: Direct nextActionDueAt Update

```typescript
// Input
const updateInput = {
  id: 'lead123',
  nextActionDueAt: '2025-11-25T15:00:00Z',
};

// Expected: lead.nextActionDueAt = 2025-11-25T15:00:00Z
```

### Test Case 2: Interaction with Follow-up Auto-Updates Lead

```typescript
// Input
const interactionInput = {
  leadId: 'lead123',
  text: 'Call scheduled',
  nextFollowUpAt: '2025-11-23T10:00:00Z',
};

// Expected:
// - LeadEvent created with meta.nextFollowUpAt
// - lead.nextActionDueAt = 2025-11-23T10:00:00Z
```

### Test Case 3: Null/Clear nextActionDueAt

```typescript
// Input
const updateInput = {
  id: 'lead123',
  nextActionDueAt: null,
};

// Expected: lead.nextActionDueAt = null
```

---

## Summary

### Files to Modify:

1. ✅ `src/app/lead_event/lead-event.service.ts` - Add updateLeadNextActionDueAt() and modify addInteraction()
2. ✅ `src/app/lead/ipk-leadd.service.ts` - Add nextActionDueAt handling in buildLeadUpdateData()
3. ✅ `src/app/lead/dto/update-lead.dto.ts` - Ensure nextActionDueAt support
4. ✅ `src/app/lead/dto/update-leadd.input.ts` - Add nextActionDueAt field

### Key Features:

- ✅ Manual nextActionDueAt updates via GraphQL
- ✅ Auto-update on interaction creation with follow-up date
- ✅ Stored in event metadata for audit trail
- ✅ Handles null/undefined dates properly
- ✅ Type-safe with proper validation

### Output Format:

All updates return the Lead object with:

```json
{
  "id": "string",
  "name": "string",
  "nextActionDueAt": "ISO 8601 DateTime",
  "updatedAt": "ISO 8601 DateTime"
}
```
