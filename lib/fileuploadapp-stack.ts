import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import { Code, Function, Runtime } from 'aws-cdk-lib/aws-lambda';
import { join } from 'path';
import { RestApi } from 'aws-cdk-lib/aws-apigateway';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambdaTriggers from "aws-cdk-lib/aws-lambda-event-sources";
const REGION = "us-east-1";
const BUCKET_NAME = 'bucket_for_file_upload';
const crypto_1 = require("crypto");


export class FileuploadappStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

      //create s3 bucket
    const FILES_STORE = new s3.Bucket(this, BUCKET_NAME,{
      cors: [
        {
          allowedMethods: [
            s3.HttpMethods.GET,
            s3.HttpMethods.POST,
            s3.HttpMethods.PUT,
          ],
          allowedOrigins: ['*'],
          allowedHeaders: ['*'],
        },
      ],
      publicReadAccess: false,
      removalPolicy : cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects : true
    });
    //create policy for lambda
    const LAMBDA_POLICY = new iam.PolicyStatement();
    LAMBDA_POLICY.addActions('s3:PutObject', 'dynamodb:GetItem', 'dynamodb:PutItem', 'dynamodb:Query');
    LAMBDA_POLICY.addResources(`${FILES_STORE.bucketArn}/*`);

    //lambda function to get presigned url
    const GET_PRESIGNED_URL = new Function(this, 'getPresignedUrlApp.handler',{
      runtime : Runtime.NODEJS_16_X,
      memorySize : 512,
      code: Code.fromAsset(join(__dirname,'../lambda')),
      handler : 'getPresignedUrlApp.handler',
      environment: {
        'BUCKET': FILES_STORE.bucketName,
        'REGION': REGION
      },
      initialPolicy : [LAMBDA_POLICY]
    });
   

    /*
    //api gateway
    const api = new RestApi(this,'file_upload_api',{
      description : 'This is a sample api'
      defaultCorsPreflightOptions: {
        allowOrigins: ApiGateway.Cors.ALL_ORIGINS,
        allowMethods: ApiGateway.Cors.ALL_METHODS,
        allowHeaders: ['*'],
      }
    });
    const mainpath = api.root.addResource("presignedUrl");
    mainpath.addMethod("GET", new apigateway.LambdaIntegration(getPresignedUrl));

    */

  }
}
