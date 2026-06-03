################################################################################
# Outputs - Información útil después del deploy
################################################################################

output "lambda_role_arn" {
  description = "ARN of Lambda execution role"
  value       = aws_iam_role.lambda_role.arn
}

output "lambda_role_name" {
  description = "Name of Lambda execution role"
  value       = aws_iam_role.lambda_role.name
}

output "lambda_role_id" {
  description = "ID of Lambda execution role"
  value       = aws_iam_role.lambda_role.id
}
