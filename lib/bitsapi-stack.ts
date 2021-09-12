import * as path from 'path';

import * as cdk from '@aws-cdk/core';
import * as appsync from '@aws-cdk/aws-appsync';
import * as cognito from '@aws-cdk/aws-cognito';
import * as dynamoDb from '@aws-cdk/aws-dynamodb';
import { IUserPool } from '@aws-cdk/aws-cognito';

export class BitsapiStack extends cdk.Stack {
  private readonly userPool: cognito.IUserPool;
  private readonly api: appsync.GraphqlApi;
  private readonly bitsUserSubscriptionsDynamoDbTable: dynamoDb.Table;

  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    this.userPool = this.createUserPool();
    this.api = this.createApi();
    this.bitsUserSubscriptionsDynamoDbTable = this.createDynamoTable();

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

  createApi() {
    return new appsync.GraphqlApi(this, "BitsGraphqlApi", {
      name: "bits-api",
      schema: new appsync.Schema({
        filePath: path.join(__dirname, 'api', 'bits-api-schema.graphql')
      }),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.USER_POOL,
          userPoolConfig: { userPool: this.userPool },
        }
      }
    })
  }

  createDynamoTable() {
    const bitsUserSubscriptionsDynamoDbTable = new dynamoDb.Table(this, 'BitsDynamoDbTable', {
      billingMode: dynamoDb.BillingMode.PAY_PER_REQUEST,
      partitionKey: { name: 'PK', type: dynamoDb.AttributeType.STRING },
      sortKey: { name: 'USERID', type: dynamoDb.AttributeType.STRING },
      tableName: 'bits-users-subscriptions'
    });

    new appsync.DynamoDbDataSource(this, 'bits-user-subscriptions', {
      api: this.api,
      table: bitsUserSubscriptionsDynamoDbTable,
      name: 'BitsUserSubscriptionsSource'
    });
    return bitsUserSubscriptionsDynamoDbTable;
  }


}
