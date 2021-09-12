import * as path from 'path';

import * as cdk from '@aws-cdk/core';
import * as appsync from '@aws-cdk/aws-appsync';
import * as cognito from '@aws-cdk/aws-cognito';
import * as dynamoDb from '@aws-cdk/aws-dynamodb';

export class BitsapiStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const userPool = this.createUserPool();
    const api = this.api(userPool);

  }

  createUserPool() {
    const userPool = new cognito.UserPool(this, 'BitsUserPool', {
      userPoolName: "bits-users",
      signInAliases: {
        email: true,
      }
    });

    new cognito.UserPoolClient(this, 'bits-api-client"', {
      userPool,
      userPoolClientName: 'bits-api-client'
    });

    return userPool;
  }

  api(userPool: cognito.IUserPool) {
    return new appsync.GraphqlApi(this, "BitsGraphqlApi", {
      name: "bits-api",
      schema: new appsync.Schema({
        filePath: path.join(__dirname, 'api', 'bits-api-schema.graphql')
      }),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.USER_POOL,
          userPoolConfig: { userPool },
        }
      }
    })
  }
}
