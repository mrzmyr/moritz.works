---

title: Agent Experience (AX)
excerpt: Checklist for making software for agents
slug: agent-experience
createdAt: 2026-04-19
updatedAt: 2026-04-19

---

- UX is for users
- DX is for developers
- AX is for agents

Here's a checklist I use whenever I build something for agents.

## Checklist

**Everything must be machine-readable**

MCP > API > OpenAPI > Markdown > HTML > [Computer Use](https://platform.claude.com/docs/en/agents-and-tools/tool-use/computer-use-tool)

**API Interfaces**

- Auto generated OpenAPI specs
- Auto generated MCPs (e.g. use [Mintlify](https://www.mintlify.com) or [Stainless](https://www.stainless.com))

**llms.txt**

- `/llms.txt` as curated markdown index of what matters ([example](https://nextjs.org/llms.txt))
- Support `Accept: text/markdown` (see [Cloudflare documentation](https://developers.cloudflare.com/fundamentals/reference/markdown-for-agents/))

**Actionable Errors**

- Explain what failed, why it failed, and what to do next (see [Evlog](https://www.evlog.dev))

```json
{
  "error": "token_expired",
  "status": 401,
  "message": "Token expired at 2026-04-19T09:41:00Z",
  "why": "The bearer token is past its expiry time.",
  "fix": "Refresh the session, then retry the original request with the new access token.",
  "link": "https://docs.example.com/auth#refresh",
  "next_action": "refresh_token",
  "refresh_url": "/auth/refresh"
}
```

Say "token expired at X, refresh at `/auth/refresh`" not "400 Bad Request".

**Idempotency Keys + Dry-Run Modes**

Make retries safe and prevent duplicate side effects:

```http
POST /v1/deployments?dry_run=true
Accept: application/json

{
  "dry_run": true,
  "idempotency_key": "dep_01JS5Y6M3Q4Y8A7ZK2N9P1R4XQ"
}
```

**Stable IDs + URIs**

- Make entities referenceable across turns
- Deployment, ticket, or doc should be named once and be retrieved by ID later

**Predictable Pagination**

- Use consistent cursor or offset semantics everywhere
- Do not make one endpoint page by number and another by opaque token unless there is a strong reason

**Explicit Examples + Edge Cases in Docs**

- Do not rely on implied conventions
- Show the happy path, the failure path, and the weird path

**Structured Input + Output (JSON/XML)**

- Prefer structured output over HTML when the caller is an agent
- Use JSON Schema, or Zod output so the contract is explicit all the way down

**Rate Limits**

- Return remaining budget and reset timing in response headers so the agent can self-regulate

Example:

```http
GET /v1/deployments
Accept: application/json

Retry-After: 120

{
  "error": "rate_limited",
  "message": "Too many requests",
  "retry_after_seconds": 120,
  "why": "Burst exceeded per API key",
  "fix": "Back off until Retry-After, then retry with exponential jitter"
}
```

**Auth Flows**

- Service accounts, scoped tokens
- Prevent CAPTCHA or SMS-only dead ends
- Test accounts on test environments