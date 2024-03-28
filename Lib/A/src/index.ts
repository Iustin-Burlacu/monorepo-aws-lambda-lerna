import { Log } from "@my/log";

export class A {
    private log;

    public constructor(log: Log) {
        this.log = log;
    }

    async test() {
        this.log.debug('a')
    }
}
