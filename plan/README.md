# High Level Plan

## Observability

No resources were implemented concerning observability, this should be ammended as soon as possible using AWS Cloud watch, and AWS xRay to trace requests.

## Code scalability and mainability

VTL templates are not the easiest things. It might be worth it to have a lambda data source in order to add functionality and testing.

## Workload

DynamoDb might fall short if we store all records in one partion only. A hash map should be used, picking one of the following:
 - store assigned partion as a cognito user attribute, fetch it before querying
 - create a hash from user's assigned Id (sub).

Both of this solutions would require refactoring DynamoDb tables, and this _migration_ will imply streaming data between tables.