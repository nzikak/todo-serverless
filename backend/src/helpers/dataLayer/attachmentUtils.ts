import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../../utils/logger'

const AWSXRay = require('aws-xray-sdk')

const XAWS = AWSXRay.captureAWS(AWS)
const logger = createLogger('AttachmentUtils')

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

        logger.info('Creating presigned url', todoId)

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

       
    
       const presignedUrl = this.s3.getSignedUrl('putObject', {
            Bucket: this.bucketName,
            Key: todoId,
            Expires: this.uploadUrlExpiration
          })
        logger.info('Presigned url created', `url: ${presignedUrl}`, todoId)

        this.docClient.update({
            TableName: this.todoTable,
            Key: {
                userId: userId,
                todoId: todoId
            },
            UpdateExpression: 'SET attachmentUrl = :attachmentUrl',
            ExpressionAttributeValues: {
                ':attachmentUrl': `https://${this.bucketName}.s3.amazonaws.com/${todoId}`
            }
        })

        logger.info('Attachment url updated', `url: ${presignedUrl}`, todoId)

        return presignedUrl
    }
}