import * as AWS from 'aws-sdk'
const XAWS =  require('aws-sdk');

export class S3Bucket {
    constructor(
        // private readonly XAWS = AWSXRay.captureAWS(AWS),
        private readonly s3: AWS.S3 = new XAWS.S3({
            signatureVersion: 'v4',
            region: process.env.region,
            params: { Bucket: process.env.IMAGES_BUCKET }
        }),
        private readonly signedUrlExpireSeconds = parseInt(process.env.SIGNED_URL_EXPIRATION)
    ) { }
    
    async getTodoAttachmentUrl(todoId: string): Promise<string> {
        try {
            await this.s3.headObject({
                Bucket: process.env.IMAGES_BUCKET,
                Key: `${todoId}.png`
            }).promise();

            return this.s3.getSignedUrl('getObject', {
                Bucket: process.env.IMAGES_BUCKET,
                Key: `${todoId}.png`,
                Expires: this.signedUrlExpireSeconds
            });
        } catch (err) {
            console.log(err)
        }
        return null
    }

    getPresignedUrl(todoId: string): string {
        return this.s3.getSignedUrl('putObject', {
            Bucket: process.env.IMAGES_BUCKET,
            Key: `${todoId}.png`,
            Expires: this.signedUrlExpireSeconds
        }) as string;
    }
}