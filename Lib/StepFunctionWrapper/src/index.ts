import { SFNClient, SendTaskFailureCommand, SendTaskFailureCommandInput, SendTaskSuccessCommand, StartExecutionCommand, StartExecutionCommandInput } from "@aws-sdk/client-sfn";
import { Log } from "@my/log";
export class StepFunctionWrapper {

    private log;
    private client: SFNClient

    public constructor(log: Log) {
        this.log = log
        this.client = new SFNClient({ region: process.env.REGION })
    }

    async resumeStepFunction(taskToken: string, input: any, status: boolean, error?: any) {

        if (status) {
            const command = new SendTaskSuccessCommand({
                output: JSON.stringify(input),
                taskToken: taskToken
            });
            const response = await this.client.send(command);
            this.log.info(response)
        } else {
            let sendTaskFailureCommandInput: SendTaskFailureCommandInput = {
                cause: JSON.stringify(input),
                taskToken: taskToken
            }
            if(error){
                sendTaskFailureCommandInput["error"] = JSON.stringify(error)
            }
            const command = new SendTaskFailureCommand(sendTaskFailureCommandInput);
            const response = await this.client.send(command);
            this.log.info(response)
        }
    }

    async startExecution(input: StartExecutionCommandInput) {
        const client = new SFNClient({ region: process.env.REGION });
        const command = new StartExecutionCommand(input);
        return await client.send(command);
    }

}