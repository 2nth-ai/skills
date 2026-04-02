---
name: tech/aws/security
description: |
  AWS security skill. Use when: (1) designing IAM policies — least-privilege roles, resource-based policies,
  (2) managing VPC security — security groups, NACLs, private subnets, VPC endpoints,
  (3) handling secrets — Secrets Manager, Parameter Store, KMS encryption,
  (4) auditing and compliance — CloudTrail, Config, GuardDuty, Security Hub,
  (5) securing Lambda and ECS workloads — execution roles, task roles, no hardcoded credentials.
license: MIT
compatibility: AWS CLI v2, CDK v2, SDK v3 (TypeScript/Python), Terraform
homepage: https://skills.2nth.ai/tech/aws/security
repository: https://github.com/2nth-ai/skills
requires:
  - tech/aws
improves:
  - tech/aws
  - tech
metadata:
  author: 2nth.ai
  version: "1.0.0"
  categories: "AWS, IAM, VPC, Security Groups, KMS, Secrets Manager, CloudTrail, GuardDuty"
allowed-tools: Bash(aws:*) Read Write Edit Glob Grep
---

# AWS Security

Security on AWS is not a feature you bolt on — it is a design constraint applied from the first resource. This skill covers IAM, VPC hardening, secrets management, encryption, and continuous audit for production workloads.

## 1. IAM Fundamentals

### Principal types

| Principal | Description |
|-----------|-------------|
| **IAM User** | Long-lived human identity. Avoid in production; prefer roles. |
| **IAM Role** | Assumed temporarily. Use for EC2, Lambda, ECS, cross-account. |
| **IAM Group** | Collection of users sharing policies. No group-to-group nesting. |
| **Service principal** | AWS service (e.g. `lambda.amazonaws.com`) acting on your behalf. |

### Policy types

| Type | Attached to | Notes |
|------|-------------|-------|
| **Identity-based** | User, role, group | Grant permissions to the principal |
| **Resource-based** | S3 bucket, KMS key, Lambda | Grant cross-account access without assume-role |
| **Permission boundary** | User or role | Hard ceiling — even if identity policy allows more, boundary wins |
| **SCP (Service Control Policy)** | AWS Organizations OU/account | Guardrails across the entire account; does not affect root user |
| **Session policy** | Passed during `sts:AssumeRole` | Inline restriction scoped to a single session |

### Policy evaluation logic

```
1. Explicit DENY anywhere → denied (SCPs, resource-based, identity-based)
2. SCP allows the action? No → denied
3. Resource-based policy allows (same account)? → allowed without identity policy needed
4. Identity-based policy + permission boundary BOTH allow? → allowed
5. Implicit deny (nothing allows) → denied
```

The golden rule: **an explicit deny always wins**, no matter how many allows exist elsewhere.

### ARN format

```
arn:partition:service:region:account-id:resource-type/resource-id

# Examples
arn:aws:iam::123456789012:role/my-lambda-role
arn:aws:s3:::my-bucket                          # S3 has no region or account in ARN
arn:aws:dynamodb:af-south-1:123456789012:table/Orders
arn:aws:kms:af-south-1:123456789012:key/mrk-abc123
```

### JSON policy structure

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ReadOrdersTable",
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:Query",
        "dynamodb:BatchGetItem"
      ],
      "Resource": "arn:aws:dynamodb:af-south-1:123456789012:table/Orders",
      "Condition": {
        "StringEquals": {
          "aws:RequestedRegion": "af-south-1"
        }
      }
    }
  ]
}
```

Always include `"Version": "2012-10-17"` — this is a literal string, not a date to update.

---

## 2. Least-Privilege IAM Patterns

### Lambda execution role

A Lambda function only needs what it explicitly uses. Never attach `AdministratorAccess` or even `PowerUserAccess`.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "Logs",
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:af-south-1:123456789012:log-group:/aws/lambda/my-function:*"
    },
    {
      "Sid": "S3ReadInput",
      "Effect": "Allow",
      "Action": ["s3:GetObject"],
      "Resource": "arn:aws:s3:::my-input-bucket/*"
    },
    {
      "Sid": "DynamoWrite",
      "Effect": "Allow",
      "Action": ["dynamodb:PutItem", "dynamodb:UpdateItem"],
      "Resource": "arn:aws:dynamodb:af-south-1:123456789012:table/Orders"
    }
  ]
}
```

Trust policy (who can assume this role):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": { "Service": "lambda.amazonaws.com" },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

```bash
# Create the role with trust policy
aws iam create-role \
  --role-name my-lambda-role \
  --assume-role-policy-document file://trust-policy.json

# Create and attach the permission policy
aws iam put-role-policy \
  --role-name my-lambda-role \
  --policy-name LambdaPermissions \
  --policy-document file://lambda-policy.json
```

### ECS task role vs execution role — critical distinction

This is the most commonly confused pattern in ECS security:

| Role | Purpose | Who uses it |
|------|---------|-------------|
| **Task execution role** | Lets ECS pull images from ECR and write logs to CloudWatch | The ECS agent (infrastructure layer) |
| **Task role** | Permissions your application code uses at runtime (S3, DynamoDB, etc.) | Your container process |

Never conflate them. If your app needs to read from S3, that permission goes on the **task role**, not the execution role.

```bash
# Execution role — needs ecr:GetAuthorizationToken, logs:CreateLogStream, etc.
aws iam attach-role-policy \
  --role-name ecsTaskExecutionRole \
  --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy

# Task role — your app permissions (example: read from S3)
aws iam put-role-policy \
  --role-name my-ecs-task-role \
  --policy-name AppPermissions \
  --policy-document file://app-policy.json
```

### Cross-account assume-role pattern

Account A (source) assumes a role in Account B (target).

**Account B — the role being assumed (trust policy):**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::ACCOUNT_A_ID:role/source-role"
      },
      "Action": "sts:AssumeRole",
      "Condition": {
        "StringEquals": {
          "aws:RequestedRegion": "af-south-1"
        },
        "StringLike": {
          "aws:SourceVpc": "vpc-0abc123"
        }
      }
    }
  ]
}
```

**Account A — permission to call assume-role:**

```json
{
  "Effect": "Allow",
  "Action": "sts:AssumeRole",
  "Resource": "arn:aws:iam::ACCOUNT_B_ID:role/target-role"
}
```

```bash
# Assume the role and export temporary credentials
CREDS=$(aws sts assume-role \
  --role-arn arn:aws:iam::ACCOUNT_B_ID:role/target-role \
  --role-session-name deploy-session \
  --query 'Credentials' --output json)

export AWS_ACCESS_KEY_ID=$(echo $CREDS | jq -r .AccessKeyId)
export AWS_SECRET_ACCESS_KEY=$(echo $CREDS | jq -r .SecretAccessKey)
export AWS_SESSION_TOKEN=$(echo $CREDS | jq -r .SessionToken)
```

### Useful condition keys

| Key | Use case |
|-----|---------|
| `aws:RequestedRegion` | Restrict actions to specific regions |
| `aws:SourceVpc` | Restrict S3 or API access to requests from a specific VPC |
| `aws:SourceIp` | IP allowlist (be careful with NAT gateways — use CIDR) |
| `aws:CalledVia` | Ensure action was invoked by a trusted AWS service, not directly |
| `aws:MultiFactorAuthPresent` | Require MFA for sensitive IAM/billing actions |

---

## 3. VPC Security

### Security groups vs NACLs

| Feature | Security Groups | NACLs |
|---------|----------------|-------|
| Level | Instance / ENI | Subnet |
| State | **Stateful** — return traffic auto-allowed | **Stateless** — must allow inbound AND outbound explicitly |
| Rules | Allow only | Allow + Deny |
| Evaluation | All rules evaluated | Rules evaluated in order (lowest number first) |
| Default | Deny all inbound, allow all outbound | Allow all (default VPC NACL) |

Security groups are your primary tool. NACLs are a coarse secondary layer — use them to block known bad CIDR ranges at subnet level.

### Common ports reference

| Port | Protocol | Service |
|------|----------|---------|
| 22 | TCP | SSH — restrict to bastion SG or VPN CIDR only |
| 80 / 443 | TCP | HTTP / HTTPS — allow from ALB SG or `0.0.0.0/0` |
| 5432 | TCP | PostgreSQL — allow from app tier SG only |
| 3306 | TCP | MySQL — allow from app tier SG only |
| 6379 | TCP | Redis (ElastiCache) — allow from app tier SG only |
| 2049 | TCP | NFS (EFS) — allow from ECS/EC2 SG only |

### Reference-by-security-group pattern

Never use IP ranges to allow traffic between tiers. Reference security groups instead — it survives IP changes and is semantically clear.

```bash
# Create security groups
aws ec2 create-security-group \
  --group-name alb-sg \
  --description "ALB inbound from internet" \
  --vpc-id vpc-0abc123

aws ec2 create-security-group \
  --group-name app-sg \
  --description "App tier — only from ALB" \
  --vpc-id vpc-0abc123

aws ec2 create-security-group \
  --group-name db-sg \
  --description "DB tier — only from app tier" \
  --vpc-id vpc-0abc123

# Allow HTTPS into ALB from internet
aws ec2 authorize-security-group-ingress \
  --group-id sg-alb-id \
  --protocol tcp --port 443 --cidr 0.0.0.0/0

# Allow app tier only from ALB SG (not by IP)
aws ec2 authorize-security-group-ingress \
  --group-id sg-app-id \
  --protocol tcp --port 8080 \
  --source-group sg-alb-id

# Allow DB only from app tier SG
aws ec2 authorize-security-group-ingress \
  --group-id sg-db-id \
  --protocol tcp --port 5432 \
  --source-group sg-app-id
```

### Private subnet + NAT gateway pattern

```
Internet
    │
[IGW]
    │
[Public Subnet]  ← ALB, NAT Gateway, Bastion
    │
[Private Subnet] ← Lambda, ECS Tasks, RDS, ElastiCache
    │ (outbound only via NAT GW)
[NAT Gateway]
```

Private subnet resources have no public IP and are unreachable from the internet. They reach the internet (for package updates, external APIs) via NAT Gateway — which is public-facing but only allows outbound-initiated connections.

### VPC endpoints — avoid internet traffic for AWS services

Without endpoints, traffic from your Lambda/ECS to S3 or DynamoDB exits to the internet (even through a NAT Gateway). VPC endpoints keep traffic on the AWS backbone.

```bash
# Gateway endpoint for S3 (free)
aws ec2 create-vpc-endpoint \
  --vpc-id vpc-0abc123 \
  --service-name com.amazonaws.af-south-1.s3 \
  --vpc-endpoint-type Gateway \
  --route-table-ids rtb-0abc123

# Gateway endpoint for DynamoDB (free)
aws ec2 create-vpc-endpoint \
  --vpc-id vpc-0abc123 \
  --service-name com.amazonaws.af-south-1.dynamodb \
  --vpc-endpoint-type Gateway \
  --route-table-ids rtb-0abc123

# Interface endpoint for Secrets Manager (costs ~$7.50/month/AZ)
aws ec2 create-vpc-endpoint \
  --vpc-id vpc-0abc123 \
  --service-name com.amazonaws.af-south-1.secretsmanager \
  --vpc-endpoint-type Interface \
  --subnet-ids subnet-private-1 subnet-private-2 \
  --security-group-ids sg-endpoint-id \
  --private-dns-enabled
```

Gateway endpoints (S3, DynamoDB) are free and always worth enabling. Interface endpoints cost per AZ per hour — evaluate based on traffic volume and compliance requirements.

---

## 4. Secrets Manager

Never store secrets in environment variables, code, or configuration files. Use Secrets Manager for anything that rotates or is high-value (DB passwords, API keys, OAuth tokens).

```bash
# Create a secret
aws secretsmanager create-secret \
  --name prod/myapp/db-password \
  --description "RDS master password" \
  --secret-string '{"username":"admin","password":"s3cr3t!"}' \
  --kms-key-id arn:aws:kms:af-south-1:123456789012:key/mrk-abc123

# Enable automatic rotation (requires a Lambda rotation function)
aws secretsmanager rotate-secret \
  --secret-id prod/myapp/db-password \
  --rotation-lambda-arn arn:aws:lambda:af-south-1:123456789012:function:SecretsRotator \
  --rotation-rules AutomaticallyAfterDays=30

# Retrieve (CLI)
aws secretsmanager get-secret-value \
  --secret-id prod/myapp/db-password \
  --query SecretString --output text
```

### Retrieval in Lambda with caching (TypeScript)

Calling Secrets Manager on every Lambda invocation adds latency and cost. Cache in module scope — the Lambda execution environment is reused across warm invocations.

```typescript
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager';

const client = new SecretsManagerClient({ region: 'af-south-1' });

// Module-level cache — persists across warm invocations
let cachedSecret: { username: string; password: string } | null = null;
let cacheExpiry = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

async function getDbCredentials() {
  if (cachedSecret && Date.now() < cacheExpiry) {
    return cachedSecret;
  }

  const response = await client.send(
    new GetSecretValueCommand({ SecretId: 'prod/myapp/db-password' })
  );

  cachedSecret = JSON.parse(response.SecretString!);
  cacheExpiry = Date.now() + CACHE_TTL_MS;
  return cachedSecret!;
}

export const handler = async (event: unknown) => {
  const { username, password } = await getDbCredentials();
  // use credentials...
};
```

### Secrets Manager vs Parameter Store

| Feature | Secrets Manager | Parameter Store (SecureString) |
|---------|----------------|-------------------------------|
| Cost | $0.40/secret/month + $0.05/10k API calls | Free (standard), $0.05/10k advanced |
| Automatic rotation | Yes (built-in Lambda-based) | No (manual) |
| Versioning | Yes | Yes |
| Cross-account | Yes (resource-based policy) | No |
| Max size | 65 KB | 4 KB (standard), 8 KB (advanced) |
| **When to use** | DB passwords, OAuth tokens, anything that rotates | Config values, feature flags, ARNs, non-rotating secrets |

Use Secrets Manager for secrets that rotate or need cross-account access. Use Parameter Store SecureString for application configuration that happens to be sensitive but is static.

---

## 5. KMS

### CMK vs AWS-managed keys

| Type | Control | Key policy | Cost |
|------|---------|-----------|------|
| **AWS-managed** (e.g. `aws/s3`) | AWS rotates automatically | Cannot edit | Free |
| **Customer-managed (CMK)** | You control rotation, policy, grants | Full control | $1/key/month + $0.03/10k API calls |

Use CMKs when you need: audit of every encrypt/decrypt, cross-account access, key deletion control, or granular grants.

### Key policy

Every CMK has a key policy. Without a key policy statement allowing the account root, **no IAM policy can grant KMS access** — the key policy is the gatekeeper.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "EnableIAMPolicies",
      "Effect": "Allow",
      "Principal": { "AWS": "arn:aws:iam::123456789012:root" },
      "Action": "kms:*",
      "Resource": "*"
    },
    {
      "Sid": "AllowLambdaEncryptDecrypt",
      "Effect": "Allow",
      "Principal": { "AWS": "arn:aws:iam::123456789012:role/my-lambda-role" },
      "Action": ["kms:Decrypt", "kms:GenerateDataKey"],
      "Resource": "*"
    }
  ]
}
```

### Envelope encryption concept

KMS does not encrypt your data directly for large payloads. It uses envelope encryption:

```
1. Your app calls GenerateDataKey → KMS returns plaintext data key + encrypted data key
2. Your app encrypts data locally with the plaintext data key (AES-256)
3. Store encrypted data + encrypted data key together
4. To decrypt: call KMS Decrypt with the encrypted data key → get plaintext key → decrypt data locally
```

The AWS SDKs handle this automatically for S3, EBS, and Secrets Manager. You only need to implement it manually for custom encryption.

```bash
# Encrypt a small value directly (< 4KB)
aws kms encrypt \
  --key-id arn:aws:kms:af-south-1:123456789012:key/mrk-abc123 \
  --plaintext fileb://secret.txt \
  --output text --query CiphertextBlob | base64 --decode > secret.enc

# Decrypt
aws kms decrypt \
  --ciphertext-blob fileb://secret.enc \
  --output text --query Plaintext | base64 --decode

# Enable automatic key rotation (annually)
aws kms enable-key-rotation --key-id mrk-abc123
```

### KMS in practice

- **S3 SSE-KMS**: Add `--server-side-encryption aws:kms --ssekms-key-id KEY_ID` to `aws s3 cp` or set bucket default encryption
- **EBS**: Enable at volume creation — `aws ec2 create-volume --encrypted --kms-key-id KEY_ID`
- **Secrets Manager**: Pass `--kms-key-id` on `create-secret`; all secret versions encrypted with that CMK
- **RDS**: Set `--storage-encrypted --kms-key-id` at instance creation (cannot be enabled after the fact without snapshot restore)

---

## 6. CloudTrail

CloudTrail records every AWS API call — who did what, when, from where. It is the non-negotiable audit foundation.

```bash
# Create a trail covering all regions
aws cloudtrail create-trail \
  --name org-audit-trail \
  --s3-bucket-name my-cloudtrail-bucket \
  --is-multi-region-trail \
  --include-global-service-events \
  --enable-log-file-validation

# Start logging
aws cloudtrail start-logging --name org-audit-trail

# Send to CloudWatch Logs (for alerting)
aws cloudtrail update-trail \
  --name org-audit-trail \
  --cloud-watch-logs-log-group-arn arn:aws:logs:af-south-1:123456789012:log-group:CloudTrail \
  --cloud-watch-logs-role-arn arn:aws:iam::123456789012:role/CloudTrailToCloudWatch
```

### Example CloudTrail event structure

```json
{
  "eventVersion": "1.08",
  "userIdentity": {
    "type": "IAMUser",
    "principalId": "AIDAEXAMPLE",
    "arn": "arn:aws:iam::123456789012:user/alice",
    "accountId": "123456789012",
    "userName": "alice"
  },
  "eventTime": "2026-04-02T08:23:11Z",
  "eventSource": "iam.amazonaws.com",
  "eventName": "CreateRole",
  "awsRegion": "af-south-1",
  "sourceIPAddress": "197.x.x.x",
  "requestParameters": { "roleName": "new-admin-role" },
  "responseElements": { ... }
}
```

### Key events to alert on

Create CloudWatch Metric Filters on the CloudTrail log group for these events:

| Event | Why it matters |
|-------|---------------|
| `ConsoleLogin` where `userIdentity.type = Root` | Root login is always suspicious |
| `CreateUser`, `AttachUserPolicy`, `CreateAccessKey` | Unexpected IAM changes |
| `AuthorizeSecurityGroupIngress` | Security group opened — may expose services |
| `DeleteTrail`, `StopLogging`, `PutEventSelectors` | Audit evasion |
| `KMSDisableKey`, `KMSScheduleKeyDeletion` | Ransomware precursor |
| `PutBucketPolicy` with `"Principal": "*"` | Public S3 exposure |

```bash
# Example: alert on root login
aws logs put-metric-filter \
  --log-group-name CloudTrail \
  --filter-name RootLogin \
  --filter-pattern '{ $.userIdentity.type = "Root" && $.eventName = "ConsoleLogin" }' \
  --metric-transformations metricName=RootLoginCount,metricNamespace=Security,metricValue=1
```

---

## 7. GuardDuty and Security Hub

### GuardDuty

GuardDuty is a continuous threat detection service. It analyses CloudTrail, VPC Flow Logs, and DNS logs using ML models — you don't configure rules, just enable it.

```bash
# Enable GuardDuty
aws guardduty create-detector --enable --finding-publishing-frequency FIFTEEN_MINUTES

# Get detector ID
DETECTOR_ID=$(aws guardduty list-detectors --query 'DetectorIds[0]' --output text)

# List active findings
aws guardduty list-findings --detector-id $DETECTOR_ID \
  --finding-criteria '{"Criterion":{"service.archived":{"Eq":["false"]}}}'
```

**Finding categories:**

| Category | Example |
|----------|---------|
| CryptoCurrency | `CryptoCurrency:EC2/BitcoinTool.B` — instance mining crypto |
| UnauthorizedAccess | `UnauthorizedAccess:IAMUser/ConsoleLoginSuccess.B` — login from unusual location |
| Recon | `Recon:EC2/PortProbeUnprotectedPort` — port scanning your instance |
| Trojan | `Trojan:EC2/DNSDataExfiltration` — DNS-based data exfiltration |
| Persistence | `Persistence:IAMUser/AnomalousBehavior` — unusual IAM activity |

### EventBridge rule to forward findings to SNS

```bash
# Create SNS topic for security alerts
aws sns create-topic --name security-alerts
aws sns subscribe \
  --topic-arn arn:aws:sns:af-south-1:123456789012:security-alerts \
  --protocol email --notification-endpoint security@myorg.com

# EventBridge rule: high-severity GuardDuty findings → SNS
aws events put-rule \
  --name GuardDutyHighSeverity \
  --event-pattern '{
    "source": ["aws.guardduty"],
    "detail-type": ["GuardDuty Finding"],
    "detail": { "severity": [{ "numeric": [">=", 7] }] }
  }' \
  --state ENABLED

aws events put-targets \
  --rule GuardDutyHighSeverity \
  --targets '[{
    "Id": "SendToSNS",
    "Arn": "arn:aws:sns:af-south-1:123456789012:security-alerts"
  }]'
```

For Slack: use an SNS → Lambda → Slack webhook chain, or SNS → EventBridge → Lambda.

### Security Hub

Security Hub aggregates findings from GuardDuty, Macie, Inspector, IAM Access Analyzer, and AWS Config into a single dashboard with compliance scores.

```bash
# Enable Security Hub
aws securityhub enable-security-hub \
  --enable-default-standards

# Enable CIS AWS Foundations Benchmark
aws securityhub batch-enable-standards \
  --standards-subscription-requests \
    '[{"StandardsArn":"arn:aws:securityhub:af-south-1::standards/cis-aws-foundations-benchmark/v/1.4.0"}]'

# Enable AWS Foundational Security Best Practices
aws securityhub batch-enable-standards \
  --standards-subscription-requests \
    '[{"StandardsArn":"arn:aws:securityhub:af-south-1::standards/aws-foundational-security-best-practices/v/1.0.0"}]'

# List failed controls
aws securityhub get-findings \
  --filters '{"ComplianceStatus":[{"Value":"FAILED","Comparison":"EQUALS"}]}' \
  --query 'Findings[].{Title:Title,Severity:Severity.Label}' \
  --output table
```

---

## 8. Securing Lambda

### Absolute rules

- **Never hardcode credentials** — not in code, not in environment variables, not in layers. Use IAM role (execution role) or Secrets Manager.
- Grant the execution role only the actions the function actually calls.
- Treat Lambda environment variables as non-secret config only (they are visible to anyone with `lambda:GetFunctionConfiguration`).

### VPC placement tradeoffs

Placing Lambda in a VPC gives access to RDS, ElastiCache, and internal services — but adds a cold start penalty (ENI attachment, ~500ms–1s historically; reduced with Hyperplane ENIs since 2020 but still non-zero in some regions).

**Decision:** Use VPC placement when the function needs private network access (RDS, ElastiCache). For functions only calling AWS APIs or the internet, keep Lambda out of the VPC and use IAM + VPC endpoints instead.

```bash
# Deploy Lambda in a VPC
aws lambda update-function-configuration \
  --function-name my-function \
  --vpc-config SubnetIds=subnet-private-1,subnet-private-2,SecurityGroupIds=sg-lambda-id
```

### Function URL auth

```bash
# Public URL (no auth) — only use for webhooks with HMAC validation in code
aws lambda create-function-url-config \
  --function-name my-function \
  --auth-type NONE

# IAM-authenticated URL — caller must SigV4-sign the request
aws lambda create-function-url-config \
  --function-name my-function \
  --auth-type AWS_IAM
```

### Resource policy for cross-account invocation

```bash
# Allow account B to invoke this function
aws lambda add-permission \
  --function-name my-function \
  --statement-id CrossAccountInvoke \
  --action lambda:InvokeFunction \
  --principal arn:aws:iam::ACCOUNT_B_ID:role/invoker-role
```

---

## 9. Securing ECS / Fargate

### Role separation (see section 2 for detail)

```json
// Task definition excerpt
{
  "executionRoleArn": "arn:aws:iam::123456789012:role/ecsTaskExecutionRole",
  "taskRoleArn":      "arn:aws:iam::123456789012:role/my-app-task-role",
  ...
}
```

### Inject secrets from Secrets Manager — never pass as plain env vars

```json
{
  "containerDefinitions": [
    {
      "name": "app",
      "image": "123456789012.dkr.ecr.af-south-1.amazonaws.com/myapp:latest",
      "secrets": [
        {
          "name": "DB_PASSWORD",
          "valueFrom": "arn:aws:secretsmanager:af-south-1:123456789012:secret:prod/myapp/db-password:password::"
        }
      ],
      "environment": [
        { "name": "APP_ENV", "value": "production" }
      ]
    }
  ]
}
```

The ECS agent resolves the secret at launch time and injects it as an environment variable inside the container. The secret value is never visible in the task definition JSON stored in ECS.

### Dockerfile hardening

```dockerfile
FROM node:20-alpine

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app
COPY --chown=appuser:appgroup package*.json ./
RUN npm ci --omit=dev

COPY --chown=appuser:appgroup . .

# Switch to non-root before running
USER appuser

EXPOSE 8080
CMD ["node", "server.js"]
```

Enable read-only root filesystem in the task definition:

```json
{
  "readonlyRootFilesystem": true,
  "mountPoints": [
    { "containerPath": "/tmp", "sourceVolume": "tmp-volume" }
  ]
}
```

---

## 10. POPIA and AWS Data Residency (South Africa)

The Protection of Personal Information Act (POPIA) requires personal information of South African data subjects to be processed lawfully, and cross-border transfers require adequate protection or consent.

### af-south-1 (Cape Town) — primary region for SA data

```bash
# Default all new resources to af-south-1
aws configure set region af-south-1

# Verify S3 bucket is in Cape Town
aws s3api get-bucket-location --bucket my-sa-bucket
```

### S3 bucket policy blocking replication out of af-south-1

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "DenyNonCapeTownReplication",
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:ReplicateObject",
      "Resource": "arn:aws:s3:::my-sa-bucket/*",
      "Condition": {
        "StringNotEquals": {
          "s3:LocationConstraint": "af-south-1"
        }
      }
    }
  ]
}
```

### SCP to prevent data leaving the region

Apply at the Organizations OU level for SA-data accounts:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "DenyOutsideAfSouth1",
      "Effect": "Deny",
      "Action": [
        "s3:CreateBucket",
        "rds:CreateDBInstance",
        "dynamodb:CreateTable",
        "ec2:RunInstances"
      ],
      "Resource": "*",
      "Condition": {
        "StringNotEquals": {
          "aws:RequestedRegion": "af-south-1"
        }
      }
    }
  ]
}
```

### Services not yet in af-south-1

Some services are not available in af-south-1 as of early 2026 — notably portions of Bedrock, some Macie features, and certain Cognito advanced features. When you must use a service outside af-south-1 for a SA-data workload:

1. Conduct a POPIA cross-border transfer assessment
2. Ensure the destination country has adequate protection (EU is generally acceptable)
3. Document the necessity and implement access controls to minimise exposure
4. Prefer eu-west-1 (Ireland) or eu-central-1 (Frankfurt) over US regions for SA cross-border transfers

---

## 11. Gotchas

**IAM eventual consistency (up to 60 seconds)**
IAM changes propagate globally but not instantly. If a CI/CD pipeline creates a role and immediately uses it in the next step, it may fail with `AccessDenied`. Add a `sleep 10` after `create-role` or poll with retries in automation.

**Resource-based policy vs identity-based policy precedence**
For cross-account access, both the identity-based policy (in the caller's account) AND the resource-based policy (on the target resource) must allow the action. For same-account access, either one is sufficient — the resource-based policy alone can grant access without any identity-based policy.

**SCPs do not affect the root user**
An SCP with `"Effect": "Deny", "Action": "*"` applied to an account will restrict all IAM principals — but the root user of that account is immune. Protect root accounts with MFA, no access keys, and limit root use to billing and account recovery only.

**Security group changes are immediate; NACL changes are not**
Security group rule changes take effect immediately for new and existing connections (stateful). NACL changes affect new packets only — existing sessions may complete under old rules depending on connection state.

**Secrets Manager costs add up**
`$0.40/secret/month` — at 100 secrets, that is $40/month before API calls. For non-rotating static config, Parameter Store SecureString is free (standard tier, < 10k parameters). Audit and consolidate secrets regularly; delete unused ones.

**KMS key deletion is irreversible after waiting period**
`ScheduleKeyDeletion` has a mandatory waiting period of 7–30 days. Any data encrypted with that CMK becomes permanently unrecoverable once the key is deleted. Always verify no resources depend on a key before scheduling deletion.

**Lambda execution role is evaluated at invocation, not at deploy time**
You can deploy a Lambda with an overly permissive role and tests will pass. The role is only checked when the API call is actually made at runtime. Write integration tests that verify the function succeeds with its actual role, not with your developer credentials.

**S3 public block settings are account-level and bucket-level**
Even if a bucket policy allows public access, the S3 Block Public Access setting (account or bucket level) overrides it. Conversely, if Block Public Access is off, a permissive bucket policy or ACL can make objects public. Enable Block Public Access at the account level as a default.

```bash
# Enable account-level S3 Block Public Access
aws s3control put-public-access-block \
  --account-id 123456789012 \
  --public-access-block-configuration \
    BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true
```
