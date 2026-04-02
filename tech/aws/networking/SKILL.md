---
name: tech/aws/networking
description: AWS networking — VPC design, Route 53, CloudFront CDN, ALB/NLB load balancers, VPC endpoints.
requires:
  - tech/aws
improves:
  - tech/aws
metadata:
  author: 2nth.ai
  version: "1.0.0"
  maturity: stub
---

# AWS Networking

> **Stub** — full skill pending. Security group and VPC security patterns are in `tech/aws/security`.

## Services

| Service | Purpose |
|---------|---------|
| **VPC** | Isolated network; subnets, route tables, internet gateway, NAT gateway |
| **ALB** | Layer 7 load balancer; path-based routing, SSL termination, target groups |
| **NLB** | Layer 4 load balancer; ultra-low latency, static IP, TCP/UDP |
| **Route 53** | DNS management, health checks, weighted routing, latency routing |
| **CloudFront** | Global CDN; caches S3, ALB, API Gateway origins |
| **VPC Endpoints** | Private connectivity to S3/DynamoDB without internet gateway |
| **PrivateLink** | Private connectivity to other AWS services or SaaS |

## Standard VPC layout (3-tier)

```
VPC: 10.0.0.0/16
  ├── Public subnet A  10.0.1.0/24  (ALB, NAT Gateway)
  ├── Public subnet B  10.0.2.0/24  (ALB multi-AZ)
  ├── Private subnet A 10.0.11.0/24 (Lambda, ECS tasks, EC2)
  ├── Private subnet B 10.0.12.0/24 (multi-AZ)
  ├── Data subnet A    10.0.21.0/24 (RDS, ElastiCache)
  └── Data subnet B    10.0.22.0/24 (multi-AZ)
```

Private subnets reach internet via NAT Gateway in the public subnet.
Data subnets have no internet route — accessible only from private subnets.
