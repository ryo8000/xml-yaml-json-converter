variable "project_name" {
  description = "This project name"
  type        = string
  default     = "convert-api"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "dev"
}

variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

variable "lambda_application_log_level" {
  description = "Application log level for Lambda function (DEBUG, INFO, WARN, ERROR)"
  type        = string
  default     = "INFO"
}

variable "lambda_system_log_level" {
  description = "System log level for Lambda function runtime (DEBUG, INFO, WARN, ERROR)"
  type        = string
  default     = "INFO"
}

variable "lambda_memory" {
  description = "Lambda function memory in MB"
  type        = number
  default     = 128
}

variable "lambda_runtime" {
  description = "Lambda function runtime"
  type        = string
  default     = "nodejs22.x"
}

variable "lambda_timeout" {
  description = "Lambda function timeout in seconds"
  type        = number
  default     = 10
}
