---
name: tech/aws/storage
description: AWS storage — S3 object storage, EBS block storage, EFS file system, Glacier archival.
requires:
  - tech/aws
improves:
  - tech/aws
metadata:
  author: 2nth.ai
  version: "1.0.0"
  maturity: stub
---

# AWS Storage

> **Stub** — full skill pending. Core patterns documented below.

## Services

| Service | Type | Use case |
|---------|------|---------|
| **S3** | Object | Files, backups, static assets, data lake staging, Lambda deployment packages |
| **EBS** | Block | EC2 root volumes, databases requiring low-latency block I/O |
| **EFS** | File (NFS) | Shared file system across multiple EC2/ECS tasks |
| **Glacier / S3 Glacier** | Archive | Long-term retention, compliance archival, low-cost cold storage |

## S3 essentials (most common)

```bash
# Create bucket in af-south-1
aws s3api create-bucket \
  --bucket my-bucket-name \
  --region af-south-1 \
  --create-bucket-configuration LocationConstraint=af-south-1

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket my-bucket-name \
  --versioning-configuration Status=Enabled

# Block all public access (default for new buckets — confirm explicitly)
aws s3api put-public-access-block \
  --bucket my-bucket-name \
  --public-access-block-configuration \
    BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true

# Upload file
aws s3 cp ./file.txt s3://my-bucket-name/path/file.txt

# Generate presigned URL (15-minute expiry)
aws s3 presign s3://my-bucket-name/path/file.txt --expires-in 900
```

## POPIA note

Store personal data only in af-south-1 buckets. Add a bucket policy condition denying replication outside af-south-1 if required by your data residency policy.
