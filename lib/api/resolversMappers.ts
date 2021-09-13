export const getSubscriptionRequestMapper = `
#set ($partitionKey = "default")
{
  "version": "2017-02-28",
  "operation": "GetItem",
  "key": {
      "PK": $util.dynamodb.toDynamoDBJson($partitionKey),
      "USERID": $util.dynamodb.toDynamoDBJson($ctx.identity.username)
  }
}
`;

export const getSubscriptionResponseMapper = `
## Raise a GraphQL field error in case of a datasource invocation error
#if($ctx.error)
    $util.error($ctx.error.message, $ctx.error.type)
#end
## Pass back the result from DynamoDB. **

#set($result = [])

#foreach( $entry in $ctx.result.entrySet() )
    #if( $entry.key != "PK" && $entry.key != "USERID" )
    	$util.qr($result.add({"name": \${entry.key}, "value": \${entry.value}}))
    #end
#end

$util.toJson($result)`;




export const saveSubcriptionRequestMapper = `

#set ($partitionKey = "default")
#if(\${ctx.args.Subscription.name} == "PK" || \${ctx.args.Subscription.name} == "USERID" )
$util.error("PK and USERID are reserved")
#end

{
  "version" : "2018-05-29",
  "operation" : "UpdateItem",
  "key": {
      "PK": $util.dynamodb.toDynamoDBJson($partitionKey),
      "USERID": $util.dynamodb.toDynamoDBJson($ctx.identity.username)
  },
  "update" : {
      "expression" : "SET #subscription = :value",
      "expressionNames" : {
         "#subscription" : $util.toJson(\${ctx.args.Subscription.name})
     },
     "expressionValues" : {
         ":value" : $util.dynamodb.toDynamoDBJson(\${ctx.args.Subscription.value})
     }
  }
}

`

export const saveSubcriptionResponseMapper = `
#if($ctx.error)
    $util.error($ctx.error.message, $ctx.error.type)
#end
$util.toJson($ctx.args.Subscription)

`
