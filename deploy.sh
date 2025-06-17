#!/bin/bash

set -e

echo "🚀 Starting deployment process..."

# Create deployment package
echo "📦 Creating deployment package..."
npm run package

# Initialize Terraform if needed
if [ ! -d "terraform/.terraform" ]; then
    echo "🔧 Initializing Terraform..."
    cd terraform
    terraform init
    cd ..
fi

# Plan Terraform changes
echo "📋 Planning Terraform changes..."
cd terraform
terraform plan

# Apply Terraform changes
echo "🚀 Deploying infrastructure..."
terraform apply -auto-approve

echo "✅ Deployment complete!"
echo "📋 API URL:"
terraform output -raw api_url

cd ..
