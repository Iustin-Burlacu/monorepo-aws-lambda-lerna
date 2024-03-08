import {DynamoDBStreamEvent, DynamoDBStreamHandler} from 'aws-lambda';
import KSUID from "ksuid";
import { Log } from "@my/log";
import { sendMessage } from "./functions/sendMessage";

export const lambdaHandler: DynamoDBStreamHandler = async (event: DynamoDBStreamEvent): Promise<void> => {
    let logId: string = KSUID.randomSync().string;
    const log: Log = new Log(["LogDynamoDB", logId], process.env.DEBUG, logId);
    log.info("DynamoDB");
    try {
        log.info(event);
        for (const record of event.Records) {
            switch (record.eventName) {
                case 'INSERT':
                    await sendMessage(record.dynamodb);
                    break;
                default:
                    log.debug('Default');
                    break;
            }
        }
    } catch (e) {
        log.error(e);
    }
};
