import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as s3n from 'aws-cdk-lib/aws-lambda-event-sources';

export class RealTimeCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create S3 bucket
    const bucket = new s3.Bucket(this, 'MyRealTimeBucket', {
      removalPolicy: cdk.RemovalPolicy.DESTROY, // NOT for production!
      autoDeleteObjects: true, // NOT for production!
    });

    // Create Lambda function
    const lambdaFn = new lambda.Function(this, 'MyRealTimeLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda'),
      environment: {
        BUCKET_NAME: bucket.bucketName,
      },
      timeout: cdk.Duration.seconds(10),
    });

    // Grant Lambda permissions to read from bucket
    bucket.grantRead(lambdaFn);

    // Add S3 event source to Lambda
    lambdaFn.addEventSource(new s3n.S3EventSource(bucket, {
      events: [s3.EventType.OBJECT_CREATED],
      filters: [{ prefix: '', suffix: '' }], // can filter files by prefix/suffix if needed
    }));

    // Outputs
    new cdk.CfnOutput(this, 'BucketNameOutput', {
      value: bucket.bucketName,
      description: 'The S3 bucket name',
    });

    new cdk.CfnOutput(this, 'LambdaFunctionArnOutput', {
      value: lambdaFn.functionArn,
      description: 'The Lambda function ARN',
    });
  }
}
