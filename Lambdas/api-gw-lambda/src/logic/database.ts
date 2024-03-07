import {AttributeValue, QueryCommandInput, QueryCommand, DynamoDBClient} from "@aws-sdk/client-dynamodb";
import {unmarshall} from "@aws-sdk/util-dynamodb";
import {Resource} from "../types";
import { Log } from "@my/log";
export class Database {
    private log: Log;
    private dynamoClient: DynamoDBClient;

    public constructor(log: Log) {
        this.log = log;
        this.dynamoClient = new DynamoDBClient({
            region: process.env.REGION,
            ...(process.env.AWS_DYNAMODB_ENDPOINT && {endpoint: process.env.AWS_DYNAMODB_ENDPOINT}),
            ...(process.env.ACCESS_KEY_ID && {
                credentials: {
                    accessKeyId: process.env.ACCESS_KEY_ID as string,
                    secretAccessKey: process.env.SECRET_ACCESS_KEY as string
                }
            })
        });
    }

    async getResourceList(
        id: string,
        limit: number,
        lastEvaluatedKey?: Record<string, AttributeValue>
    ): Promise<{
        result: Array<Resource>;
        lastEvaluatedKey?: Record<string, AttributeValue>;
        limit: number;
    }> {
        const queryCommand: QueryCommandInput = {
            TableName: process.env.PROCEDURE_EXECUTIONS_TABLE_NAME as string,
            IndexName: process.env.PROCEDURE_EXECUTIONS_TABLE_NAME_SECONDARY_INDEX_NAME,
            KeyConditionExpression: "id = :id",
            ExpressionAttributeValues: {
                ":id": {S: id},
            },
            Limit: Number(limit),
            ScanIndexForward: false,
            // Il risultato della query è paginato quindi è necessaria lastEvaluatedKey
            // sia come parametro (se esiste) sia nell'oggetto di ritorno
            ...(lastEvaluatedKey && {ExclusiveStartKey: lastEvaluatedKey}),
        };

        const result = await this.dynamoClient.send(new QueryCommand(queryCommand));

        const proceduresConfig: Array<Resource> =
            result.Items?.map((item) => {
                let itemUnmashall = unmarshall(item);
                return itemUnmashall as Resource
            }) ?? [];

        return {
            result: proceduresConfig,
            lastEvaluatedKey: result.LastEvaluatedKey,
            limit: limit,
        };
    }
}