terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  required_version = ">= 1.2.0"
}

provider "aws" {
  region = var.aws_region
}

resource "aws_iam_role" "lambda_execution_role" {
  name = "${var.project_name}-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_basic_execution" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
  role       = aws_iam_role.lambda_execution_role.name
}

resource "aws_lambda_function" "convert_api" {
  filename      = "../lambda-deployment.zip"
  function_name = "${var.project_name}-${var.environment}"
  role          = aws_iam_role.lambda_execution_role.arn
  handler       = "dist/handler.handler"
  runtime       = var.lambda_runtime
  timeout       = var.lambda_timeout
  memory_size   = var.lambda_memory

  depends_on = [
    aws_iam_role_policy_attachment.lambda_basic_execution,
  ]
}

resource "aws_lambda_permission" "api_gateway" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.convert_api.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_api_gateway_rest_api.convert_api.execution_arn}/*/*"
}

resource "aws_api_gateway_rest_api" "convert_api" {
  name        = "${var.project_name}-${var.environment}"
  description = "API for format conversion between JSON, XML, and YAML"

  endpoint_configuration {
    types = ["REGIONAL"]
  }
}

resource "aws_api_gateway_resource" "convert_resource" {
  rest_api_id = aws_api_gateway_rest_api.convert_api.id
  parent_id   = aws_api_gateway_rest_api.convert_api.root_resource_id
  path_part   = "convert"
}

resource "aws_api_gateway_method" "convert_post" {
  rest_api_id   = aws_api_gateway_rest_api.convert_api.id
  resource_id   = aws_api_gateway_resource.convert_resource.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_method" "convert_options" {
  rest_api_id   = aws_api_gateway_rest_api.convert_api.id
  resource_id   = aws_api_gateway_resource.convert_resource.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "lambda_integration" {
  rest_api_id = aws_api_gateway_rest_api.convert_api.id
  resource_id = aws_api_gateway_resource.convert_resource.id
  http_method = aws_api_gateway_method.convert_post.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.convert_api.invoke_arn
}

resource "aws_api_gateway_integration" "lambda_integration_options" {
  rest_api_id = aws_api_gateway_rest_api.convert_api.id
  resource_id = aws_api_gateway_resource.convert_resource.id
  http_method = aws_api_gateway_method.convert_options.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.convert_api.invoke_arn
}

resource "aws_api_gateway_deployment" "convert_api_deployment" {
  depends_on = [
    aws_api_gateway_integration.lambda_integration,
    aws_api_gateway_integration.lambda_integration_options,
  ]

  rest_api_id = aws_api_gateway_rest_api.convert_api.id
}

resource "aws_api_gateway_stage" "convert_resource_stage" {
  rest_api_id   = aws_api_gateway_rest_api.convert_api.id
  deployment_id = aws_api_gateway_deployment.convert_api_deployment.id
  stage_name    = var.environment
}
