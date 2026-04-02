---
name: tech/aws/messaging
description: AWS messaging — SQS queues, SNS topics, EventBridge event bus, Kinesis data streams.
requires:
  - tech/aws
improves:
  - tech/aws
metadata:
  author: 2nth.ai
  version: "1.0.0"
  maturity: stub
---

# AWS Messaging

> **Stub** — full skill pending. Core patterns documented below.

## Services

| Service | Pattern | Use case |
|---------|---------|---------|
| **SQS** | Queue (pull) | Decoupled async processing; Lambda trigger; dead-letter queue |
| **SNS** | Topic (push/fan-out) | Broadcast to multiple subscribers; email, SMS, SQS, Lambda |
| **EventBridge** | Event bus | AWS service events + custom events; rules → targets |
| **Kinesis** | Stream | High-throughput real-time data; analytics pipelines; ordered records |

## SQS + Lambda pattern

```bash
# Create standard queue
aws sqs create-queue --queue-name my-queue --region af-south-1

# Create DLQ
aws sqs create-queue --queue-name my-queue-dlq --region af-south-1

# Wire Lambda trigger (from Lambda console or CDK)
aws lambda create-event-source-mapping \
  --function-name my-function \
  --event-source-arn arn:aws:sqs:af-south-1:123456789012:my-queue \
  --batch-size 10 \
  --maximum-batching-window-in-seconds 5
```

## EventBridge rule

```bash
# Route GuardDuty finding to Lambda
aws events put-rule \
  --name guardduty-to-lambda \
  --event-pattern '{"source":["aws.guardduty"]}' \
  --region af-south-1
```
