################################################################################
# Lambda function and event source mapping (SQS -> Lambda)
################################################################################

resource "aws_lambda_function" "sqs_consumer" {
  # The ZIP is created at the repository root: ../lambda-dist/sqs-consumer.zip
  filename      = "../lambda-dist/sqs-consumer.zip"
  function_name = "${var.project_name}-sqs-consumer"
  role          = aws_iam_role.lambda_role.arn
  handler       = "index.handler"
  runtime       = "nodejs18.x"

  # Only for arm64 processors, this line is because LocalStack and the development environment run on ARM64.
  architectures = ["arm64"]

  # Environment variables can be passed here if needed
  environment {
    variables = {
      NODE_ENV = var.environment
    }
  }
}

resource "aws_lambda_event_source_mapping" "sqs_to_lambda" {
  event_source_arn = aws_sqs_queue.notes_queue.arn
  function_name    = aws_lambda_function.sqs_consumer.arn
  batch_size       = 5
}
