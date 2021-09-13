import { expect as expectCDK, matchTemplate, MatchStyle, haveResource } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as Bitsapi from '../lib/bitsapi-stack';

describe('Empty Stack', () => {
    const app = new cdk.App();
    const stack = new Bitsapi.BitsapiStack(app, 'MyTestStack');

    it('should have bare minimum resources', () => {
      expectCDK(stack).to(haveResource("AWS::Cognito::UserPool"))
      expectCDK(stack).to(haveResource("AWS::AppSync::GraphQLApi"))
      expectCDK(stack).to(haveResource("AWS::AppSync::DataSource"))
      expectCDK(stack).to(haveResource("AWS::DynamoDB::Table"))
    })
});
