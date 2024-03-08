import { LambdaLog } from 'lambda-log';

export class Log {

    private log;
    private logId;

    public constructor(tags: string[], isDebug: string | boolean | undefined, logId: string) {
        this.log = new LambdaLog({
            tags: tags,
            debug: isDebug === 'true' || isDebug === true
        })

        this.logId = logId
    }

    info(msg: unknown): void {
        this.log.info(msg as string);
    }

    getId(): string {
        return this.logId;
    }

    debug(msg: unknown): void {
        this.log.debug(msg as string);
    }

    error(msg: unknown): void {
        this.log.error(msg as string);
    }

}