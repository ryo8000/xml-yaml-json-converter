output "api_url" {
  description = "API Gateway URL"
  value       = "${aws_api_gateway_stage.convert_resource_stage.invoke_url}/convert"
}

output "lambda_function_name" {
  description = "Lambda function name"
  value       = aws_lambda_function.convert_api.function_name
}
