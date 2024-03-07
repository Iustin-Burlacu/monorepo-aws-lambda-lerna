import { S3Event } from 'aws-lambda';
import { S3Client } from '@aws-sdk/client-s3';
import KSUID from "ksuid";
import { Log } from "@my/log";
import {S3ClientWrapper} from "./logic/S3ClientWrapper";

const s3 = new S3Client({ region: process.env.AWS_REGION });

export const lambdaHandler = async (event: S3Event): Promise<void> => {
    let logId: string = KSUID.randomSync().string;
    const log: Log = new Log(["LogS3", logId], process.env.DEBUG, logId);
    log.info("S3");

    const s3Client: S3ClientWrapper = new S3ClientWrapper(log);
    const bucket = event.Records[0].s3.bucket.name;
    const key: string = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));

    try {
       const file: string = await s3Client.readFileFromS3(bucket, key)
        log.info(file)
    } catch (e) {
        log.error(e);
    }
};