# Notes API — NestJS + AWS Event-Driven Architecture

Backend REST API built with NestJS demonstrating an event-driven architecture using AWS services simulated locally with LocalStack.

## Tech Stack

- **NestJS** — REST API framework
- **TypeORM + PostgreSQL** — data persistence
- **AWS SQS** — message queue for async event processing
- **AWS Lambda** — serverless consumer triggered by SQS
- **AWS Secrets Manager** — secure config/credentials storage
- **Terraform** — infrastructure as code
- **LocalStack** — local AWS simulation (Docker)

## Architecture

```
HTTP Request
     │
     ▼
NestJS API ──── TypeORM ──── PostgreSQL
     │
     │  POST /notes/:id/attachments
     │  (only when file is attached)
     ▼
NestJS: Upload file ──► S3 Bucket (notes-attachments)
     │               Save fileUrl in DB
     │
     │  Fire & forget
     ▼
SQS Producer ──► notes-queue (SQS)
                      │
                      │  Event Source Mapping
                      ▼
               Lambda Consumer
               (notes-sqs-consumer)
                      │
                      ▼
               Process FILE_ATTACHED event
               (async post-processing simulation)
```

**Flow:** When a user attaches a file to a note, NestJS uploads it to S3, saves the file URL in the database, and publishes a `FILE_ATTACHED` event to SQS. AWS Lambda is triggered automatically via Event Source Mapping and processes the event asynchronously (simulating thumbnail generation, virus scanning, indexing, etc.).

Notes without attachments are saved directly to PostgreSQL — Lambda is only triggered when there is real async work to do.

## Project Structure

```
src/
├── app.module.ts
├── auth/               # JWT authentication
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── jwt.strategy.ts
│   └── jwt-auth.guard.ts
├── notes/              # Notes CRUD module
│   ├── notes.controller.ts
│   └── notes.module.ts
├── service/
│   └── notes.service.ts    # Includes S3 upload + SQS publish
├── sqs/                # SQS producer
│   ├── sqs-producer.service.ts
│   └── sqs.module.ts
├── lambda/             # Lambda handler (deployed as ZIP)
│   ├── index.ts
│   ├── sqs-consumer.handler.ts
│   └── lambda-sqs-consumer.service.ts
└── entitys/
    ├── note.entity.ts      # includes fileUrl column
    └── user.entity.ts

infra/                  # Terraform IaC
├── main.tf             # LocalStack provider
├── variables.tf
├── iam.tf              # IAM role + policies (CloudWatch, SQS, S3)
├── sqs.tf              # SQS queue + DLQ
├── s3.tf               # S3 bucket for attachments
├── lambda.tf           # Lambda function + event source mapping
└── outputs.tf
```

## Prerequisites

- Docker + Docker Compose
- Node.js 18+
- Terraform
- WSL (for building the Lambda ZIP on Windows)

## Local Setup

### 1. Start LocalStack + PostgreSQL

```bash
cd ../../Localstack_lab
docker-compose up -d
```

### 2. Create required secrets in LocalStack

```bash
# Database credentials
docker exec localstack-lab awslocal secretsmanager create-secret \
  --name notesdb/credentials \
  --secret-string '{"username":"admin","password":"admin123","host":"postgres-lab","port":5432,"database":"notesdb"}' \
  --region us-east-1

# SQS config
docker exec localstack-lab awslocal secretsmanager create-secret \
  --name notes/sqs-config \
  --secret-string '{"queueUrl":"http://sqs.us-east-1.localhost.localstack.cloud:4566/000000000000/notes-queue","region":"us-east-1","endpoint":"http://localhost:4566"}' \
  --region us-east-1
```

### 3. Install dependencies and run API

```bash
npm install
npm run start:dev
```

### 4. Deploy infrastructure with Terraform

```bash
cd infra
terraform init
terraform apply -auto-approve
```

### 5. Build and deploy the Lambda

```bash
# In WSL
npm run build:lambda
docker cp lambda-dist/sqs-consumer.zip localstack-lab:/tmp/sqs-consumer.zip
docker exec localstack-lab awslocal lambda update-function-code \
  --function-name notes-sqs-consumer \
  --zip-file fileb:///tmp/sqs-consumer.zip \
  --region us-east-1
```

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/register` | No | Register user |
| POST | `/auth/login` | No | Login, returns JWT |
| GET | `/notes` | JWT | Get user notes |
| POST | `/notes` | JWT | Create note (direct to DB, no SQS) |
| POST | `/notes/:id/attachments` | JWT | Upload file to S3, save URL in DB, publish FILE_ATTACHED to SQS |
| DELETE | `/notes/:id` | JWT | Delete note |

## Environment Variables

```env
# AWS
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test
AWS_REGION=us-east-1
LOCALSTACK_ENDPOINT=http://localhost:4566

# Secrets Manager
DB_CREDENTIALS_SECRET_ID=notesdb/credentials
SQS_CONFIG_SECRET_ID=sqs/config

# S3
S3_BUCKET=notes-attachments

# CloudWatch (optional)
USE_CLOUDWATCH=false
CLOUDWATCH_LOG_GROUP=/app/backend
```

## Infrastructure (Terraform)

Resources managed by Terraform:

| Resource | Name |
|---|---|
| IAM Role | `notes-lambda-role` |
| IAM Policy | CloudWatch Logs, SQS consume, S3 read/write |
| SQS Queue | `notes-queue` |
| SQS DLQ | `notes-dlq` |
| S3 Bucket | `notes-attachments` |
| Lambda Function | `notes-sqs-consumer` |
| Event Source Mapping | `notes-queue → notes-sqs-consumer` |

## Tests

```bash
# unit tests
npm run test

# e2e tests
npm run test:e2e

# coverage
npm run test:cov
```

## License

MIT
