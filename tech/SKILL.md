---
name: tech
description: |
  Technology domain skills. Use skills in this domain when working with:
  (1) Cloudflare — Workers, Pages, D1, KV, R2, Vectorize, Workers AI,
  (2) Google Cloud (GCP) — Cloud Run, Cloud SQL, BigQuery, Vertex AI, Pub/Sub,
  (3) Google Workspace — Gmail API, Drive, Sheets, Calendar, Admin SDK,
  (4) Microsoft Azure AI — Azure OpenAI, AI Agent Service, Semantic Kernel, Copilot Studio, MCP,
  (5) Microsoft 365 — Graph API, Teams, Outlook, SharePoint, OneDrive via Entra ID,
  (6) AWS — Lambda, ECS Fargate, API Gateway, IAM, VPC, S3, RDS, DynamoDB, Bedrock,
  (7) Cisco — IOS/NX-OS networking, ASA/Firepower security, Meraki wireless, Webex collaboration, network automation,
  (8) Claude Code — setup, CLAUDE.md, skills integration, MCP servers,
  (9) MCP (Model Context Protocol) — building and consuming MCP servers,
  (10) infrastructure as code — Wrangler, Terraform, GCP, deployment pipelines.
license: MIT
homepage: https://skills.2nth.ai/tech
repository: https://github.com/2nth-ai/skills
metadata:
  author: 2nth.ai
  version: "1.0.0"
  categories: "Technology, Cloudflare, AWS, Lambda, ECS, IAM, Cisco, IOS, NX-OS, networking, Firepower, Meraki, Webex, CUCM, Netmiko, Google Cloud, GCP, Gmail, Workspace, Microsoft, Azure AI, Copilot, Slack, Discord, Meta, WhatsApp, Facebook, Messenger, Instagram, X, Twitter, Claude Code, Infrastructure"
---

# Technology Skills

Skills for AI agents working with the 2nth.ai technology stack — Cloudflare edge, Google Cloud, Google Workspace, AWS, Claude Code, and infrastructure.

## Subdomains

| Path | Focus |
|------|-------|
| `tech/cloudflare/` | Workers, Pages, D1, KV, R2, Workers AI, AI Gateway |
| `tech/google/` | Google platform — shared OAuth model, parent for Cloud + Workspace |
| `tech/google/cloud/` | GCP — Cloud Run, Cloud SQL, BigQuery, Vertex AI, Pub/Sub, Cloud Storage |
| `tech/google/workspace/` | Workspace APIs — Gmail, Drive, Sheets, Calendar, Admin SDK |
| `tech/google/workspace/gmail/` | Gmail API — read, send, label, Watch pipeline, AI automation |
| `tech/microsoft/` | Microsoft platform — Entra ID auth model, parent for Azure + M365 |
| `tech/microsoft/azure-ai/` | Azure OpenAI, AI Agent Service, Semantic Kernel, Copilot Studio, MCP |
| `tech/aws/` | AWS platform — IAM auth model, regions, Cloudflare + AWS hybrid pattern |
| `tech/aws/compute/` | Lambda, ECS Fargate, EC2, API Gateway, Auto Scaling — production depth |
| `tech/aws/security/` | IAM, VPC security groups, KMS, Secrets Manager, GuardDuty — production depth |
| `tech/aws/storage/` | S3, EBS, EFS, Glacier |
| `tech/aws/database/` | RDS, DynamoDB, ElastiCache, Aurora |
| `tech/aws/networking/` | VPC, Route 53, CloudFront, ALB/NLB |
| `tech/aws/messaging/` | SQS, SNS, EventBridge, Kinesis |
| `tech/aws/ai/` | Bedrock (Claude), SageMaker, Rekognition, Comprehend |
| `tech/cisco/` | Cisco platform — networking, security, wireless, collaboration, automation |
| `tech/cisco/networking/` | IOS/IOS-XE/NX-OS, VLANs, STP, OSPF, EIGRP, BGP, QoS |
| `tech/cisco/security/` | ASA, Firepower NGFW, Umbrella, ISE, AnyConnect VPN |
| `tech/cisco/wireless/` | Catalyst/Meraki Wi-Fi, WLC, access points, RF design |
| `tech/cisco/collaboration/` | Webex, CUCM, Unity Connection, UCCX contact centre |
| `tech/cisco/automation/` | Netmiko, NAPALM, Ansible, DNA Center, NSO, NETCONF/RESTCONF |
| `tech/slack/` | Slack bot, Events API, slash commands, Block Kit, AI agent surface |
| `tech/discord/` | Discord bot, Interactions Endpoint, Ed25519 verify, embeds, AI agent surface |
| `tech/meta/` | Meta Business — Graph API auth, WhatsApp, Messenger, Instagram, Conversions API |
| `tech/meta/whatsapp/` | WhatsApp Business Cloud API — messages, interactive, templates, 24h window |
| `tech/meta/instagram/` | Instagram Messaging API — DMs, story mentions, quick replies, 7-day window |
| `tech/x/` | X (Twitter) API v2 — mention polling, filtered stream, OAuth 2.0 PKCE, DMs |
| `tech/claude-code/` | Claude Code setup, CLAUDE.md patterns, skill injection |
| `tech/mcp/` | Model Context Protocol — building and consuming servers |
| `tech/iac/` | Infrastructure as code, Wrangler, deployment |

## Status

`tech/cloudflare`, `tech/claude-code`, `tech/google/*`, `tech/microsoft/*`, `tech/aws/compute`, `tech/aws/security`, `tech/slack`, `tech/discord`, `tech/meta/*`, and `tech/x` are production. `tech/aws/storage`, `tech/aws/database`, `tech/aws/networking`, `tech/aws/messaging`, `tech/aws/ai`, and all `tech/cisco/*` are stubs. Others pending.
