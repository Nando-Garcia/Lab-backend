<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## Infrastructure as Code (Terraform)

### Directory: `./infra/`

Contiene toda la configuración de infraestructura usando Terraform.

**Archivos:**
- `main.tf` - Provider configuration y endpoints de LocalStack
- `variables.tf` - Variables reutilizables
- `iam.tf` - IAM roles y policies
- `outputs.tf` - Outputs útiles después del deploy

### Estructura de Ramas de Infraestructura:

1. **feature/iam-baseline** (ACTUAL)
   - Crea IAM role base para Lambda
   - Policy para CloudWatch Logs
   - No modifica SQS (ya existe)

2. **feature/lambda-consumer** (SIGUIENTE)
   - Crea Lambda function
   - Extender IAM con SQS permissions
   - Event source mapping SQS → Lambda

3. **feature/s3-attachments** (SIGUIENTE)
   - Crea S3 bucket para attachments
   - Extender IAM con S3 permissions
   - Lambda extended para upload a S3

4. **feature/terraform-infrastructure** (FINAL)
   - Codificar SQS/DLQ en Terraform
   - Consolidar toda la infraestructura
   - Deploy a AWS real (cuando se necesite)

### Inicializar Terraform (LocalStack):

```bash
cd infra/

# Inicializar Terraform
terraform init

# Ver qué se va a crear (plan)
terraform plan

# Aplicar la configuración
terraform apply

# Ver los outputs
terraform output
```

### Environment:

Terraform usa los defaults de `variables.tf`:
- `aws_region` = "us-east-1"
- `project_name` = "notes"
- `environment` = "development"

Para cambiarlos, crea `infra/terraform.tfvars`:
```hcl
aws_region = "us-east-1"
project_name = "notes"
environment = "development"
```

### Limpiar (Destroy):

```bash
cd infra/
terraform destroy
```

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).


## AWS SECRETS MANAGER

1. Instalcion de SDK:
npm install @aws-sdk/client-secrets-manager

Al no tener instalado AWS CLI se puede crear con Postman:
- Method:   POST
- URL:      http://localhost:4566
- Headers:
          Content-Type: application/x-amz-json-1.1
          X-Amz-Target: secretsmanager.CreateSecret
- Body (raw JSON)
{
  "Name": "notesdb/credentials",
  "SecretString": "{\"username\":\"user\",\"password\":\"pass\",\"host\":\"localhost\",\"port\":5432,\"database\":\"dbname\"}"
}

2. Verificar secret creado:

- Method:   POST
- URL:      http://localhost:4566
- Headers:
Content-Type: application/x-amz-json-1.1
X-Amz-Target: secretsmanager.GetSecretValue
- Body (raw JSON):
{
  "SecretId": "notesdb/credentials"
}

3. Instalacion de AWSCLI para verificar recursos creados (NOTA: version usada ARM64, uname -m para ver la arquitectura del procesador):
Desde WSL:
- sudo apt update
- curl "https://awscli.amazonaws.com/awscli-exe-linux-aarch64.zip" -o "awscliv2.zip"
- unzip awscliv2.zip
- sudo ./aws/install

Verificar:
- aws --version

3.1. Configuracion:
- aws configure
- AWS Access Key ID: test
- AWS Secret Access Key: test
- Default region name: us-east-1
- Default output format: json

Tip: Para evitar q se conecte a AWS real (estando localstack detenido) crear perfil y agregar las mismas credenciales de arriba:
- aws configure --profile localstack


Ej.
Listar servicio S3 creados en localstack
- aws --endpoint-url=http://localhost:4566 s3 ls
- aws --profile localstack --endpoint-url=http://localhost:4566 s3 ls        (con perfil creado -localstack-, apaso de arriba-Tip)


## JWT

Archivos nuevos en backend/src/auth/:

auth.module.ts — Módulo con JWT y Passport
auth.controller.ts — Endpoints POST /auth/register y POST /auth/login
auth.service.ts — Lógica de registro (bcrypt hash) y login (genera JWT)
jwt.strategy.ts — Estrategia Passport para validar bearer tokens
jwt-auth.guard.ts — Guard reutilizable
user.entity.ts — Entidad users (id, username, password)

Archivos modificados:

main.ts — CORS habilitado para http://localhost:4200
app.module.ts — AuthModule importado
notes.controller.ts — Endpoints protegidos con @UseGuards(JwtAuthGuard)

Endpoints del backend:

Método	Ruta	Auth	Descripción
POST	/auth/register	No	Registro con { username, password }
POST	/auth/login	No	Login, retorna { access_token }
GET	/notes	JWT	Listar notas
POST	/notes	JWT	Crear nota { title, content }

## Notes by user

Archivos modificados:
---

Archivo	            Cambio
note.entity.ts	    Agregado @ManyToOne → User + columna userId
user.entity.ts	    Agregado @OneToMany → Note[]
notes.controller.ts	Extrae req.user.userId del JWT y lo pasa al servicio
notes.service.ts	findAllByUser(userId) filtra por usuario, create() asigna el userId

NOTA: al iniciar el backen crea automaticamente 

## AWS - SQS/DLQ

crear cola DLQ y cola SQS primero, se puede ejecutar desde powershell, porq ocupa docker exec:

> crear cola DLQ y SQS
  ```bash
  docker exec localstack-lab awslocal sqs create-queue --queue-name notes-dlq --region us-east-1

  docker exec localstack-lab awslocal sqs create-queue --queue-name notes-queue --region us-east-1
  ```

> Asignar atributos a cola SQS con redrive policy apuntando a la DLQ: 
NOTA: crearlo desde bash 
```bash
  docker exec localstack-lab awslocal sqs set-queue-attributes \
    --queue-url http://sqs.us-east-1.localhost.localstack.cloud:4566/000000000000/notes-queue \
    --region us-east-1 \
    --attributes '{"RedrivePolicy":"{\"deadLetterTargetArn\":\"arn:aws:sqs:us-east-1:000000000000:notes-dlq\",\"maxReceiveCount\":\"3\"}"}'
  ```


Verificar: 
  ```bash
  docker exec localstack-lab awslocal sqs list-queues --region us-east-1

  docker exec localstack-lab awslocal sqs get-queue-attributes --queue-url http://sqs.us-east-1.localhost.localstack.cloud:4566/000000000000/notes-queue --attribute-names All --region us-east-1
  ```

NOTA: Se deben crear primero ambas colas (SQS, DLQ en bash para evitar problemas de escaping en powershell) y despues crear los secrets (BD y SQS) para levantar el back

Código:
dependencies:     "@aws-sdk/client-sqs": "^3.1031.0"

El consumer se inclouye en esta rama simulando un procesamiento de la cola SQS una vez creado el mensaje 'sqs-consumer.service.ts' este fichero se eliminara una vez implementada la lamnda por ahora realiza un pooling cada 5 segundos para preguntar sobre la cola SQS

Verificar que el proceso del backend elimino el mensaje de la cola SQS:
  ```bash
  docker exec localstack-lab awslocal sqs get-queue-attributes \
    --queue-url http://sqs.us-east-1.localhost.localstack.cloud:4566/000000000000/notes-queue \
    --attribute-names ApproximateNumberOfMessages --region us-east-1
  ``` 
  > Esperas ver: "ApproximateNumberOfMessages": "0"


Probar DLQ:
1. Back detenido, Ctl + C
2. Mandar mensaje manualmente a la cola SQS, usar bash:

Crear mensaje en cola SQS:
  ```bash
  docker exec localstack-lab awslocal sqs send-message \
    --queue-url http://sqs.us-east-1.localhost.localstack.cloud:4566/000000000000/notes-queue \
    --message-body '{"event":"NOTE_CREATED","noteId":999,"userId":1,"timestamp":"2026-04-20T00:00:00Z"}' \
    --region us-east-1
  ```

3. Verificar con el paso de arriba
4. Cambiar tempralmente el VisibilityTimeout a 0 (30, valor por defecto por aws) ya que es el timepo para el mensaje sea procesado por lambda, consumer, etc, si no lo hace el mensaje se vuelve "visible" y comienza el conteo a 3 para mandarlo a DLQ

Cambiar VisibilityTimeout a 0, regresarlo a 30 tras la prueba:
  ```bash
  docker exec localstack-lab awslocal sqs set-queue-attributes \
    --queue-url http://sqs.us-east-1.localhost.localstack.cloud:4566/000000000000/notes-queue \
    --attributes VisibilityTimeout=0 --region us-east-1
  ```
5. Iniciar el back: se imprimiran los logs del error 3 veces

Verificar la cola DLQ:
  ```bash
  docker exec localstack-lab awslocal sqs get-queue-attributes \
    --queue-url http://sqs.us-east-1.localhost.localstack.cloud:4566/000000000000/notes-dlq \
    --attribute-names ApproximateNumberOfMessages --region us-east-1
  ```
6. Comentar el throw y regresar VisibilityTimeout a 30


## AWS - CloudWatch (Observabilidad)

Instalación de SDK:
npm install winston winston-cloudwatch

### Crear Log Groups en LocalStack:

```bash
# Crear Log Group para backend
docker exec localstack-lab awslocal logs create-log-group \
  --log-group-name /app/backend \
  --region us-east-1

# Crear Log Stream para backend
docker exec localstack-lab awslocal logs create-log-stream \
  --log-group-name /app/backend \
  --log-stream-name backend-dev \
  --region us-east-1

# Crear Log Group para SQS processing
docker exec localstack-lab awslocal logs create-log-group \
  --log-group-name /app/sqs-processing \
  --region us-east-1

# Crear Log Stream para SQS processing
docker exec localstack-lab awslocal logs create-log-stream \
  --log-group-name /app/sqs-processing \
  --log-stream-name sqs-dev \
  --region us-east-1
```

### Verificar Log Groups creados:

```bash
docker exec localstack-lab awslocal logs describe-log-groups --region us-east-1
```

### Estructura de logs implementados:

**NotesService:**
- `[NOTE_CREATE_START]` - Cuando inicia la creación de una nota
- `[NOTE_CREATE_SUCCESS]` - Cuando la nota se guardó exitosamente y se envía a SQS
- `[NOTE_CREATE_FAILED]` - Cuando hay error en la creación
- `[NOTES_FIND_START]` - Cuando busca notas de un usuario
- `[NOTES_FIND_SUCCESS]` - Cuando encuentra notas
- `[NOTES_FIND_EMPTY]` - Cuando no hay notas para ese usuario
- `[NOTES_FIND_FAILED]` - Cuando hay error en la búsqueda

**SqsProducerService:**
- `[SQS_MESSAGE_SEND_START]` - Antes de enviar mensaje a la cola
- `[SQS_MESSAGE_SENT]` - Cuando el mensaje se envió exitosamente
- `[SQS_MESSAGE_SEND_FAILED]` - Cuando hay error enviando a SQS

**SqsConsumerService:**
- `[SQS_CONSUMER_STARTED]` - Cuando el consumer inicia
- `[SQS_CONSUMER_STOPPED]` - Cuando el consumer se detiene
- `[SQS_MESSAGES_RECEIVED]` - Cuando recibe mensajes de la cola
- `[SQS_MESSAGE_PROCESSING]` - Cuando procesa un mensaje
- `[SQS_MESSAGE_DELETED]` - Cuando elimina un mensaje de la cola (procesado)
- `[SQS_MESSAGE_ERROR]` - Cuando hay error procesando un mensaje
- `[SQS_POLLING_ERROR]` - Cuando hay error en el polling

### Consultar logs en LocalStack:

```bash
# Ver logs del backend
docker exec localstack-lab awslocal logs filter-log-events \
  --log-group-name /app/backend \
  --region us-east-1

# Ver logs con búsqueda (ej: solo errores)
docker exec localstack-lab awslocal logs filter-log-events \
  --log-group-name /app/backend \
  --filter-pattern "[ERROR]" \
  --region us-east-1

# Ver últimos 50 eventos
docker exec localstack-lab awslocal logs filter-log-events \
  --log-group-name /app/backend \
  --start-time $(($(date +%s)*1000 - 3600000)) \
  --region us-east-1
```

### Características implementadas:

- ✓ Logs estructurados en JSON
- ✓ Timestamps automáticos
- ✓ Metadatos contextuales (userId, noteId, etc)
- ✓ Error tracking con stack trace
- ✓ Log levels: info, warn, error
- ✓ Console en desarrollo, CloudWatch en producción
- ✓ Integrabilidad con futuros dashboards y alarmas

**Notas:**
- Los logs se envían a consola en desarrollo
- En .env puedes cambiar LOG_LEVEL a 'debug' para mayor detalle
- Los logs con contexto facilitarán debugging en análisis de problemas
- Esta rama prepara el terreno para agregar Alarmas y Dashboards en Terraform


## AWS - CLOUDWATCH
Pueden colocarse solo console.log() pero para trabajar los logs de forma mas profesional se usan logger.log() mediante librerias como Winston/Pino para logs estructurados y winston-cloudwatch para el transport

> CloudWatch es el "centro de observabilidad" de AWS
  - Logs (texto)
  - Metrics (números/gráficos)
  - Events (disparadores)

Fase 1:
  - Agregar librerías de logging (Winston/Pino)
  - Escribir logs en el código (logger.log())
  - Configurar para que "busque" Log Groups en CloudWatch

  FASE 2: Crear infraestructura con Terraform (DESPUÉS)
  - Define Log Groups en Terraform
  - Define Log Streams en Terraform
  - Define Dashboards en Terraform
  - Define Alarms en Terraform

```bash
# 1. Crear Log Group
docker exec localstack-lab awslocal logs create-log-group \
  --log-group-name /app/backend \
  --region us-east-1

# 2. Crear Log Stream
docker exec localstack-lab awslocal logs create-log-stream \
  --log-group-name /app/backend \
  --log-stream-name backend-dev \
  --region us-east-1

# 3. Verificar que se crearon
docker exec localstack-lab awslocal logs describe-log-groups \
  --region us-east-1

# 4. Crear otro Log Group para SQS Consumer
docker exec localstack-lab awslocal logs create-log-group \
  --log-group-name /app/sqs-processing \
  --region us-east-1
```