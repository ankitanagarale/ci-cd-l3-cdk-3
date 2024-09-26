#!/bin/bash

echo "Skipping yum update..."
echo "version controller"
yum update -y
yum install jq -y
yum install zip -y
ls
echo "Source artifact reference: $CODEBUILD_SOURCE_VERSION"
echo "Running build commands for lab stages..."
mkdir build_artifacts
cp cas-scheduler.war buildspec-lab.yml appspec.yml application_start.sh build_artifacts/
echo "Downloading finished"
echo "Extracting and assuming Deployer role for cross account"
param_name="/matson-hello-world/$STAGE/deploy/role"
# DEPLOY_ROLE=$(aws ssm get-parameter --name $param_name --with-decryption | jq -r ".Parameter.Value")
DEPLOY_ROLE=arn:aws:iam::954503069243:role/cdk-hnb659fds-deploy-role-954503069243-ap-south-1
role=$(aws sts assume-role --role-arn $DEPLOY_ROLE --role-session-name api-deployer-session --duration-seconds 1800)
KEY=$(echo $role | jq -r ".Credentials.AccessKeyId")
SECRET=$(echo $role | jq -r ".Credentials.SecretAccessKey")
TOKEN=$(echo $role | jq -r ".Credentials.SessionToken")
export AWS_ACCESS_KEY_ID=$KEY
export AWS_SESSION_TOKEN=$TOKEN
export AWS_SECRET_ACCESS_KEY=$SECRET
export AWS_DEFAULT_REGION=ap-south-1
aws s3 ls
echo "Zipping files for codedeploy"
DEPLOYMENT_PACKAGE_NAME="deployment-package-$(date +"%Y%m%d%H%M%S").zip"
sed -i "s|{{WAR_FILE_NAME}}|cas-scheduler.war|g" appspec.yml
zip -r $DEPLOYMENT_PACKAGE_NAME appspec.yml application_start.sh cas-scheduler.war
echo "Copying zipped files to cross-account S3 bucket which will be utilized for codedeploy"
aws s3 cp $DEPLOYMENT_PACKAGE_NAME $CROSS_ACCOUNT_S3_BUCKET_PATH/$DEPLOYMENT_PACKAGE_NAME
aws sts get-caller-identity
echo "Codedeploy deployment started"
aws deploy create-deployment \
  --application-name test-cross-teest-680-application \
  --deployment-config-name CodeDeployDefault.OneAtATime \
  --deployment-group-name test-cross-teest-680-deploygroup \
  --description "Deployment Description" \
  --s3-location bucket=$CROSS_ACCOUNT_S3_BUCKET,bundleType=zip,key=$DEPLOYMENT_PACKAGE_NAME \
  --region ap-south-1
echo "Waiting for deployment to complete..."
deploymentId=$(aws deploy list-deployments \
  --application-name test-cross-teest-680-application \
  --deployment-group-name test-cross-teest-680-deploygroup \
  --region ap-south-1 \
  --query 'deployments[0]' --output text)
aws deploy wait deployment-successful --deployment-id $deploymentId --region ap-south-1

