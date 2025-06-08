#!/bin/bash

set -e

echo "🗑️ Starting AWS resource destruction..."

# Initialize Terraform if needed
if [ ! -d "terraform/.terraform" ]; then
    echo "🔧 Initializing Terraform..."
    cd terraform
    terraform init
    cd ..
fi

# Show what will be destroyed
echo "📋 Planning destruction..."
cd terraform
terraform plan -destroy

# Destroy the infrastructure
echo "🔥 Destroying AWS resources..."
terraform destroy -auto-approve
cd ..

# Clean up local artifacts
echo "🧹 Cleaning up local artifacts..."
rm -f lambda-deployment.zip
rm -rf dist/

echo "✅ AWS resources destroyed successfully!"
echo "💡 Note: This script does not delete the Terraform state file. If you want to completely reset, you may need to manually delete terraform.tfstate files."
