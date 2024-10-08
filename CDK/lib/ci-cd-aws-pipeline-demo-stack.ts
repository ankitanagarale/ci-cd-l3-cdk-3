import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import { Stack, StackProps, CfnOutput, Stage, StageProps } from 'aws-cdk-lib';
import { CodePipeline, CodePipelineSource, ShellStep, CodeBuildStep, ManualApprovalStep  } from 'aws-cdk-lib/pipelines';
import { config } from './config'; // Assuming this imports configuration values
import { MyPipelineAppStage } from './stage';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import * as iam from 'aws-cdk-lib/aws-iam';


export class CiCdAwsPipelineDemoStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const pipeline = new CodePipeline(this, 'Pipeline', {
      crossAccountKeys: true,
      // enableKeyRotation: true,
      pipelineName: 'TestPipeline',
      synth: new CodeBuildStep('Build', {
        input: CodePipelineSource.connection("ankitanagarale/ci-cd-l3-cdk-3", "main", {
          connectionArn: "arn:aws:codeconnections:us-east-1:264852106485:connection/01f5d3b0-8688-4765-a85c-730bdd24aefe",
        }),
        commands: [
          'cp -r CDK test-copy/',
          'mv ./test-copy/CDK ./test-copy/build_artifacts',
          'cd CDK',
          'ls',
          'npm install', 'npm run build', 'npx cdk synth',
          'cp -r cdk.out/* ../test-copy/build_artifacts/',
          'cd ..',
          'cp -r aws/infra/codepipeline/* test-copy/',
          'cd test-copy',
          'ls',
          'chmod +x build.sh',
          './build.sh',
          'ls -al',
          ],
        buildEnvironment: {
          // buildImage: codebuild.LinuxBuildImage.AMAZON_LINUX_2_5,
          buildImage: codebuild.LinuxBuildImage.AMAZON_LINUX_2_5,
        },
        primaryOutputDirectory: './test-copy/build_artifacts',
      }),
      selfMutation: false
    });

    const devStage = pipeline.addStage(new MyPipelineAppStage(this, "dev", {
      env: { account: "954503069243", region: "us-east-1" }
    }));
    // Create an IAM role for the CodeBuildStep
    const devRole = new iam.Role(this, 'devRole-cicd', {
      assumedBy: new iam.ServicePrincipal('codebuild.amazonaws.com'),
      inlinePolicies: {
        AssumeRolePolicy: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              actions: ['sts:AssumeRole'],
              resources: [
                'arn:aws:iam::954503069243:role/cdk-hnb659fds-deploy-role-954503069243-us-east-1',
                'arn:aws:iam::954503069243:role/cdk-hnb659fds-file-publishing-role-954503069243-us-east-1'
              ],
            }),
            new iam.PolicyStatement({
              actions: ['ssm:GetParameter', 'ssm:GetParameters', 'ssm:GetParametersByPath'],
              resources: ['arn:aws:ssm:us-east-1:264852106485:parameter/matson-hello-world/*'],
            }),
          ],
        }),
      },
    });


    // IAM Role for the 'pp' 
    const ppRole = new iam.Role(this, 'ppRole-cicd', {
      assumedBy: new iam.ServicePrincipal('codebuild.amazonaws.com'),
      inlinePolicies: {
        AssumeRolePolicy: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              actions: ['sts:AssumeRole'],
              resources: [
                'arn:aws:iam::891377353125:role/cdk-hnb659fds-deploy-role-891377353125-us-east-1',
                'arn:aws:iam::891377353125:role/cdk-hnb659fds-file-publishing-role-891377353125-us-east-1'
              ],
            }),
            new iam.PolicyStatement({
              actions: ['ssm:GetParameter', 'ssm:GetParameters', 'ssm:GetParametersByPath'],
              resources: ['arn:aws:ssm:us-east-1:264852106485:parameter/matson-hello-world/*'],
            }),
          ],
        }),
      },
    });
    
    const prodRole = new iam.Role(this, 'ProdRole-cicd', {
      assumedBy: new iam.ServicePrincipal('codebuild.amazonaws.com'),
      inlinePolicies: {
        AssumeRolePolicy: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              actions: ['sts:AssumeRole'],
              resources: [
                'arn:aws:iam::654654515013:role/cdk-hnb659fds-deploy-role-654654515013-us-east-1',
                'arn:aws:iam::654654515013:role/cdk-hnb659fds-file-publishing-role-654654515013-us-east-1'
              ],
            }),
            new iam.PolicyStatement({
              actions: ['ssm:GetParameter', 'ssm:GetParameters', 'ssm:GetParametersByPath'],
              resources: ['arn:aws:ssm:us-east-1:264852106485:parameter/matson-hello-world/*'],
            }),
          ],
        }),
      },
    });
    
    devStage.addPost(new CodeBuildStep("Deploy Application", {
      input: pipeline.synth,
      primaryOutputDirectory: '',
      commands: [ 'ls',
                'chmod +x deploy-dev.sh',
                './deploy-dev.sh',
      ],
      buildEnvironment: {
        buildImage: codebuild.LinuxBuildImage.AMAZON_LINUX_2_5,
      },
      env: {
        STAGE: 'dev',
        CROSS_ACCOUNT_S3_BUCKET: 'dev-deploydevstage-lab',
        CROSS_ACCOUNT_S3_BUCKET_PATH: "s3://dev-deploydevstage-lab"
      },
      role: devRole 
    }));

    // testingStage.addPre(new CodeBuildStep("Run Unit Tests", { commands: ['npm install'],
    //   role: testRole // Assign the role to the CodeBuildStep
    //  }));
    // testingStage.addPost(new ManualApprovalStep('Manual approval before production'));
    // testingStage.addPost(new ManualApprovalStep('ManualApprovalBeforeProd'));
     // SNS-Triggered Manual Approval Step
    // testingStage.addPost(new ManualApprovalStep('ManualApprovalBeforeProd'));
     
    const ppStage = pipeline.addStage(new MyPipelineAppStage(this, "pp", {
      env: { account: "891377353125", region: "us-east-1" }
    }));
    ppStage.addPost(new CodeBuildStep("Deploy to pp", {
      input: pipeline.synth,
      primaryOutputDirectory: '',
      commands: [ 'ls',
                'chmod +x deploy-pp.sh',
                './deploy-pp.sh',
      ],
      buildEnvironment: {
        buildImage: codebuild.LinuxBuildImage.AMAZON_LINUX_2_5,
      },
      env: {
        STAGE: 'pp',
        CROSS_ACCOUNT_S3_BUCKET: 'pp-deploydevstage-lab',
        CROSS_ACCOUNT_S3_BUCKET_PATH: "s3://pp-deploydevstage-lab"
      },
      role: ppRole // Ensure the same role or a role with similar permissions in the dev account
    }));

    
  
    const prodStage = pipeline.addStage(new MyPipelineAppStage(this, "prod", {
      env: { account: "654654515013", region: "us-east-1" }
    }));
    prodStage.addPre(new ManualApprovalStep('ManualApprovalBeforeProd'));

    prodStage.addPost(new CodeBuildStep("Deploy to prod", {
      input: pipeline.synth,
      primaryOutputDirectory: '',
      commands: [ 'ls',
                'chmod +x deploy-prod.sh',
                './deploy-prod.sh',
      ],
      buildEnvironment: {
        buildImage: codebuild.LinuxBuildImage.AMAZON_LINUX_2_5,
      },
      env: {
        STAGE: 'prod',
        CROSS_ACCOUNT_S3_BUCKET: 'prod-deploydevstage-lab',
        CROSS_ACCOUNT_S3_BUCKET_PATH: "s3://prod-deploydevstage-lab"
      },
      role: prodRole // Ensure the same role or a role with similar permissions in the dev account
    }));

    
  }
}
