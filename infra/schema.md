# DynamoDB Schema — Feature Flag Service

## Table name
`feature-flags`

## Key design
| Attribute | Type   | Role          |
| --------- | ------ | ------------- |
| `PK`      | String | Partition key |
| `SK`      | String | Sort key      |

Single-table design — two entity types share one table, distinguished by their key patterns.

---

## Entity 1 — Flag

Stores each feature flag and its current state.

| Attribute   | Type    | Example value          | Notes                        |
| ----------- | ------- | ---------------------- | ---------------------------- |
| `PK`        | String  | `FLAG#dark-mode`       | Partition key                |
| `SK`        | String  | `#METADATA`            | Sort key (fixed suffix)      |
| `flagName`  | String  | `dark-mode`            | Human-readable name          |
| `enabled`   | Boolean | `true`                 | Current on/off state         |
| `createdAt` | String  | `2025-03-30T10:00:00Z` | ISO 8601 UTC                 |
| `updatedAt` | String  | `2025-04-01T08:30:00Z` | ISO 8601 UTC, updated on PUT |

### Example item (JSON)
```json
{
  "PK":        { "S": "FLAG#dark-mode" },
  "SK":        { "S": "#METADATA" },
  "flagName":  { "S": "dark-mode" },
  "enabled":   { "BOOL": true },
  "createdAt": { "S": "2025-03-30T10:00:00Z" },
  "updatedAt": { "S": "2025-04-01T08:30:00Z" }
}
```

---

## Entity 2 — Audit log entry

Every toggle (PUT) appends an audit entry under the same PK, so all history for a flag lives together.

| Attribute   | Type    | Example value                | Notes                           |
| ----------- | ------- | ---------------------------- | ------------------------------- |
| `PK`        | String  | `FLAG#dark-mode`             | Same PK as the flag             |
| `SK`        | String  | `AUDIT#2025-04-01T08:30:00Z` | Sort key — ISO timestamp prefix |
| `changedAt` | String  | `2025-04-01T08:30:00Z`       | ISO 8601 UTC                    |
| `newValue`  | Boolean | `true`                       | The value it was changed TO     |
| `source`    | String  | `admin-dashboard`            | Optional — who triggered it     |

### Example item (JSON)
```json
{
  "PK":        { "S": "FLAG#dark-mode" },
  "SK":        { "S": "AUDIT#2025-04-01T08:30:00Z" },
  "changedAt": { "S": "2025-04-01T08:30:00Z" },
  "newValue":  { "BOOL": true },
  "source":    { "S": "admin-dashboard" }
}
```

---

## Access patterns

| #   | Operation          | DynamoDB call                                                         |
| --- | ------------------ | --------------------------------------------------------------------- |
| 1   | List all flags     | `Scan` — filter `SK = #METADATA`                                      |
| 2   | Get one flag       | `GetItem` with `PK=FLAG#<name>`, `SK=#METADATA`                       |
| 3   | Create a flag      | `PutItem` with full flag item                                         |
| 4   | Toggle a flag      | `UpdateItem` — set `enabled`, `updatedAt`; then `PutItem` audit entry |
| 5   | Delete a flag      | `DeleteItem` with `PK=FLAG#<name>`, `SK=#METADATA`                    |
| 6   | Get flag audit log | `Query` with `PK=FLAG#<name>`, `SK begins_with AUDIT#`                |

---

