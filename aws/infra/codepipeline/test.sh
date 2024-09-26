#!/bin/bash
 
VERSION="0.2"
 
# Install phase

echo "Skipping yum update..."

pip install boto3
 
# Pre-build phase

echo "version controller"

sudo yum update -y

sudo yum install jq -y

sudo yum install zip -y

pip install requests

pip install ruamel.yaml
 
# Build phase

echo "Source artifact reference: $CODEBUILD_SOURCE_VERSION"

echo "Build started"
 
echo "Integration of CodeArtifact and authorizing"
 

echo "Build Initiated"

mvn clean install -s settings.xml

echo "Build Completed"
 
# Post-build phase

echo "Downloading Required files for codedeploy"
 

cp target/cas-scheduler-admin-1.0.2.war .
 

mv cas-scheduler-admin-1.0.2.war cas-scheduler.war
 
cp -R cas-scheduler.war buildspec-lab.yml appspec.yml application_start.sh test2.sh build_artifacts
 
echo "Build artifacts prepared:"

ls build_artifacts

 
