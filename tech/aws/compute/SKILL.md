---
name: tech/aws/compute
description: |
  AWS compute skill. Use when: (1) deploying serverless functions with Lambda — event-driven, pay-per-invocation,
  (2) running containers with ECS Fargate — serverless containers, no EC2 management,
  (3) provisioning EC2 instances — virtual machines, reserved/spot pricing,
  (4) auto-scaling compute with ASG and ALB — traffic-based scaling,
  (5) building serverless APIs with API Gateway + Lambda,
  (6) running hybrid Cloudflare + AWS architectures — Cloudflare at edge, AWS for compute-heavy workloads.
license: MIT
compatibility: AWS CLI v2, CDK v2, SDK v3 (TypeScript/Python), Terraform
homepage: https://skills.2nth.ai/tech/aws/compute
repository: https://github.com/2nth-ai/skills
requires:
  - tech/aws
improves:
  - tech/aws
  - tech
metadata:
  author: 2nth.ai
  version: "1.0.0"
  categories: "AWS, Lambda, EC2, ECS, Fargate, API Gateway, Auto Scaling, CloudWatch"
allowed-tools: Bash(aws:*) Bash(cdk:*) Read Write Edit Glob Grep
---

# AWS Compute

AWS is the 2nth.ai choice for compute-heavy workloads that exceed the Cloudflare edge model — event-driven functions (Lambda), containerised services (ECS Fargate), and persistent VMs (EC2). The pattern is: **Cloudflare at the edge → AWS for the heavy lift**. Lambda handles burst workloads and async processing; Fargate runs long-lived containers without managing servers; EC2 covers workloads that need full OS control or persistent state.

## Services in scope

| Service | Purpose | When to use |
|---------|---------|------------|
| **Lambda** | Serverless functions, pay per invocation | Event-driven logic, API backends, async jobs |
| **API Gateway** | Managed HTTP/REST/WebSocket endpoints | Expose Lambda as an API, throttling, auth |
| **ECS Fargate** | Serverless containers, no EC2 management | Long-lived services, containers needing >15min runtime |
| **EC2** | Virtual machines, full OS control | Stateful workloads, custom kernels, GPU, Frappe |
| **Auto Scaling Group (ASG)** | Elastic fleet of EC2 instances | Traffic-based scale-out/in |
| **Application Load Balancer (ALB)** | L7 load balancer | Route to EC2/Fargate, health checks, TLS termination |
| **CloudWatch** | Logs, metrics, alarms | Observability across all compute services |

## Authentication

### Local setup

```bash
# Install AWS CLI v2 (macOS)
brew install awscli

# Configure default profile (interactive)
aws configure
# AWS Access Key ID:     AKIA...
# AWS Secret Access Key: ...
# Default region:        af-south-1
# Output format:         json

# Or configure a named profile
aws configure --profile my-project
export AWS_PROFILE=my-project

# Use environment variables (CI/CD, Cloudflare Workers secrets)
export AWS_ACCESS_KEY_ID=AKIA...
export AWS_SECRET_ACCESS_KEY=...
export AWS_DEFAULT_REGION=af-south-1
```

### SSO login (recommended for team accounts)

```bash
# Configure SSO once
aws configure sso
# SSO session name: my-sso
# SSO start URL:    https://my-org.awsapps.com/start
# SSO region:       af-south-1

# Log in
aws sso login --profile my-sso-profile

# Use the profile
aws s3 ls --profile my-sso-profile
```

### Assume-role pattern (cross-account / least privilege)

```bash
# Assume a role and export credentials
CREDS=$(aws sts assume-role \
  --role-arn arn:aws:iam::123456789012:role/DeployRole \
  --role-session-name deploy-session \
  --query 'Credentials.[AccessKeyId,SecretAccessKey,SessionToken]' \
  --output text)

export AWS_ACCESS_KEY_ID=$(echo $CREDS | awk '{print $1}')
export AWS_SECRET_ACCESS_KEY=$(echo $CREDS | awk '{print $2}')
export AWS_SESSION_TOKEN=$(echo $CREDS | awk '{print $3}')

# Verify identity
aws sts get-caller-identity
```

### Preferred region

Use `af-south-1` (Cape Town) for SA-based clients. Note: not all AWS services are available in `af-south-1` — check availability before committing to a region. See Gotchas for known gaps.

---

## Lambda

Lambda runs code in response to events. Pay per invocation and per GB-second of execution time. Max timeout 15 minutes. No servers to manage.

### Architecture choice: ARM64 vs x86

Prefer **ARM64 (Graviton2)** for new functions — it costs ~20% less and often runs faster for compute-bound code. Use x86 only if your dependencies include compiled binaries that don't have ARM builds.

```bash
# Create a function (ARM64, Node.js 20)
aws lambda create-function \
  --function-name my-function \
  --runtime nodejs20.x \
  --architectures arm64 \
  --role arn:aws:iam::123456789012:role/lambda-exec-role \
  --handler index.handler \
  --zip-file fileb://function.zip \
  --timeout 30 \
  --memory-size 512 \
  --region af-south-1
```

### Memory / timeout tradeoffs

| Memory | vCPU share | Use case |
|--------|-----------|---------|
| 128 MB | ~0.07 vCPU | Lightweight event routing, tiny transforms |
| 512 MB | ~0.28 vCPU | API handlers, typical business logic |
| 1024 MB | ~0.56 vCPU | Image processing, moderate computation |
| 3008 MB | 1.75 vCPU | Heavy computation, PDF generation |
| 10240 MB | 6 vCPU | Maximum — ML inference, large file processing |

Increasing memory also increases CPU proportionally. If a function is slow, doubling memory halves duration, which may cost the same or less.

### TypeScript handler pattern

```typescript
// src/handler.ts
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';

export const handler = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  console.log(JSON.stringify({ level: 'info', event: event.requestContext.http.method, path: event.rawPath }));

  try {
    const body = event.body ? JSON.parse(event.body) : {};

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true, received: body }),
    };
  } catch (err) {
    console.error(JSON.stringify({ level: 'error', message: (err as Error).message }));
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal error' }) };
  }
};
```

```bash
# Build and package
npx tsc --outDir dist && cd dist && zip -r ../function.zip . && cd ..

# Update code
aws lambda update-function-code \
  --function-name my-function \
  --zip-file fileb://function.zip

# Update environment variables
aws lambda update-function-configuration \
  --function-name my-function \
  --environment "Variables={DB_URL=postgres://...,API_KEY=secret}"

# Invoke directly from CLI
aws lambda invoke \
  --function-name my-function \
  --payload '{"path":"/test"}' \
  --cli-binary-format raw-in-base64-out \
  response.json && cat response.json
```

### Lambda Layers

Layers allow sharing dependencies across functions — avoid bundling large packages (e.g. AWS SDK, Sharp) into every zip.

```bash
# Publish a layer
aws lambda publish-layer-version \
  --layer-name my-deps \
  --compatible-runtimes nodejs20.x \
  --compatible-architectures arm64 \
  --zip-file fileb://layer.zip

# Attach layer to a function
aws lambda update-function-configuration \
  --function-name my-function \
  --layers arn:aws:lambda:af-south-1:123456789012:layer:my-deps:1
```

### Cold start mitigation: Provisioned Concurrency

Lambda cold starts add 200–800ms for Node.js. For latency-sensitive functions, use provisioned concurrency to keep N instances warm.

```bash
# Publish a version
aws lambda publish-version --function-name my-function

# Set provisioned concurrency on the version
aws lambda put-provisioned-concurrency-config \
  --function-name my-function \
  --qualifier 1 \
  --provisioned-concurrent-executions 5
```

Provisioned concurrency is billed even when idle — use only for p99 latency requirements, not batch jobs.

### Event sources

```bash
# API Gateway trigger — see next section

# SQS trigger (batch processing)
aws lambda create-event-source-mapping \
  --function-name my-function \
  --event-source-arn arn:aws:sqs:af-south-1:123456789012:my-queue \
  --batch-size 10 \
  --function-response-types ReportBatchItemFailures

# S3 trigger (object upload)
aws s3api put-bucket-notification-configuration \
  --bucket my-bucket \
  --notification-configuration '{
    "LambdaFunctionConfigurations": [{
      "LambdaFunctionArn": "arn:aws:lambda:af-south-1:123456789012:function:my-function",
      "Events": ["s3:ObjectCreated:*"]
    }]
  }'

# EventBridge scheduled rule (cron)
aws events put-rule \
  --name my-schedule \
  --schedule-expression "rate(5 minutes)"

aws events put-targets \
  --rule my-schedule \
  --targets '[{"Id":"1","Arn":"arn:aws:lambda:af-south-1:123456789012:function:my-function"}]'
```

---

## API Gateway + Lambda

### HTTP API vs REST API

| | HTTP API | REST API |
|--|---------|---------|
| Cost | ~$1/million req | ~$3.50/million req |
| Latency | ~10ms lower | Standard |
| Features | JWT auth, CORS, proxy | Full: usage plans, API keys, transforms, WAF |
| When to use | Most cases | Need WAF, API keys, or payload transforms |

Prefer **HTTP API** unless you specifically need REST API features.

### Create an HTTP API with Lambda proxy integration

```bash
# Create HTTP API
API_ID=$(aws apigatewayv2 create-api \
  --name my-http-api \
  --protocol-type HTTP \
  --target arn:aws:lambda:af-south-1:123456789012:function:my-function \
  --cors-configuration AllowOrigins='["*"]',AllowMethods='["GET","POST","OPTIONS"]',AllowHeaders='["Content-Type","Authorization"]' \
  --query 'ApiId' --output text)

echo "API ID: $API_ID"
echo "Endpoint: https://${API_ID}.execute-api.af-south-1.amazonaws.com"

# Grant API Gateway permission to invoke Lambda
aws lambda add-permission \
  --function-name my-function \
  --statement-id apigw-invoke \
  --action lambda:InvokeFunction \
  --principal apigateway.amazonaws.com \
  --source-arn "arn:aws:execute-api:af-south-1:123456789012:${API_ID}/*"
```

### Custom domain

```bash
# Register a custom domain (cert must be in us-east-1 for edge, or same region for regional)
aws apigatewayv2 create-domain-name \
  --domain-name api.example.com \
  --domain-name-configurations CertificateArn=arn:aws:acm:af-south-1:123456789012:certificate/abc123,EndpointType=REGIONAL

# Map to API
aws apigatewayv2 create-api-mapping \
  --domain-name api.example.com \
  --api-id $API_ID \
  --stage '$default'
```

### Throttling

```bash
# Set throttle on route (HTTP API)
aws apigatewayv2 update-stage \
  --api-id $API_ID \
  --stage-name '$default' \
  --default-route-settings ThrottlingRateLimit=1000,ThrottlingBurstLimit=500
```

### Calling Lambda / API Gateway from Cloudflare Workers with SigV4

When invoking AWS Lambda directly (not via public API Gateway) from Cloudflare Workers, you must sign the request with AWS Signature Version 4. No SDK required — pure `fetch`.

```typescript
// utils/aws-sigv4.ts — SigV4 signing for Cloudflare Workers (Web Crypto API)
async function sha256Hex(data: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(data));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function hmacSha256(key: ArrayBuffer, data: string): Promise<ArrayBuffer> {
  const k = await crypto.subtle.importKey('raw', key, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return crypto.subtle.sign('HMAC', k, new TextEncoder().encode(data));
}

async function getSigningKey(secret: string, date: string, region: string, service: string): Promise<ArrayBuffer> {
  const kDate    = await hmacSha256(new TextEncoder().encode('AWS4' + secret), date);
  const kRegion  = await hmacSha256(kDate, region);
  const kService = await hmacSha256(kRegion, service);
  return hmacSha256(kService, 'aws4_request');
}

export async function signedFetch(
  url: string,
  method: string,
  body: string,
  env: { AWS_ACCESS_KEY_ID: string; AWS_SECRET_ACCESS_KEY: string; AWS_REGION: string },
  service = 'lambda'
): Promise<Response> {
  const parsed   = new URL(url);
  const now      = new Date();
  const dateStr  = now.toISOString().replace(/[:-]|\.\d{3}/g, '').slice(0, 15) + 'Z'; // 20240101T120000Z
  const dateOnly = dateStr.slice(0, 8);

  const payloadHash = await sha256Hex(body);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'host': parsed.host,
    'x-amz-date': dateStr,
    'x-amz-content-sha256': payloadHash,
  };

  const signedHeaderNames = Object.keys(headers).sort().join(';');
  const canonicalHeaders  = Object.keys(headers).sort().map(k => `${k}:${headers[k]}\n`).join('');

  const canonicalRequest = [
    method,
    parsed.pathname,
    parsed.search.slice(1),
    canonicalHeaders,
    signedHeaderNames,
    payloadHash,
  ].join('\n');

  const credentialScope = `${dateOnly}/${env.AWS_REGION}/${service}/aws4_request`;
  const stringToSign    = `AWS4-HMAC-SHA256\n${dateStr}\n${credentialScope}\n${await sha256Hex(canonicalRequest)}`;

  const signingKey = await getSigningKey(env.AWS_SECRET_ACCESS_KEY, dateOnly, env.AWS_REGION, service);
  const sigBuf     = await hmacSha256(signingKey, stringToSign);
  const signature  = Array.from(new Uint8Array(sigBuf)).map(b => b.toString(16).padStart(2, '0')).join('');

  const authorization = `AWS4-HMAC-SHA256 Credential=${env.AWS_ACCESS_KEY_ID}/${credentialScope}, SignedHeaders=${signedHeaderNames}, Signature=${signature}`;

  return fetch(url, {
    method,
    headers: { ...headers, Authorization: authorization },
    body: body || undefined,
  });
}

// Usage — invoke Lambda directly from a Cloudflare Worker
// wrangler.toml: [vars] AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const payload = JSON.stringify({ path: '/process', body: await request.text() });

    const lambdaUrl = `https://lambda.${env.AWS_REGION}.amazonaws.com/2015-03-31/functions/my-function/invocations`;
    const res = await signedFetch(lambdaUrl, 'POST', payload, env, 'lambda');

    const result = await res.json();
    return Response.json(result);
  },
};
```

---

## ECS Fargate

Fargate runs containers without managing EC2. You define CPU/memory at the task level and pay per vCPU-second and GB-second. Ideal for services that need more than 15 minutes runtime, require persistent TCP connections, or need container-level networking.

### CPU / memory sizing

| vCPU | Memory options | Typical use |
|------|---------------|------------|
| 0.25 | 0.5–2 GB | Lightweight services, cron jobs |
| 0.5  | 1–4 GB  | API services, Node.js apps |
| 1    | 2–8 GB  | Medium workloads, Java services |
| 2    | 4–16 GB | Heavy services, ML inference |
| 4    | 8–30 GB | High-throughput processing |

### Task definition

```json
{
  "family": "my-service",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::123456789012:role/ecsTaskExecutionRole",
  "taskRoleArn":      "arn:aws:iam::123456789012:role/ecsTaskRole",
  "containerDefinitions": [
    {
      "name": "my-service",
      "image": "123456789012.dkr.ecr.af-south-1.amazonaws.com/my-service:latest",
      "portMappings": [{ "containerPort": 3000, "protocol": "tcp" }],
      "environment": [
        { "name": "NODE_ENV", "value": "production" }
      ],
      "secrets": [
        { "name": "DB_URL", "valueFrom": "arn:aws:secretsmanager:af-south-1:123456789012:secret:db-url" }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group":  "/ecs/my-service",
          "awslogs-region": "af-south-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": ["CMD-SHELL", "curl -f http://localhost:3000/health || exit 1"],
        "interval": 30, "timeout": 5, "retries": 3
      }
    }
  ]
}
```

### Cluster, service, and ALB wiring

```bash
# Register task definition
aws ecs register-task-definition \
  --cli-input-json file://task-def.json

# Create cluster
aws ecs create-cluster --cluster-name my-cluster

# Create service with ALB target group
aws ecs create-service \
  --cluster my-cluster \
  --service-name my-service \
  --task-definition my-service:1 \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-abc,subnet-def],securityGroups=[sg-xyz],assignPublicIp=ENABLED}" \
  --load-balancers "targetGroupArn=arn:aws:elasticloadbalancing:af-south-1:123456789012:targetgroup/my-tg/abc,containerName=my-service,containerPort=3000" \
  --deployment-configuration "minimumHealthyPercent=100,maximumPercent=200" \
  --health-check-grace-period-seconds 60

# Rolling deploy: update service with new task definition revision
aws ecs update-service \
  --cluster my-cluster \
  --service my-service \
  --task-definition my-service:2
```

### Push image to ECR

```bash
# Authenticate Docker to ECR
aws ecr get-login-password --region af-south-1 \
  | docker login --username AWS --password-stdin 123456789012.dkr.ecr.af-south-1.amazonaws.com

# Create repository
aws ecr create-repository --repository-name my-service --region af-south-1

# Build, tag, push
docker build -t my-service .
docker tag my-service:latest 123456789012.dkr.ecr.af-south-1.amazonaws.com/my-service:latest
docker push 123456789012.dkr.ecr.af-south-1.amazonaws.com/my-service:latest
```

### Fargate Spot for cost savings

Use Fargate Spot for non-critical or fault-tolerant workloads (batch jobs, background workers). Up to 70% cheaper, but can be interrupted.

```bash
aws ecs create-service \
  --cluster my-cluster \
  --service-name my-batch-service \
  --capacity-provider-strategy "capacityProvider=FARGATE_SPOT,weight=1" \
  --task-definition my-service:1 \
  --desired-count 3 \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-abc],securityGroups=[sg-xyz],assignPublicIp=ENABLED}"
```

---

## EC2

EC2 provides full virtual machines. Use when you need persistent state, GPU, custom kernel, or workloads that run continuously at high utilisation (reserved pricing beats Lambda/Fargate).

### Instance types

| Type | vCPU | RAM | Use case |
|------|------|-----|---------|
| t3.micro | 2 | 1 GB | Dev/test, burstable |
| t3.small | 2 | 2 GB | Light web servers |
| t3.medium | 2 | 4 GB | General purpose small apps |
| c6g.large | 2 | 4 GB | Compute-optimised, ARM (Graviton2) |
| c6g.xlarge | 4 | 8 GB | Heavy compute, ARM |
| m6i.xlarge | 4 | 16 GB | Balanced, x86 |
| r6g.large | 2 | 16 GB | Memory-intensive, ARM |

Use **Graviton (c6g, m6g, r6g)** for best price/performance on Linux workloads.

### Launch an instance

```bash
# Create key pair
aws ec2 create-key-pair \
  --key-name my-key \
  --query 'KeyMaterial' \
  --output text > ~/.ssh/my-key.pem
chmod 400 ~/.ssh/my-key.pem

# Create security group
SG_ID=$(aws ec2 create-security-group \
  --group-name my-sg \
  --description "My security group" \
  --query 'GroupId' --output text)

# Allow HTTPS inbound (prefer SSM over SSH — no port 22 needed)
aws ec2 authorize-security-group-ingress \
  --group-id $SG_ID \
  --protocol tcp --port 443 --cidr 0.0.0.0/0

# Launch instance with user data (Amazon Linux 2023)
aws ec2 run-instances \
  --image-id ami-0c1c7d8c6f9a2b3e4 \
  --instance-type t3.medium \
  --key-name my-key \
  --security-group-ids $SG_ID \
  --iam-instance-profile Name=SSMInstanceProfile \
  --user-data '#!/bin/bash
    dnf update -y
    dnf install -y nodejs npm
    npm install -g pm2
    cd /app && npm ci && pm2 start index.js --name app' \
  --block-device-mappings '[{"DeviceName":"/dev/xvda","Ebs":{"VolumeSize":20,"VolumeType":"gp3"}}]' \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=my-server}]'
```

### Systems Manager Session Manager (no SSH required)

Prefer SSM over SSH — no key management, no port 22, full audit trail in CloudTrail.

```bash
# Ensure instance has AmazonSSMManagedInstanceCore policy attached
# Then connect:
aws ssm start-session --target i-0abc123def456789

# Port-forward a remote port to local (e.g. a DB)
aws ssm start-session \
  --target i-0abc123def456789 \
  --document-name AWS-StartPortForwardingSession \
  --parameters '{"portNumber":["5432"],"localPortNumber":["5432"]}'
```

### Attach EBS volume

```bash
# Create and attach
VOLUME_ID=$(aws ec2 create-volume \
  --availability-zone af-south-1a \
  --size 50 --volume-type gp3 \
  --query 'VolumeId' --output text)

aws ec2 attach-volume \
  --volume-id $VOLUME_ID \
  --instance-id i-0abc123def456789 \
  --device /dev/sdf

# On the instance: format and mount
# mkfs.ext4 /dev/nvme1n1 && mount /dev/nvme1n1 /data
```

---

## Auto Scaling

Auto Scaling dynamically adjusts EC2 fleet size based on demand. Pair with an ALB for traffic distribution.

### Launch template

```bash
aws ec2 create-launch-template \
  --launch-template-name my-lt \
  --version-description "v1" \
  --launch-template-data '{
    "ImageId": "ami-0c1c7d8c6f9a2b3e4",
    "InstanceType": "t3.medium",
    "SecurityGroupIds": ["sg-xyz"],
    "IamInstanceProfile": {"Name": "SSMInstanceProfile"},
    "UserData": "'$(base64 -w0 userdata.sh)'",
    "BlockDeviceMappings": [{
      "DeviceName": "/dev/xvda",
      "Ebs": {"VolumeSize": 20, "VolumeType": "gp3", "DeleteOnTermination": true}
    }],
    "TagSpecifications": [{
      "ResourceType": "instance",
      "Tags": [{"Key": "Name", "Value": "asg-instance"}]
    }]
  }'
```

### Auto Scaling Group with ALB

```bash
# Create ASG
aws autoscaling create-auto-scaling-group \
  --auto-scaling-group-name my-asg \
  --launch-template "LaunchTemplateName=my-lt,Version=\$Latest" \
  --min-size 1 --max-size 10 --desired-capacity 2 \
  --target-group-arns arn:aws:elasticloadbalancing:af-south-1:123456789012:targetgroup/my-tg/abc \
  --vpc-zone-identifier "subnet-abc,subnet-def" \
  --health-check-type ELB --health-check-grace-period 120 \
  --default-cooldown 300

# Target tracking: keep average CPU at 60%
aws autoscaling put-scaling-policy \
  --auto-scaling-group-name my-asg \
  --policy-name cpu-target-tracking \
  --policy-type TargetTrackingScaling \
  --target-tracking-configuration '{
    "PredefinedMetricSpecification": {"PredefinedMetricType": "ASGAverageCPUUtilization"},
    "TargetValue": 60.0,
    "ScaleInCooldown": 300,
    "ScaleOutCooldown": 60
  }'
```

### Lifecycle hook (drain before termination)

```bash
aws autoscaling put-lifecycle-hook \
  --auto-scaling-group-name my-asg \
  --lifecycle-hook-name drain-hook \
  --lifecycle-transition autoscaling:EC2_INSTANCE_TERMINATING \
  --heartbeat-timeout 120 \
  --default-result CONTINUE
```

---

## CloudWatch

CloudWatch is the observability layer for all AWS compute. Use structured JSON logs from Lambda and containers — CloudWatch Logs Insights can query them efficiently.

### Log groups and tailing

```bash
# Create log group
aws logs create-log-group \
  --log-group-name /my-app/production \
  --region af-south-1

# Set retention (avoid unbounded log accumulation)
aws logs put-retention-policy \
  --log-group-name /my-app/production \
  --retention-in-days 30

# Tail logs in real time (excellent for debugging Lambda)
aws logs tail /aws/lambda/my-function --follow --format short

# Query logs with Logs Insights
aws logs start-query \
  --log-group-name /aws/lambda/my-function \
  --start-time $(date -d '1 hour ago' +%s) \
  --end-time $(date +%s) \
  --query-string 'fields @timestamp, @message | filter level = "error" | sort @timestamp desc | limit 50'
```

### Structured logging pattern (Lambda / Node.js)

```typescript
// Log every request as a structured JSON line — CloudWatch Logs Insights can filter on any field
const log = (level: 'info' | 'warn' | 'error', message: string, extra?: object) => {
  console.log(JSON.stringify({ level, message, timestamp: new Date().toISOString(), ...extra }));
};

// In handler:
log('info', 'request', { method: event.requestContext.http.method, path: event.rawPath });
log('error', 'db_failed', { error: err.message, query: 'SELECT ...' });
```

### Metric filter and alarm

```bash
# Create metric filter on structured logs
aws logs put-metric-filter \
  --log-group-name /aws/lambda/my-function \
  --filter-name error-count \
  --filter-pattern '{ $.level = "error" }' \
  --metric-transformations metricName=ErrorCount,metricNamespace=MyApp,metricValue=1,defaultValue=0

# Alarm when error rate > 10 in 5 minutes
aws cloudwatch put-metric-alarm \
  --alarm-name lambda-errors \
  --metric-name ErrorCount \
  --namespace MyApp \
  --statistic Sum \
  --period 300 --evaluation-periods 1 --threshold 10 \
  --comparison-operator GreaterThanThreshold \
  --alarm-actions arn:aws:sns:af-south-1:123456789012:alerts \
  --treat-missing-data notBreaching
```

---

## Cost model

### Lambda pricing (af-south-1)

| Component | Price |
|-----------|-------|
| Requests | $0.20 per 1M requests |
| Duration (x86) | $0.0000166667 per GB-second |
| Duration (ARM64) | $0.0000133334 per GB-second (~20% cheaper) |
| Free tier | 1M requests + 400,000 GB-seconds/month |

Example: 10M req/month, 512MB, avg 100ms = ~$8.50/month (ARM64).

### Fargate pricing (af-south-1)

| Component | Price |
|-----------|-------|
| vCPU | ~$0.04856 per vCPU-hour |
| Memory | ~$0.00532 per GB-hour |
| Fargate Spot | Up to 70% discount (interruptible) |

Example: 1 vCPU + 2 GB, running 24/7 = ~$43/month on-demand, ~$13 on Spot.

### EC2 pricing (approximate, af-south-1)

| Instance | On-demand/hr | 1-yr Reserved | Spot (est.) |
|----------|-------------|--------------|-------------|
| t3.micro | ~$0.011 | ~$0.007 | ~$0.004 |
| t3.medium | ~$0.044 | ~$0.028 | ~$0.013 |
| c6g.xlarge | ~$0.136 | ~$0.088 | ~$0.041 |
| m6i.xlarge | ~$0.192 | ~$0.124 | ~$0.058 |

af-south-1 is generally ~10–20% more expensive than us-east-1 due to lower utilisation. For cost-sensitive workloads, weigh the data sovereignty/latency benefit against the premium. t3.micro in af-south-1 is approximately $0.011/hr (us-east-1 ~$0.0104/hr).

### Cost hierarchy: cheapest to most expensive per unit of work

1. **Lambda (ARM64)** — zero idle cost, best for bursty/event-driven
2. **Fargate Spot** — containerised, interruptible, ~70% savings over on-demand
3. **Fargate on-demand** — predictable containers, no EC2 ops
4. **EC2 Spot** — cheapest persistent compute, interruptible
5. **EC2 Reserved** — continuous high-utilisation workloads
6. **EC2 On-demand** — avoid for steady-state; use only for unpredictable peaks without commitment

---

## Gotchas

- **Lambda cold starts**: Node.js cold starts are 200–500ms; JVM (Java) can be 2–5s. Use ARM64 + keep packages small. Use provisioned concurrency only when p99 latency matters — it is billed 24/7.
- **Lambda timeout max 15 minutes**: Any workload exceeding this must move to ECS Fargate or an EC2 batch job. Design for idempotency and checkpointing if processing can be chunked.
- **ECS task role vs execution role**: The **execution role** is used by the ECS agent to pull images from ECR and write logs to CloudWatch. The **task role** is what your application code uses to call other AWS services (S3, DynamoDB, etc.). Mixing these up is the most common ECS IAM mistake.
- **Lambda in VPC adds latency**: Attaching Lambda to a VPC for private resource access (RDS, ElastiCache) adds ~1s cold start due to ENI provisioning. Mitigate with Lambda SnapStart (Java) or provisioned concurrency.
- **Fargate image pull from public ECR**: Pulling from Docker Hub or public ECR incurs NAT Gateway charges if your task is in a private subnet. Use a VPC endpoint for ECR or cache images in a private ECR repository.
- **af-south-1 service gaps**: Some services are not yet available in Cape Town — including Lambda SnapStart, some Bedrock model endpoints, certain EC2 instance families, and ElastiCache Serverless. Always verify availability at [https://aws.amazon.com/about-aws/global-infrastructure/regional-product-services/](https://aws.amazon.com/about-aws/global-infrastructure/regional-product-services/) before designing.
- **SigV4 signing from Cloudflare Workers**: The Web Crypto API (`crypto.subtle`) is available in Workers but uses `ArrayBuffer` not `Buffer`. The signing snippet in this skill is written for Workers — do not copy Node.js SDK signing utilities directly.
- **API Gateway payload limit**: API Gateway has a 10MB payload limit for both HTTP API and REST API. Lambda itself has a 6MB synchronous invocation payload limit. For large files, use S3 presigned URLs instead of passing through API Gateway.
- **ASG cooldown vs instance warmup**: Default cooldown (300s) prevents scale-out thrashing. If your instance takes longer to be application-ready, set `defaultInstanceWarmup` to avoid premature scale-in before the new instance is serving traffic.

## See Also

- [AWS auth and IAM](../SKILL.md)
- [Cloudflare Workers](../../cloudflare/SKILL.md)
- [Infrastructure as Code (CDK/Terraform)](../../iac/SKILL.md)
