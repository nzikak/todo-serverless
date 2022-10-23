import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

const AWSXRay = require('aws-xray-sdk')

const XAWS = AWSXRay.captureAWS(AWS)

// TODO: Implement the fileStorage logic
export class AttachmentUtils {

    constructor(
        private readonly bucketName: string = process.env.ATTACHMENT_S3_BUCKET,
        private readonly s3 = new XAWS.S3({
            signatureVersion: 'v4'
        }),
        private readonly uploadUrlExpiration: number = parseInt(process.env.SIGNED_URL_EXPIRATION),
        private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly todoTable: string = process.env.TODOS_TABLE
    ) {}


    async createAttachmentPresignedUrl(todoId: string, userId: string): Promise<string> {

        const result = await this.docClient.get({
            TableName: this.todoTable,
            Key: {
                userId: userId,
                todoId: todoId
            }
        }).promise()
    
        if(!result.Item) {
            throw Error('Item does not exist')
        }
    
        return this.s3.getSignedUrl('putObject', {
            Bucket: this.bucketName,
            Key: todoId,
            Expires: this.uploadUrlExpiration
          })
    }
}