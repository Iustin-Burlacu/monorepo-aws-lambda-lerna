import { APIGatewayProxyEventPathParameters, APIGatewayProxyResult } from "aws-lambda";
import KSUID from "ksuid";
import { Log } from "@my/log";
import {Database} from "../logic/database";
import {QueryParams} from "../types/QueryParams";

export const listResources = async (params: QueryParams | any, pathParameters: APIGatewayProxyEventPathParameters | null) : Promise<APIGatewayProxyResult> => {
    let logId: string = KSUID.randomSync().string;
	const log: Log = new Log(["listResources", logId], process.env.DEBUG, logId);
    log.info("Request for -> GET resources");
    log.debug(params);
    log.debug(pathParameters);

    const database: Database = new Database(log);

    try {
        let result = await database.getResourceList(pathParameters?.id ?? '', params.limit)
        return {
            headers: {
                "Access-Control-Allow-Origin": "*",
            },
            statusCode: 200,
            body: JSON.stringify(result),
        }
    } catch (e) {
        log.error(e);
        let errorMessage: string = "Generic error";
        if (e instanceof Error && e.message) {
            errorMessage = e.message;
        }
        return {
            headers: {
                "Access-Control-Allow-Origin": "*",
            },
            statusCode: 500,
            body: JSON.stringify(errorMessage),
        };
    }
}