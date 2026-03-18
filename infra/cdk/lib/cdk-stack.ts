import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as path from "path";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";

export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const apiFunction = new NodejsFunction(this, "InventoryApiFunction", {
      runtime: lambda.Runtime.NODEJS_22_X,
      entry: path.join(__dirname, "../../../apps/api/src/lambda.ts"),
      handler: "handler",
      memorySize: 512,
      timeout: cdk.Duration.seconds(10),
      bundling: {
        target: "node22",
      },
      environment: {
        SUPABASE_URL: process.env.SUPABASE_URL ?? "",
        SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
      },
    });

    const functionUrl = apiFunction.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.NONE,
      cors: {
        allowedOrigins: ["https://inventory-saas-web.vercel.app"],
        allowedMethods: [
          lambda.HttpMethod.GET,
          lambda.HttpMethod.POST,
        ],
        allowedHeaders: ["Content-Type", "Authorization"],
      },
    });

    new cdk.CfnOutput(this, "InventoryApiUrl", {
      value: functionUrl.url,
    });
  }
}