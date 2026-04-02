---
name: tech/aws/database
description: AWS managed databases — RDS (PostgreSQL/MySQL), DynamoDB, Aurora, ElastiCache (Redis).
requires:
  - tech/aws
improves:
  - tech/aws
metadata:
  author: 2nth.ai
  version: "1.0.0"
  maturity: stub
---

# AWS Database

> **Stub** — full skill pending. Core patterns documented below.

## Services

| Service | Type | Use case |
|---------|------|---------|
| **RDS PostgreSQL** | Relational | General purpose; preferred over MySQL for new projects |
| **RDS MySQL** | Relational | Required for Frappe/ERPNext |
| **Aurora Serverless v2** | Relational | Auto-scales; good for variable load; PostgreSQL-compatible |
| **DynamoDB** | NoSQL key-value | High-throughput event storage, session store, leaderboards |
| **ElastiCache Redis** | In-memory | Session cache, queue, rate limiting, pub/sub |

## RDS essentials

```bash
# Create RDS PostgreSQL instance
aws rds create-db-instance \
  --db-instance-identifier mydb \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version 16.2 \
  --master-username admin \
  --master-user-password $(aws secretsmanager get-secret-value --secret-id db-password --query SecretString --output text) \
  --allocated-storage 20 \
  --vpc-security-group-ids sg-xxxxxxxx \
  --db-subnet-group-name my-subnet-group \
  --backup-retention-period 7 \
  --no-publicly-accessible \
  --region af-south-1
```

## Connection from Lambda/ECS

Use `AWS Secrets Manager` to store DB credentials. Retrieve in application code — never hardcode.

For Lambda with RDS: consider **RDS Proxy** to pool connections (Lambda can exhaust DB connections under load — RDS Proxy prevents this).
