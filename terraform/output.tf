output "api_url" {
  description = "API Gateway URL"
  value       = "${aws_api_gateway_deployment.convert_api_deployment.invoke_url}/convert"
}

output "lambda_function_name" {
  description = "Lambda function name"
  value       = aws_lambda_function.convert_api.function_name
}
