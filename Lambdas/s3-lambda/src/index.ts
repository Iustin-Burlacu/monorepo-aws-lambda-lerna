import { S3Event } from 'aws-lambda';
import KSUID from "ksuid";
import { Log } from "@my/log";
import {S3ClientWrapper} from "@my/s3";

export const lambdaHandler = async (event: S3Event): Promise<void> => {
    let logId: string = KSUID.randomSync().string;
    const log: Log = new Log(["LogS3", logId], process.env.DEBUG, logId);
    log.info("S3");

    const s3ClientWrapper: S3ClientWrapper = new S3ClientWrapper(log);
    const bucket: string = event.Records[0].s3.bucket.name;
    const key: string = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));

    try {
       const file: string = await s3ClientWrapper.readFileFromS3(bucket, key)
        log.info(file)
    } catch (e) {
        log.error(e);
    }
};