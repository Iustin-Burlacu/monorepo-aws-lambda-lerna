import {
    CopyObjectCommand,
    DeleteObjectCommand,
    GetBucketPolicyCommandOutput,
    GetObjectCommand,
    GetObjectCommandOutput,
    HeadObjectCommand,
    ListObjectsV2Command,
    ListObjectsV2CommandInput,
    ListObjectsV2CommandOutput,
    PutBucketPolicyCommand,
    PutObjectCommand,
    PutObjectCommandOutput,
    S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Log } from "@my/log";
import {S3File} from "../types/S3File";

export class S3ClientWrapper {
    private client: S3Client;
    private log: Log;

    public constructor(log: Log) {
        this.client = new S3Client({ region: process.env.REGION });
        this.log = log;
    }

    async writeFileOnS3(
        bucket: string,
        content: string,
        filePath: string
    ): Promise<PutObjectCommandOutput> {
        const params = {
            Bucket: bucket,
            Body: content,
            Key: filePath,
        };

        this.log.info("Reading " + filePath);

        const command = new PutObjectCommand(params);
        const response = await this.client.send(command);

        return response;
    }

    async filePresentsOnS3(bucket: string, key: string): Promise<boolean> {
        this.log.debug("Calling filePresentsOnS3");
        const params = {
            Bucket: bucket,
            Key: key,
        };
        try {
            this.log.debug(
                `Calling HeadObjectCommand with params ${JSON.stringify(params)}`
            );
            await this.client.send(new HeadObjectCommand(params));
            return true
        } catch (error: any) {
            this.log.debug(error.name);
            this.log.debug(JSON.stringify(error));
            if (error.name === "NotFound") {
                this.log.info(`Object ${key} is not present on s3`);
                return false
            } else {
                throw error;
            }
        }
    }

    async readFileFromS3(bucket: string, key: string): Promise<string> {
        const input = {
            Bucket: bucket,
            Key: key,
        };

        const command = new GetObjectCommand(input);
        const response: GetObjectCommandOutput = await this.client.send(command);

        if (response === undefined || response.Body === undefined) {
            throw new Error("Object not found");
        }

        return this.streamToString(response.Body);
    }

    async listFiles(bucket: string, prefix: string): Promise<Array<S3File>> {
        let input: ListObjectsV2CommandInput = {
            Bucket: bucket,
            Prefix: prefix,
        };

        let response:
            | ListObjectsV2CommandOutput
            | { NextContinuationToken: string } = {
            NextContinuationToken: "",
        };

        let files: Array<S3File> = [];

        while (
            response.NextContinuationToken != undefined ||
            response.NextContinuationToken == ""
            ) {
            if (response.NextContinuationToken != "") {
                input.ContinuationToken = response.NextContinuationToken;
            }
            const command = new ListObjectsV2Command(input);

            response = await this.client.send(command);

            response.Contents?.forEach((element) => {
                this.log.debug(`size: ${element.Size} name: ${element.Key}`);
                if (
                    element.Key &&
                    element.LastModified &&
                    element.Size !== undefined &&
                    (element.Size !== 0 ||
                        element.Key?.includes("delta_generation_error"))
                ) {
                    files.push({
                        Key: element.Key,
                        LastModified: element.LastModified,
                        Size: element.Size,
                    });
                }
            });
            this.log.debug(files);

            this.log.info(response);
        }

        return files;
    }

    async getPresignedUrlPut(
        bucketName: string,
        objectKey: string
    ): Promise<string> {
        const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: objectKey,
        });
        const result = await getSignedUrl(this.client, command, {
            expiresIn: Number(process.env.PRESIGNED_URL_PUT_EXPIRATION as string),
        });
        return result;
    }

    async getPresignedUrlGet(
        bucketName: string,
        objectKey: string
    ): Promise<string> {
        const command = new GetObjectCommand({
            Bucket: bucketName,
            Key: objectKey,
        });
        const result = await getSignedUrl(this.client, command, {
            expiresIn: Number(process.env.PRESIGNED_URL_GET_EXPIRATION as string),
        });
        return result;
    }

    private streamToString(stream: any): Promise<string> {
        return new Promise((resolve, reject) => {
            const chunks: any[] = [];
            stream.on("data", (chunk: any) => chunks.push(chunk));
            stream.on("error", reject);
            stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
        });
    }

    async deleteFileOnS3(bucket: string, key: string): Promise<void> {
        this.log.debug("Calling deleteFileOnS3");
        const params = {
            Bucket: bucket,
            Key: key,
        };
        try {
            this.log.debug(
                `Calling HeadObjectCommand with params ${JSON.stringify(params)}`
            );
            await this.client.send(new HeadObjectCommand(params));
            this.log.info(`Removing delta object ${key}`);
            await this.client.send(new DeleteObjectCommand(params));
        } catch (error: any) {
            this.log.debug(error.name);
            this.log.debug(JSON.stringify(error));
            if (error.name === "NotFound") {
                this.log.info(`Object ${key} is not present on s3`);
            } else {
                throw error;
            }
        }
    }

    async renameFileOnS3(
        bucket: string,
        keyFrom: string,
        keyTo: string
    ): Promise<void> {
        this.log.info(`Renaming ${keyFrom} into ${keyTo}`);
        this.log.info(`Bucket ${bucket}`);

        try {
            await this.client.send(
                new CopyObjectCommand({
                    Bucket: bucket,
                    CopySource: encodeURIComponent(`${bucket}/${keyFrom}`),
                    Key: keyTo,
                })
            );

            await this.client.send(
                new DeleteObjectCommand({
                    Bucket: bucket,
                    Key: keyFrom,
                })
            );
        }
        catch (error: any) {
            this.log.error(error)
            throw error
        }
    }

    async blockWriteOnS3Bucket(bucket: string): Promise<string> {
        const AWS = require("aws-sdk");
        const s3 = new AWS.S3();

        let policy = JSON.parse(process.env.POLICY_BLOCK_S3 as string);
        policy = policy.replace("{bucket}", bucket.toLowerCase());

        try {
            let old_policy = await s3.getBucketPolicy({ Bucket: bucket }).promise();
            if (old_policy.Policy === undefined) {
                throw new Error("Failed to retrieve the bucket policy");
            }
            // Append existing policies to the new policy
            policy.Statement = policy.Statement.concat(
                JSON.parse(old_policy.Policy).Statement
            );

            await s3
                .putBucketPolicy({ Bucket: bucket, Policy: JSON.stringify(policy) })
                .promise();
            return old_policy;
        } catch (err) {
            console.error(`Error updating bucket policy for ${bucket}:`, err);
            throw err;
        }
    }

    async restorePolicyS3Bucket(
        bucket: string,
        old_policy: GetBucketPolicyCommandOutput
    ) {
        // la funzione sovrascrive la policy esistente con la vecchia policy senza doverla eliminare prima
        if (old_policy.Policy === undefined) {
            throw new Error("Failed to restore bucket policy");
        }
        let old_policy_string = old_policy.Policy;
        const bucketPolicyParams = {
            Bucket: bucket,
            Policy: old_policy_string,
        };

        try {
            const response = await this.client.send(
                new PutBucketPolicyCommand(bucketPolicyParams)
            );
            this.log.info("Success, old permissions added to bucket");
            this.log.debug(response)
        } catch (err) {
            this.log.error(err);
        }
    }
}
