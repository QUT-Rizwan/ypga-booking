terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket         = "yoga-booking-tf-state"
    key            = "prod/terraform.tfstate"
    region         = "ap-southeast-2"
    dynamodb_table = "yoga-booking-tf-lock"
    encrypt        = true
  }
}

provider "aws" {
  region = var.aws_region
}
