import { AttributeValue } from "@aws-sdk/client-dynamodb";
import { StreamRecord } from "aws-lambda";
import KSUID from "ksuid";
import {SQSClientWrapper} from "../logic/SQSClientWrapper";
import { Log } from "@my/log";
import {unmarshall} from "@aws-sdk/util-dynamodb";

export const sendMessage = async (record: StreamRecord | undefined): Promise<void> => {
    let logId: string = KSUID.randomSync().string;
    const log: Log = new Log(["sendMessage", logId], process.env.DEBUG, logId);
    if (!record) {
        throw new Error('Record undefined');
    }

    log.debug(JSON.stringify(record))

    const sqsClientWrapper: SQSClientWrapper = new SQSClientWrapper(log);
    const newImage: Record<string, AttributeValue> = unmarshall(record.NewImage as { [key: string]: AttributeValue });
    log.debug('newImage')
    log.debug(newImage)

    const message: { text: string } = { text: 'Hello world' }

    await sqsClientWrapper.sendMessage(1, JSON.stringify(message), process.env.SQS_QUE as string);
}