import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';

const AWSXRay = require('aws-xray-sdk')

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic

export class TodosAccess {

    constructor(
        private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly todoTable: string = process.env.TODOS_TABLE
    ) { }

    async getTodosForUser(userId: string): Promise<TodoItem[]> {

        logger.info('Fetching user todos...', `UserId ${userId}`)

        const result = await this.docClient.query({
            TableName: this.todoTable,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }).promise()

        const todos = result.Items
        logger.info('User todo result', `UserId ${userId}`, result.Items,)

        return todos as TodoItem[];
    }

    async createTodo(todoItem: TodoItem): Promise<TodoItem> {
        
        logger.info("Creating todo...", todoItem)

        await this.docClient.put({
            TableName: this.todoTable,
            Item: todoItem
        }).promise()

        logger.info("Todo created", todoItem)

        return todoItem;
    }

    async updateTodo(todoUpdate: TodoUpdate, userId: string, todoId: string) {

        logger.info("Updating todo...", todoUpdate, `todoId: ${todoId}`)

        const result = await this.docClient.get({
            TableName: this.todoTable,
            Key: {
                userId: userId,
                todoId: todoId
            },

        }).promise()


        if (!result.Item) {
            throw Error('Item does not exist')
        }

        await this.docClient.update({
            TableName: this.todoTable,
            Key: {
                userId: userId,
                todoId: todoId
            },
            UpdateExpression: 'SET done = :done, #title = :name, dueDate = :dueDate',
            ExpressionAttributeNames: {
                '#title': 'name'
            },
            ExpressionAttributeValues: {
                ':done': todoUpdate.done,
                ':name': todoUpdate.name,
                ':dueDate': todoUpdate.dueDate
            }
        }).promise()

        logger.info("Todo updated", todoUpdate, `todoId: ${todoId}`)

    }

    async deleteTodo(userId: string, todoId: string) {

        logger.info("Deleting todo...", `todoId: ${todoId}`)

        const result = await this.docClient.get({
            TableName: this.todoTable,
            Key: {
                userId: userId,
                todoId: todoId
            }
        }).promise()

        if (!result.Item) {
            throw Error('Item does not exist')
        }

        this.docClient.delete({
            TableName: this.todoTable,
            Key: {
                userId: userId,
                todoId: todoId
            }
        }).promise()

        logger.info("Todo deleted", `todoId: ${todoId}`)

    }


}