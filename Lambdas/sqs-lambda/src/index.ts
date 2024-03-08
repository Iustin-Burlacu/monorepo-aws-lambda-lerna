import { SQSEvent, SQSHandler } from 'aws-lambda';
import KSUID from "ksuid";
import { Log } from "@my/log";

export const lambdaHandler: SQSHandler = async (event: SQSEvent) => {
    let logId: string = KSUID.randomSync().string;
    const log: Log = new Log(["LogSqs", logId], process.env.DEBUG, logId);
    log.info("Sqs");

    try {
        log.info(event);
        for (const record of event.Records) {
            const message = JSON.parse(record.body);
            log.debug(message);
        }
    } catch (e) {
        log.error(e);
    }
};
