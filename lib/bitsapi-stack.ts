import * as path from 'path';

import * as cdk from '@aws-cdk/core';
import * as appsync from '@aws-cdk/aws-appsync';
import * as cognito from '@aws-cdk/aws-cognito';
import * as dynamoDb from '@aws-cdk/aws-dynamodb';
import { IUserPool } from '@aws-cdk/aws-cognito';
import { getSubscriptionRequestMapper, getSubscriptionResponseMapper, saveSubcriptionRequestMapper, saveSubcriptionResponseMapper } from './api/resolversMappers';

export class BitsapiStack extends cdk.Stack {
  private readonly userPool: cognito.IUserPool;
  private readonly api: appsync.GraphqlApi;
  private readonly bitsUserSubscriptionsDynamoDbTable: dynamoDb.Table;
  private readonly bistUserSubscriptionDataSource: appsync.DynamoDbDataSource;

  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    this.userPool = this.createUserPool();
    this.api = this.createApi();
    this.bitsUserSubscriptionsDynamoDbTable = this.createDynamoTable();
    this.bistUserSubscriptionDataSource = this.createDataSource();
    this.createResolvers();
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


    return bitsUserSubscriptionsDynamoDbTable;
  }

  createDataSource() {
    return new appsync.DynamoDbDataSource(this, 'bits-user-subscriptions', {
      api: this.api,
      table: this.bitsUserSubscriptionsDynamoDbTable,
      name: 'BitsUserSubscriptionsSource'
    });
  }

  createResolvers() {
    new appsync.Resolver(this, "GetSubscriptionsResolver", {
      api: this.api,
      fieldName: 'getSubscriptions',
      typeName: 'Query',
      dataSource: this.bistUserSubscriptionDataSource,
      requestMappingTemplate: appsync.MappingTemplate.fromString(getSubscriptionRequestMapper),
      responseMappingTemplate: appsync.MappingTemplate.fromString(getSubscriptionResponseMapper)
    });

    new appsync.Resolver(this, "SaveSubscriptionsResolver", {
      api: this.api,
      fieldName: 'saveSubscription',
      typeName: 'Mutation',
      dataSource: this.bistUserSubscriptionDataSource,
      requestMappingTemplate: appsync.MappingTemplate.fromString(saveSubcriptionRequestMapper),
      responseMappingTemplate: appsync.MappingTemplate.fromString(saveSubcriptionResponseMapper)
    });
  }

}
