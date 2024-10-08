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
DEPLOY_ROLE=arn:aws:iam::654654515013:role/cdk-hnb659fds-deploy-role-654654515013-us-east-1
role=$(aws sts assume-role --role-arn $DEPLOY_ROLE --role-session-name api-deployer-session --duration-seconds 1800)
KEY=$(echo $role | jq -r ".Credentials.AccessKeyId")
SECRET=$(echo $role | jq -r ".Credentials.SecretAccessKey")
TOKEN=$(echo $role | jq -r ".Credentials.SessionToken")
export AWS_ACCESS_KEY_ID=$KEY
export AWS_SESSION_TOKEN=$TOKEN
export AWS_SECRET_ACCESS_KEY=$SECRET
export AWS_DEFAULT_REGION=us-east-1
# aws s3 ls
echo "Zipping files for codedeploy"
# DEPLOYMENT_PACKAGE_NAME="deployment-package-$(date +"%Y%m%d%H%M%S").zip"
sed -i "s|{{WAR_FILE_NAME}}|cas-scheduler.war|g" appspec.yml
# zip -r $DEPLOYMENT_PACKAGE_NAME appspec.yml application_start.sh cas-scheduler.war
echo "Copying zipped files to cross-account S3 bucket which will be utilized for codedeploy"
aws s3 cp cas-scheduler.war $CROSS_ACCOUNT_S3_BUCKET_PATH/ROOT.war
# aws ssm send-command --document-name "AWS-RunShellScript" --targets \'[{"Key":"InstanceIds","Values":["i-04f30b7623100c3b2"]}]\' --parameters \'commands=["sudo /opt/apache-tomcat-9.0.95/bin/shutdown.sh","sudo rm -rf /opt/apache-tomcat-9.0.95/webapps/*", "aws s3 cp s3://test-cicdl3suawsbodhl63-lab/ROOT.war /opt/apache-tomcat-9.0.95/webapps/", "sudo /opt/apache-tomcat-9.0.95/bin/startup.sh"]\' --region us-east-1 
aws ssm send-command \
  --document-name "AWS-RunShellScript" \
  --targets '[{"Key":"InstanceIds","Values":["i-0ac5dbdb0a1551941"]}]' \
  --parameters '{"commands":["sudo /opt/apache-tomcat-9.0.95/bin/shutdown.sh","sudo rm -rf /opt/apache-tomcat-9.0.95/webapps/*", "aws s3 cp s3://prod-deploydevstage-lab/ROOT.war /opt/apache-tomcat-9.0.95/webapps/", "sudo /opt/apache-tomcat-9.0.95/bin/startup.sh"]}' \
  --region us-east-1
