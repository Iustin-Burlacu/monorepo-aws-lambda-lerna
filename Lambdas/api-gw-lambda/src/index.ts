import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { Log } from "@my/log";
import KSUID from "ksuid";
import { listResources } from "./functions/listResources";

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
	let logId: string = KSUID.randomSync().string;
	const log: Log = new Log(["LogApiGW", logId], process.env.DEBUG, logId);
	log.info("Api gateway");
    try {
        if (event.resource === undefined || event.resource === null ||
            event.httpMethod === undefined || event.httpMethod === null) {
            throw new Error("undefined event API")
        }
    
        const routeKey: string = event.httpMethod + " " + event.resource

        switch (routeKey) {
            case 'GET /resources':
                return await listResources(event.queryStringParameters, event.pathParameters)
            default:
                return {
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                    },
                    statusCode: 500,
                    body: JSON.stringify("Unrecognized API"),
                };    
        }

    } catch (e) {
        let errorMessage = 'Generic error';
        if (e instanceof Error && e.message) {
            errorMessage = e.message;
        }
        return {
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
            statusCode: 500,
            body: JSON.stringify(errorMessage),
        };
    }    

}