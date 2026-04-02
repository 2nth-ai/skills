---
name: tech/aws
description: |
  Amazon Web Services (AWS) platform skills. Use skills in this domain when:
  (1) deploying compute workloads — Lambda serverless functions, ECS Fargate containers, EC2 virtual machines,
  (2) securing AWS infrastructure — IAM least-privilege roles, VPC security groups, KMS, Secrets Manager,
  (3) storing data — S3 object storage, RDS managed databases, DynamoDB, ElastiCache,
  (4) building event-driven architectures — SQS, SNS, EventBridge, Kinesis,
  (5) running AI/ML workloads — Bedrock (Claude, Llama), SageMaker, Rekognition,
  (6) building hybrid Cloudflare + AWS architectures — Cloudflare at the edge, AWS for compute-heavy or stateful workloads.
license: MIT
homepage: https://skills.2nth.ai/tech/aws
repository: https://github.com/2nth-ai/skills
improves:
  - tech
metadata:
  author: 2nth.ai
  version: "1.0.0"
  categories: "AWS, Lambda, EC2, ECS, IAM, VPC, S3, RDS, DynamoDB, Bedrock, SageMaker"
allowed-tools: Bash(aws:*) Bash(cdk:*) Read Write Edit Glob Grep
---

# Amazon Web Services (AWS)

AWS is the world's largest cloud provider. In the 2nth.ai stack, AWS fills the role GCP fills for compute-heavy or stateful workloads that don't suit the Cloudflare edge model — containerised applications, relational databases at scale, AI model inference via Bedrock, and enterprise integrations requiring deep AWS ecosystem connectivity.

The pattern is: **Cloudflare at the edge → AWS for the heavy lift**.

## Sub-skills

| Path | Focus | Status |
|------|-------|--------|
| `tech/aws/compute` | Lambda, EC2, ECS Fargate, API Gateway, Auto Scaling | ✓ production |
| `tech/aws/security` | IAM, VPC security groups, KMS, Secrets Manager, GuardDuty | ✓ production |
| `tech/aws/storage` | S3, EBS, EFS, Glacier | stub |
| `tech/aws/database` | RDS, DynamoDB, ElastiCache, Aurora | stub |
| `tech/aws/networking` | VPC, Route 53, CloudFront, ALB/NLB | stub |
| `tech/aws/messaging` | SQS, SNS, EventBridge, Kinesis | stub |
| `tech/aws/ai` | Bedrock (Claude), SageMaker, Rekognition, Comprehend | stub |

## Authentication model

AWS uses **IAM** (Identity and Access Management) for all access control. There are no separate OAuth flows for AWS services — everything goes through IAM credentials.

### Credential types

| Type | When to use | How |
|------|------------|-----|
| **IAM user + access key** | Local dev, CI/CD pipelines | `aws configure` or environment variables |
| **IAM role** | EC2, Lambda, ECS, any AWS compute | Assigned to resource — no key management required |
| **Assume role** | Cross-account, time-limited elevated access | `aws sts assume-role` → temporary credentials |
| **SSO / IAM Identity Center** | Human developers in organisations | `aws configure sso` |
| **Instance profile** | EC2 instances | Automatic — role attached to instance |

**Golden rule**: Never use access key + secret in application code running on AWS. Always use IAM roles attached to the compute resource (Lambda execution role, ECS task role, EC2 instance profile).

### Environment variables (for local dev / CI)

```bash
export AWS_ACCESS_KEY_ID=AKIA...
export AWS_SECRET_ACCESS_KEY=...
export AWS_DEFAULT_REGION=af-south-1
```

### AWS CLI setup

```bash
# Configure named profile
aws configure --profile myproject
# AWS Access Key ID: AKIA...
# AWS Secret Access Key: ...
# Default region name: af-south-1
# Default output format: json

# Use profile
aws s3 ls --profile myproject

# Set default profile in shell
export AWS_PROFILE=myproject
```

### Assume role (cross-account or elevated)

```bash
CREDS=$(aws sts assume-role \
  --role-arn arn:aws:iam::123456789012:role/DeployRole \
  --role-session-name deploy-session \
  --query 'Credentials.[AccessKeyId,SecretAccessKey,SessionToken]' \
  --output text)

export AWS_ACCESS_KEY_ID=$(echo $CREDS | awk '{print $1}')
export AWS_SECRET_ACCESS_KEY=$(echo $CREDS | awk '{print $2}')
export AWS_SESSION_TOKEN=$(echo $CREDS | awk '{print $3}')
```

## AWS Regions

Prefer **af-south-1 (Cape Town)** for SA-based clients. Meets POPIA data residency requirements when no SA-specific regulation mandates local hosting.

| Region | Code | Notes |
|--------|------|-------|
| Cape Town | `af-south-1` | SA primary; not all services available |
| Ireland | `eu-west-1` | Fallback for services not in af-south-1 |
| Frankfurt | `eu-central-1` | GDPR-aligned EU fallback |
| Virginia | `us-east-1` | Most services available; not for SA personal data |

```bash
# Check which services are available in af-south-1
aws ec2 describe-availability-zones --region af-south-1

# List Lambda available runtimes in af-south-1
aws lambda list-layer-versions --region af-south-1 --compatible-runtime nodejs20.x
```

**af-south-1 gaps** (as of 2025): Some Bedrock models, some SageMaker features, AWS Batch, and certain managed services are not yet available in Cape Town. For these, use eu-west-1 with a documented transfer basis for POPIA purposes.

## Cloudflare + AWS hybrid pattern

```
User request
    → Cloudflare Worker (edge routing, auth, caching)
         → AWS API Gateway + Lambda (business logic, heavy compute)
              → RDS / DynamoDB (persistence)
              → S3 (file storage)
              → Bedrock (AI inference)
```

Cloudflare handles: TLS termination, WAF, DDoS, global routing, caching, edge auth.
AWS handles: stateful compute, managed databases, AI model inference, legacy integration.

See `tech/aws/compute` for the SigV4 signing pattern to call AWS services from Cloudflare Workers without the AWS SDK.
