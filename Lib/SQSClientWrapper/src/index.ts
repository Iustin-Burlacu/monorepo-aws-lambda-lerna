import { SQSClient, SendMessageCommand, SendMessageCommandInput } from "@aws-sdk/client-sqs";
import { Log } from "@my/log";
export class SQSClientWrapper {
    private log;
    private sqsClient: SQSClient;

    public constructor(log: Log) {
        this.log = log;
        this.sqsClient = new SQSClient({ region: process.env.REGION });
    }

    async sendMessage(
        delaySeconds: number,
        messageBody: any,
        queueUrl: string,
        isSns: boolean = false,
        messageAttributes?: any
    ) {
        const params: SendMessageCommandInput = {
            DelaySeconds: delaySeconds,
            MessageBody: !isSns ? messageBody : JSON.stringify({Message: messageBody}),
            QueueUrl: queueUrl,
            ...(messageAttributes && { MessageAttributes: messageAttributes }),
        };

        this.log.debug(JSON.stringify(params))
        const dataSqs = await this.sqsClient.send(new SendMessageCommand(params));
        this.log.info("Success, message sent. MessageID: " + dataSqs.MessageId);
    }
}
