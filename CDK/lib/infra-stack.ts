import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import { Function, InlineCode, Runtime, Code} from 'aws-cdk-lib/aws-lambda';
// import * as path from 'path';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as codedeploy from 'aws-cdk-lib/aws-codedeploy';
import { config } from './config';
import * as s3 from 'aws-cdk-lib/aws-s3';
 
 
 
export class MyInfraStack extends cdk.Stack {
    constructor(scope: Construct, id: string, stageName: string, props?: cdk.StackProps) {
      super(scope, id, props);
   
      new s3.Bucket(this, 'CodePipelineBucket', {
        bucketName: `${this.stackName}-lab`,
        lifecycleRules: [{
          id: config.bucketLifecyclePolicy.id,
          enabled: config.bucketLifecyclePolicy.status === 'Enabled',
          prefix: config.bucketLifecyclePolicy.prefix,
          transitions: [{
            storageClass: s3.StorageClass.INTELLIGENT_TIERING,
            transitionAfter: cdk.Duration.days(config.bucketLifecyclePolicy.transitionInDays),
          }],
          expiration: cdk.Duration.days(config.bucketLifecyclePolicy.expirationInDays),
        }],
        removalPolicy: cdk.RemovalPolicy.DESTROY,
      });
 
      // Create CodeDeploy Role with stack name in the role name
      const codeDeployRole = new iam.Role(this, 'CodeDeployRole', {
        roleName: `${this.stackName}-code-deploy-role`,
        assumedBy: new iam.ServicePrincipal(`codedeploy.${cdk.Stack.of(this).region}.amazonaws.com`), // Dynamic region
        inlinePolicies: {
          CodeDeployPermissions: new iam.PolicyDocument({
            statements: [
              new iam.PolicyStatement({
                actions: [
                  "ec2:Describe*",
                  "s3:Get*",
                  "s3:List*",
                ],
                resources: ["*"],
              }),
            ],
          }),
        },
      });
     
      // Create CodeDeploy Application with stack name in the application name
      const codeDeployApplication = new codedeploy.ServerApplication(this, 'CodeDeployApplication', {
        applicationName: `${this.stackName}-application`,
      });
 
      // Create CodeDeploy Deployment Group with stack name in the deployment group name
      new codedeploy.ServerDeploymentGroup(this, 'DeploymentGroup', {
        application: codeDeployApplication,
        deploymentGroupName: `${this.stackName}-deploygroup`, 
        role: codeDeployRole,
        ec2InstanceTags: new codedeploy.InstanceTagSet({
          'Name': ['matson'], 
        }),
        autoRollback: {
          failedDeployment: true,
        },
        deploymentConfig: codedeploy.ServerDeploymentConfig.ALL_AT_ONCE,
      });
    }
   
   
}
