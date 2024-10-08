import * as cdk from 'aws-cdk-lib';
import { Construct } from "constructs";
import { MyInfraStack } from './infra-stack';

export class MyPipelineAppStage extends cdk.Stage {
    
    constructor(scope: Construct, stageName: string, props?: cdk.StageProps) {
      super(scope, stageName, props);
      new MyInfraStack(this, 'deploystage', stageName);      
    }
}
