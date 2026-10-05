# Notes API — NestJS + AWS Event-Driven Architecture

A NestJS backend for a notes platform with authentication, file uploads, PostgreSQL persistence, and event-driven processing using AWS services simulated locally with LocalStack.

## Overview

This project demonstrates a full-stack portfolio architecture where the API manages note creation, user authentication, file uploads, and asynchronous background processing. It simulates a production-style cloud pattern without depending on real AWS services during local development.

## Tech Stack

- NestJS 11
- TypeScript
- PostgreSQL
- TypeORM
- JWT + Passport
- Class Validator + Class Transformer
- Rate limiting and security middleware
- IAM roles and policies
- AWS S3
- AWS SQS / DLQ
- AWS Lambda
- AWS Secrets Manager
- LocalStack
- Docker + Docker Compose
- Terraform
- GitHub Actions
- Jest + Supertest
- Multer for file uploads
- Winston for structured logging

## Main Features

- User registration and login
- JWT authentication with protected routes
- CRUD operations for notes
- File upload support to S3
- Event publication to SQS after file attachment
- Lambda consumer for async processing
- Secrets retrieved from AWS Secrets Manager / LocalStack
- IAM-based access management for simulated AWS resources
- Local Docker environment for API, database, and AWS mocks
- Infrastructure as Code with Terraform
- Automated workflow for Lambda ZIP artifact generation

## Architecture

```text
Client
  │
  ▼
NestJS API
  │
  ├── Auth module
  ├── Notes module
  ├── S3 upload service
  ├── SQS producer
  └── PostgreSQL repository
      │
      ├── User + Note entities
      │
      └── fileUrl stored in DB
             │
             ▼
       S3 bucket for attachments
             │
             │  publish FILE_ATTACHED event
             ▼
          SQS queue
             │
             ▼
        Lambda consumer
             │
             └── async processing (example: indexing, validation, post-processing)
```

The main idea is simple: notes without attachments are saved directly to the database, while notes with files trigger an asynchronous process decoupled from the main request flow. This mirrors real-world architectures where storage and post-processing are separated.

## Project Structure

```text
src/
├── app.module.ts
├── app.controller.ts
├── app.service.ts
├── auth/
│   ├── auth.controller.ts
│   ├── auth.module.ts
│   ├── auth.service.ts
│   ├── jwt-auth.guard.ts
│   ├── jwt.strategy.ts
│   ├── dto/
│   │   ├── login.dto.ts
│   │   ├── register.dto.ts
│   │   └── refresh-token.dto.ts
│   └── interfaces/
│       └── authenticated-request.interface.ts
├── entities/
│   ├── note.entity.ts
│   └── user.entity.ts
├── notes/
│   ├── notes.controller.ts
│   └── notes.module.ts
├── service/
│   └── notes.service.ts
├── common/
│   └── logger.ts
├── sqs/
│   ├── sqs.module.ts
│   └── sqs-producer.service.ts
├── lambda/
│   ├── index.ts
│   ├── lambda-sqs-consumer.service.ts
│   └── sqs-consumer.handler.ts
└── main.ts
```

## Prerequisites

- Node.js 18+
- Docker Desktop
- Docker Compose
- Terraform (primarily used in the infrastructure repository, not strictly required to run only the backend locally)
- WSL or a Linux shell if you build the Lambda ZIP locally on Windows

## Local Setup

For the full project flow, the common pattern is to keep the three repositories together at the same level: frontend, backend, and infrastructure. Their folder names may vary depending on the clone, but the relationship between them is the key.

### 1. Start the infrastructure dependencies

Clone or open the complementary infrastructure repository and run the local stack:

```bash
cd ../Lab-infra
docker compose up -d
```

### 2. Install backend dependencies

```bash
cd ../Lab-backend
npm install
```

> Copy the example environment file before running the app locally:
>
> ```bash
> cp .env.example .env
> ```
>
> This creates the local `.env` file used by the NestJS app. Adjust the values if needed for your machine or LocalStack setup.

### 3. Build the Lambda artifact for the infrastructure flow

```bash
npm run build:lambda
```

If needed, you can also build the required compiled artifacts manually:

```bash
npm run build
```

From WSL or a Linux shell if you are generating the ZIP from Windows:

```bash
sudo apt update
sudo apt install -y zip

cd Lab-backend
npx tsc -p tsconfig.lambda.json && mkdir -p lambda-dist && zip -j lambda-dist/sqs-consumer.zip dist/lambda/*
```

The generated ZIP is later consumed by the infrastructure workflow and the LocalStack deployment flow.

### 4. Deploy infrastructure with Terraform

Once LocalStack is running:

```bash
cd ../Lab-infra/infra
terraform init
terraform plan
```

Important: when running Terraform for local development, it is common to pass the Lambda artifact path and the target architecture explicitly:

```bash
terraform apply \
  -var="lambda_zip_path=/absolute/path/to/sqs-consumer.zip" \
  -var="lambda_architecture=x86_64"
```

### 5. Run the API in development mode

```bash
npm run start:dev
```

## API Endpoints

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | /auth/register | No | Register a new user |
| POST | /auth/login | No | Login and receive JWT |
| POST | /auth/refresh | No | Refresh the access token using the refresh token |
| POST | /auth/logout | Yes | Invalidate the authenticated session |
| GET | /notes | Yes | Get the authenticated user notes |
| POST | /notes | Yes | Create a note |
| DELETE | /notes/:id | Yes | Delete a note |
| POST | /notes/:id/attachments | Yes | Upload a file to S3 and save the URL |

## Environment Variables

```env
# AWS Configuration
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test
AWS_REGION=us-east-1
LOCALSTACK_ENDPOINT=http://localhost:4566

# AWS Secrets Manager
SQS_CONFIG_SECRET_ID=sqs/config
DB_CREDENTIALS_SECRET_ID=notesdb/credentials

# Auth
JWT_SECRET=notesapp_jwt_secret_key
JWT_REFRESH_SECRET=notesapp_jwt_refresh_secret_key

# CloudWatch Configuration
CLOUDWATCH_LOG_GROUP=/app/backend
USE_CLOUDWATCH=false
LOG_LEVEL=info
NODE_ENV=development

# S3 Configuration
S3_BUCKET=notes-attachments

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=admin
DB_PASSWORD=admin123
DB_NAME=notesdb

# CORS Configuration
CORS_ORIGIN=http://localhost:4200
```

### Security note

The values shown in this README are example credentials intended only for laboratory and portfolio learning purposes.

In a real production project, credentials should never be published in documentation, source code, or versioned files. In real environments, use managed secrets such as GitHub Secrets, AWS Secrets Manager, or a corporate vault, along with credential rotation and strong, non-predictable values.

## Testing

```bash
npm run test
npm run test:cov
npm run test:e2e
```

## Roadmap

The current state corresponds to the `release/v1.0` tag. The items below were identified during a self-review and are intentionally documented rather than silently deferred, since knowing the gaps and their rationale is part of the engineering work.

### v1.0 — release

- JWT auth with refresh token rotation, hashed refresh tokens stored in the database
- Rate limiting: global 60 req/min, stricter 5 req/min on register and login
- Notes CRUD with per-user ownership checks on every query
- S3 attachments with fire-and-forget SQS event publication with DLQ ready for missing messages and a Lambda consumer
- Secrets resolved from AWS Secrets Manager instead of hardcoded values
- Structured Winston logging with optional CloudWatch transport
- Unit tests above 90% coverage with edge cases and error paths covered

### v1.1 — hardening (next)

These are security and robustness improvements planned for the next iteration and do not affect the current functional flow:

- Add file size limits and MIME type filtering to the upload endpoint. The `FileInterceptor` currently accepts any payload, which leaves the upload path unbounded.
- Add `helmet` for standard security headers (`X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security`).
- Add refresh token reuse detection. The current rotation invalidates the previous token, but a reused token does not yet revoke the whole token family.
- Replace `synchronize: true` with TypeORM migrations and guard the flag behind an environment check.

### v2.0 — production readiness (planned)

- OpenAPI / Swagger documentation via `@nestjs/swagger`
- Database migrations instead of automatic schema synchronization
- Store the S3 object key in the database instead of parsing it back out of the stored URL, so the delete path works with virtual-hosted-style S3 endpoints
- Health and readiness endpoints (`/health`, `/health/db`) for container orchestration
- Unified logging in the Lambda consumer, currently using native `console` calls instead of Winston
- Real e2e coverage over the auth and notes flows, beyond the current single smoke test

## Infrastructure and Deployment Notes

This project was intentionally designed to separate responsibilities:

- Backend repo: API logic and Lambda artifact generation
- Infrastructure repo: Terraform definitions and LocalStack orchestration
- CI/CD: GitHub Actions for artifact generation and deployment automation

This keeps the project aligned with how real-world teams organize application and platform work.

## License

MIT