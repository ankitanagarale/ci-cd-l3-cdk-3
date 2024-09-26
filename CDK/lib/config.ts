export const config = {
    gitHubUser: 'subodh6',
    gitHubRepo: 'subodh6/hello-world-cdkl3-1',
    gitHubBranch: 'main',
    codeBuildEnvironmentType: 'LINUX_CONTAINER',
    codeBuildComputeType: 'BUILD_GENERAL1_SMALL',
    codeBuildImage: 'aws/codebuild/amazonlinux2-x86_64-standard:5.0',
    labAccountId: '264852106485',
    sourcestage: 'Source-stage',
    buildstage: 'Build-stage',
   codeStarConnectionArn: 'arn:aws:codeconnections:us-east-1:264852106485:connection/34df75a1-47fe-460d-ad44-2b3f37911bc9',
   codeStarRoleArn: 'arn:aws:codeconnections:us-east-1:891377353125:connection/*',
    bucketLifecyclePolicy: {
      id: 'lifecycle-policy',
      status: 'Enabled',
      prefix: 'SourceArti/',
      transitionInDays: 30,
      expirationInDays: 300,
    },
    buildSpecs: {
      lab: 'cdk-matson-cross-account/buildspec.yml',
      // lab: 'buildspec-sratch.yml',
    },
  
  };
  