---
name: tech/aws/connect
description: |
  Amazon Connect contact centre skill. Use when:
  (1) setting up a cloud contact centre — instance creation, phone numbers, hours of operation,
  (2) building contact flows (IVR) — drag-and-drop or JSON import, Lex chatbot integration,
  (3) configuring routing — queues, routing profiles, agent hierarchy,
  (4) integrating with Lambda — real-time data lookup, CRM screen-pop, dynamic prompts,
  (5) enabling outbound campaigns — predictive/progressive dialler, contact lists,
  (6) analytics and reporting — real-time dashboards, historical metrics, Contact Lens AI transcription,
  (7) agent desktop customisation — Streams API, custom CCP, third-party CRM embedding.
license: MIT
compatibility: AWS CLI v2, Amazon Connect Console, Connect Streams API v2, AWS SDK v3 (TypeScript/Python)
homepage: https://skills.2nth.ai/tech/aws/connect
repository: https://github.com/2nth-ai/skills
requires:
  - tech/aws
  - tech/aws/compute
  - tech/aws/security
improves:
  - tech/aws
metadata:
  author: 2nth.ai
  version: "1.0.0"
  categories: "AWS, Amazon Connect, contact centre, IVR, contact flow, Lex, Lambda, routing, CCP, Streams API, Contact Lens, outbound, Kinesis"
allowed-tools: Bash(aws:*) Read Write Edit Glob Grep
---

# Amazon Connect

Amazon Connect is AWS's cloud-native contact centre service. No hardware, no per-seat licences — pay only for active contact minutes and associated feature usage. The architecture is: **phone/chat/task → Contact Flow (IVR logic) → Queue → Agent**, with Lambda callable at any step for real-time CRM lookups, dynamic prompts, or routing decisions.

In the 2nth.ai stack Connect sits behind Cloudflare for web channel entry points and integrates with the rest of the AWS backend (Lambda, DynamoDB, S3, Lex) for the business logic layer.

## Core concepts

| Concept | What it is |
|---------|-----------|
| **Instance** | The Connect deployment unit — one per contact centre environment |
| **Contact Flow** | IVR logic tree — play prompts, branch on input, invoke Lambda, transfer to queue |
| **Queue** | Holding area for contacts waiting for an agent |
| **Routing Profile** | Assigns queues + channels (voice/chat/task) to an agent with priority/delay rules |
| **Hours of Operation** | Schedule defining when a queue accepts contacts |
| **Agent Hierarchy** | Org structure (Location → Department → Team) used in reporting and routing |
| **Contact Lens** | ML-powered transcription, sentiment, PII redaction, conversation analytics |
| **Streams API** | JavaScript SDK for embedding the Contact Control Panel (CCP) in custom apps |

---

## 1. Instance setup

```bash
# Create a Connect instance (alias becomes subdomain: alias.my.connect.aws)
aws connect create-instance \
  --identity-management-type CONNECT_MANAGED \
  --instance-alias my-contact-centre \
  --inbound-calls-enabled \
  --outbound-calls-enabled \
  --region af-south-1

# Get instance ID (needed for all subsequent CLI commands)
aws connect list-instances --region af-south-1 \
  --query 'InstanceSummaryList[?InstanceAlias==`my-contact-centre`].Id' \
  --output text
```

> **af-south-1 note**: Amazon Connect is available in af-south-1 (Cape Town). Voice quality to South African PSTN is excellent via the local AWS PoP. For East/West Africa consider eu-west-1 (Ireland) or ap-southeast-1 (Singapore) depending on majority caller location.

### Storage configuration (S3 + KMS)

Connect stores call recordings, transcripts, chat transcripts, and exported reports in S3. Set this immediately after instance creation.

```bash
INSTANCE_ID="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
BUCKET="my-connect-recordings"
KMS_KEY_ARN="arn:aws:kms:af-south-1:123456789012:key/xxxxxxxx"

# Call recordings
aws connect associate-instance-storage-config \
  --instance-id $INSTANCE_ID \
  --resource-type CALL_RECORDINGS \
  --storage-config '{
    "StorageType": "S3",
    "S3Config": {
      "BucketName": "'$BUCKET'",
      "BucketPrefix": "recordings",
      "EncryptionConfig": {
        "EncryptionType": "KMS",
        "KeyId": "'$KMS_KEY_ARN'"
      }
    }
  }' \
  --region af-south-1

# Chat transcripts
aws connect associate-instance-storage-config \
  --instance-id $INSTANCE_ID \
  --resource-type CHAT_TRANSCRIPTS \
  --storage-config '{
    "StorageType": "S3",
    "S3Config": {
      "BucketName": "'$BUCKET'",
      "BucketPrefix": "chat-transcripts",
      "EncryptionConfig": {
        "EncryptionType": "KMS",
        "KeyId": "'$KMS_KEY_ARN'"
      }
    }
  }' \
  --region af-south-1
```

---

## 2. Phone numbers

```bash
# Claim a DID (direct inward dial) number
aws connect search-available-phone-numbers \
  --target-arn "arn:aws:connect:af-south-1:123456789012:instance/$INSTANCE_ID" \
  --phone-number-country-code ZA \
  --phone-number-type DID \
  --region af-south-1

# Claim the number (use phoneNumberId from above)
aws connect claim-phone-number \
  --target-arn "arn:aws:connect:af-south-1:123456789012:instance/$INSTANCE_ID" \
  --phone-number "+27XXXXXXXXX" \
  --phone-number-type DID \
  --phone-number-country-code ZA \
  --region af-south-1

# Associate number with a contact flow
aws connect associate-phone-number-contact-flow \
  --phone-number-id "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" \
  --instance-id $INSTANCE_ID \
  --contact-flow-id "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" \
  --region af-south-1
```

---

## 3. Hours of operation

```bash
aws connect create-hours-of-operation \
  --instance-id $INSTANCE_ID \
  --name "Business Hours ZA" \
  --description "Mon-Fri 08:00-17:00 SAST" \
  --time-zone "Africa/Johannesburg" \
  --config '[
    {"Day":"MONDAY","StartTime":{"Hours":8,"Minutes":0},"EndTime":{"Hours":17,"Minutes":0}},
    {"Day":"TUESDAY","StartTime":{"Hours":8,"Minutes":0},"EndTime":{"Hours":17,"Minutes":0}},
    {"Day":"WEDNESDAY","StartTime":{"Hours":8,"Minutes":0},"EndTime":{"Hours":17,"Minutes":0}},
    {"Day":"THURSDAY","StartTime":{"Hours":8,"Minutes":0},"EndTime":{"Hours":17,"Minutes":0}},
    {"Day":"FRIDAY","StartTime":{"Hours":8,"Minutes":0},"EndTime":{"Hours":17,"Minutes":0}}
  ]' \
  --region af-south-1
```

---

## 4. Queues

```bash
# Create a queue (requires hours-of-operation ARN)
aws connect create-queue \
  --instance-id $INSTANCE_ID \
  --name "General Enquiries" \
  --hours-of-operation-id "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" \
  --max-contacts 50 \
  --region af-south-1

# Queue with outbound caller ID
aws connect create-queue \
  --instance-id $INSTANCE_ID \
  --name "Sales Outbound" \
  --hours-of-operation-id "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" \
  --outbound-caller-config '{
    "OutboundCallerIdName": "Acme Sales",
    "OutboundCallerIdNumberId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
  }' \
  --region af-south-1
```

---

## 5. Routing profiles

Routing profiles determine which queues an agent handles and in what order. An agent can only be assigned one routing profile.

```bash
aws connect create-routing-profile \
  --instance-id $INSTANCE_ID \
  --name "Voice Generalist" \
  --description "Handles voice contacts from General Enquiries queue" \
  --default-outbound-queue-id "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" \
  --media-concurrencies '[
    {"Channel":"VOICE","Concurrency":1},
    {"Channel":"CHAT","Concurrency":3},
    {"Channel":"TASK","Concurrency":5}
  ]' \
  --queue-configs '[
    {
      "QueueReference": {
        "QueueId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
        "Channel": "VOICE"
      },
      "Priority": 1,
      "Delay": 0
    }
  ]' \
  --region af-south-1
```

---

## 6. Agents (users)

```bash
# Create agent user
aws connect create-user \
  --instance-id $INSTANCE_ID \
  --username "jane.doe" \
  --password "Temp@1234!" \
  --identity-info '{"FirstName":"Jane","LastName":"Doe","Email":"jane.doe@example.com"}' \
  --phone-config '{"PhoneType":"SOFT_PHONE","AutoAccept":false,"AfterContactWorkTimeLimit":30}' \
  --routing-profile-id "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" \
  --security-profile-ids '["xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"]' \
  --region af-south-1

# List security profiles (Agent, Admin, CallCentreManager built-in)
aws connect list-security-profiles \
  --instance-id $INSTANCE_ID \
  --region af-south-1
```

---

## 7. Contact flows (IVR)

Contact flows define what happens when a contact arrives. Build in the visual editor (Connect console → Contact flows) or import JSON.

### Minimal flow structure (JSON)

```json
{
  "Version": "2019-10-30",
  "StartAction": "check-hours",
  "Actions": [
    {
      "Identifier": "check-hours",
      "Type": "CheckHoursOfOperation",
      "Parameters": {
        "HoursOfOperationId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
      },
      "Transitions": {
        "NextAction": "play-welcome",
        "Conditions": [
          {"NextAction": "play-closed", "Condition": {"Operator": "Equals", "Operands": ["False"]}}
        ],
        "Errors": [{"NextAction": "play-error", "ErrorType": "Any"}]
      }
    },
    {
      "Identifier": "play-welcome",
      "Type": "MessageParticipant",
      "Parameters": {
        "Text": "Thank you for calling. Please hold while we connect you.",
        "TextToSpeechType": "neural",
        "LanguageCode": "en-ZA"
      },
      "Transitions": {"NextAction": "transfer-to-queue"}
    },
    {
      "Identifier": "transfer-to-queue",
      "Type": "TransferContactToQueue",
      "Parameters": {
        "QueueId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
      },
      "Transitions": {
        "Errors": [{"NextAction": "play-error", "ErrorType": "QueueAtCapacity"}]
      }
    },
    {
      "Identifier": "play-closed",
      "Type": "MessageParticipant",
      "Parameters": {
        "Text": "Our offices are currently closed. We are open Monday to Friday, 8am to 5pm.",
        "TextToSpeechType": "neural"
      },
      "Transitions": {"NextAction": "disconnect"}
    },
    {
      "Identifier": "disconnect",
      "Type": "DisconnectParticipant",
      "Parameters": {},
      "Transitions": {}
    },
    {
      "Identifier": "play-error",
      "Type": "MessageParticipant",
      "Parameters": {"Text": "We are unable to take your call at this time. Please try again later."},
      "Transitions": {"NextAction": "disconnect"}
    }
  ]
}
```

```bash
# Import a contact flow
aws connect create-contact-flow \
  --instance-id $INSTANCE_ID \
  --name "Main IVR" \
  --type CONTACT_FLOW \
  --content file://main-ivr.json \
  --region af-south-1
```

---

## 8. Lambda integration

Lambda is invoked from contact flows using the **Invoke AWS Lambda function** block. The function receives a standard Connect event and returns key-value attributes that become contact attributes usable in subsequent flow blocks.

### Lambda function pattern

```typescript
import type { ConnectContactFlowEvent, ConnectContactFlowResult } from 'aws-lambda';

export const handler = async (
  event: ConnectContactFlowEvent
): Promise<ConnectContactFlowResult> => {
  const phoneNumber = event.Details.ContactData.CustomerEndpoint?.Address;
  const accountId = event.Details.Parameters.AccountId; // passed from flow block

  // CRM lookup
  const customer = await lookupCustomer(phoneNumber);

  return {
    // Return values become contact attributes in the flow
    CustomerName: customer?.name ?? 'Valued Customer',
    AccountStatus: customer?.status ?? 'unknown',
    PreferredLanguage: customer?.language ?? 'en-ZA',
    AgentSkillRequired: customer?.tier === 'premium' ? 'senior' : 'general',
  };
};
```

### Grant Connect permission to invoke Lambda

```bash
aws lambda add-permission \
  --function-name my-crm-lookup \
  --statement-id connect-invoke \
  --action lambda:InvokeFunction \
  --principal connect.amazonaws.com \
  --source-arn "arn:aws:connect:af-south-1:123456789012:instance/$INSTANCE_ID" \
  --region af-south-1

# Associate Lambda with instance (required before it appears in flow editor)
aws connect associate-lambda-function \
  --instance-id $INSTANCE_ID \
  --function-arn "arn:aws:lambda:af-south-1:123456789012:function:my-crm-lookup" \
  --region af-south-1
```

---

## 9. Amazon Lex integration (voice bot / IVR automation)

Lex bots handle natural language intent capture inside contact flows — collect slot values (account number, date, query type) before routing to an agent or self-serving the contact entirely.

```bash
# Associate a Lex V2 bot with the Connect instance
aws connect associate-lex-bot \
  --instance-id $INSTANCE_ID \
  --lex-bot '{
    "Name": "BankingIVR",
    "LexRegion": "af-south-1"
  }' \
  --region af-south-1
```

In the contact flow, use **Get customer input** block → Lex bot → branch on returned intent.

---

## 10. Contact Lens (transcription + analytics)

Contact Lens performs post-call and real-time transcription, sentiment analysis, keyword spotting, and PII redaction. Enable per-instance then configure per-contact-flow.

```bash
# Enable Contact Lens on the instance
aws connect update-instance-attribute \
  --instance-id $INSTANCE_ID \
  --attribute-type CONTACT_LENS \
  --value "true" \
  --region af-south-1
```

In the contact flow, add a **Set recording and analytics behaviour** block and set **Contact Lens** to `Enable`. Transcripts land in the S3 bucket configured at step 1.

### Query transcripts via API

```python
import boto3

client = boto3.client('connect', region_name='af-south-1')

# Get transcript for a completed contact
response = client.get_transcript(
    InstanceId=INSTANCE_ID,
    ContactId='xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
    ContactFlowId='xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
    MaxResults=100,
    ScanDirection='FORWARD',
    SortOrder='ASCENDING'
)
for item in response['Transcript']:
    print(f"[{item['ParticipantRole']}] {item['Content']}")
```

---

## 11. Real-time and historical metrics

```python
# Real-time queue metrics (agents available, contacts in queue, oldest contact)
response = client.get_current_metric_data(
    InstanceId=INSTANCE_ID,
    Filters={'Queues': ['QUEUE_ID'], 'Channels': ['VOICE']},
    CurrentMetrics=[
        {'Name': 'AGENTS_AVAILABLE', 'Unit': 'COUNT'},
        {'Name': 'CONTACTS_IN_QUEUE', 'Unit': 'COUNT'},
        {'Name': 'OLDEST_CONTACT_AGE', 'Unit': 'SECONDS'},
    ]
)

# Historical metrics (e.g. AHT, abandonment rate, service level for last 24h)
import datetime
response = client.get_metric_data(
    InstanceId=INSTANCE_ID,
    StartTime=datetime.datetime.utcnow() - datetime.timedelta(hours=24),
    EndTime=datetime.datetime.utcnow(),
    Filters={'Queues': ['QUEUE_ID'], 'Channels': ['VOICE']},
    Groupings=['QUEUE'],
    HistoricalMetrics=[
        {'Name': 'CONTACTS_HANDLED', 'Unit': 'COUNT', 'Statistic': 'SUM'},
        {'Name': 'CONTACTS_ABANDONED', 'Unit': 'COUNT', 'Statistic': 'SUM'},
        {'Name': 'HANDLE_TIME', 'Unit': 'SECONDS', 'Statistic': 'AVG'},
        {'Name': 'SERVICE_LEVEL', 'Unit': 'PERCENT', 'Statistic': 'AVG',
         'Threshold': {'Comparison': 'LT', 'ThresholdValue': 20}},
    ]
)
```

---

## 12. Custom agent desktop (Streams API)

The Connect Streams API lets you embed the Contact Control Panel (CCP) in your own web app — CRM, intranet portal, banking platform — and subscribe to agent state and contact events.

```html
<!-- Include Streams SDK -->
<script src="https://unpkg.com/amazon-connect-streams/release/connect-streams.js"></script>
<div id="ccp-container" style="width:320px;height:540px;"></div>
```

```javascript
connect.core.initCCP(document.getElementById('ccp-container'), {
  ccpUrl: 'https://my-contact-centre.my.connect.aws/ccp-v2',
  loginPopup: true,
  softphone: { allowFramedSoftphone: true },
  storageAccess: { canRequest: true },
});

// Subscribe to contact events
connect.contact(contact => {
  contact.onConnecting(contact => {
    const attrs = contact.getAttributes();
    const customerName = attrs.CustomerName?.value;
    // Open CRM record, display screen-pop, etc.
    console.log('Incoming contact from:', customerName);
  });

  contact.onACW(contact => {
    // After Contact Work started — start wrap-up timer
  });

  contact.onEnded(contact => {
    // Contact ended — log to CRM, auto-submit wrap-up
  });
});

// Subscribe to agent state changes
connect.agent(agent => {
  agent.onStateChange(stateChange => {
    console.log(`Agent state: ${stateChange.newState}`);
    // Available | Busy | AfterContactWork | Offline | custom states
  });
});
```

---

## 13. Outbound campaigns (preview/progressive/predictive dialler)

Requires **Amazon Connect outbound campaigns** (separate feature, available in select regions).

```bash
# Create a campaign
aws connectcampaigns create-campaign \
  --name "Q1 Renewals" \
  --connect-instance-id $INSTANCE_ID \
  --dialer-config '{"predictiveDialerConfig":{"bandwidthAllocation":1.0}}' \
  --outbound-call-config '{
    "connectContactFlowId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    "connectSourcePhoneNumber": "+27XXXXXXXXX",
    "answerMachineDetectionConfig": {"enableAnswerMachineDetection": true}
  }' \
  --region eu-west-1   # outbound campaigns not yet in af-south-1 as of 2025
```

---

## 14. Kinesis stream for real-time contact events

Stream every contact event (initiated, queued, connected, disconnected, ACW) to Kinesis for real-time dashboards, CRM sync, or compliance logging.

```bash
# Create stream
aws kinesis create-stream \
  --stream-name connect-contact-events \
  --shard-count 1 \
  --region af-south-1

# Associate with Connect instance
aws connect associate-instance-storage-config \
  --instance-id $INSTANCE_ID \
  --resource-type CONTACT_TRACE_RECORDS \
  --storage-config '{
    "StorageType": "KINESIS_STREAM",
    "KinesisStreamConfig": {
      "StreamArn": "arn:aws:kinesis:af-south-1:123456789012:stream/connect-contact-events"
    }
  }' \
  --region af-south-1
```

---

## Cost model

| Component | Pricing model | Indicative (ZAR) |
|-----------|--------------|-----------------|
| Voice contact | per minute (inbound + outbound separately) | ~R0.09/min inbound |
| Chat contact | per message | ~R0.005/message |
| Task contact | per task | ~R0.06/task |
| Contact Lens transcription | per minute | ~R0.12/min |
| Contact Lens real-time | per minute | ~R0.24/min |
| Outbound campaigns | per dialler minute | additional per-minute charge |
| Phone number rental | per DID per day | ~R2.50/day ZA DID |

> **No per-seat licence.** Connect charges purely on usage. A 10-agent centre that handles 500 calls/day at 4 minutes AHT costs roughly R180/day in contact minutes — compare to $150/agent/month for legacy on-prem systems.

---

## Security and compliance

```bash
# Enable CloudTrail logging for all Connect API calls
aws cloudtrail create-trail \
  --name connect-audit \
  --s3-bucket-name my-connect-recordings \
  --include-global-service-events \
  --is-multi-region-trail \
  --region af-south-1

# Contact recordings are encrypted at rest with KMS (configured at instance setup)
# Restrict recording access to compliance role only
aws s3api put-bucket-policy --bucket my-connect-recordings --policy '{
  "Statement": [{
    "Effect": "Deny",
    "Principal": "*",
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::my-connect-recordings/recordings/*",
    "Condition": {
      "StringNotEquals": {
        "aws:PrincipalArn": "arn:aws:iam::123456789012:role/ComplianceAuditRole"
      }
    }
  }]
}'
```

**POPIA note**: Store all recordings and transcripts in af-south-1. Enable Contact Lens PII redaction to mask ID numbers, card numbers, and account numbers from transcripts before storage.

---

## Gotchas

- **Instance alias is permanent** — you cannot rename a Connect instance after creation; the subdomain is fixed
- **Contact flow errors are silent by default** — always add an error branch on every Lambda invoke block or contacts silently disconnect
- **Lambda timeout** — Connect waits max 8 seconds for a Lambda response; keep lookup functions under 3s or callers hear dead air
- **Lex V1 vs V2** — Connect console still shows both; use Lex V2 (bot aliases) for all new builds; V1 is legacy
- **Routing profile channel concurrency** — voice concurrency must be 1 (hard limit); chat/task can be higher
- **Outbound campaigns region gap** — not available in af-south-1 as of 2025; use eu-west-1 with documented POPIA transfer basis
- **Streams API CORS** — your embedding domain must be whitelisted in the Connect instance's Approved origins list
- **Contact Lens real-time adds ~3s latency** to transcription delivery — not suitable for sub-second screen-pop requirements
- **Phone number porting** — porting an existing ZA number into Connect takes 4-8 weeks via AWS support

## See also

- `tech/aws/compute` — Lambda functions invoked from contact flows
- `tech/aws/security` — IAM roles for Connect, KMS key policy for recordings
- `tech/aws/storage` — S3 bucket configuration for recordings and transcripts
- `tech/aws/messaging` — Kinesis stream for contact event pipeline
- `tech/cisco/collaboration` — Cisco CUCM/UCCX migration path to Connect
