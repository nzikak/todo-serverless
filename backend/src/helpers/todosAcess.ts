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


    const result = await this.docClient.query({
        TableName: this.todoTable,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
            ':userId': userId
        }
    }).promise()

    const todos = result.Items

    return todos as TodoItem[];
}

async createTodo(request: CreateTodoRequest, userId: string): Promise<TodoItem> {

    const itemCreatedAt = new Date().toISOString();
    const itemId = uuid.v4();

    const todoItem = {
        todoId: itemId,
        name: request.name,
        createdAt: itemCreatedAt,
        dueDate: request.dueDate,
        done: false,
        userId: userId,
        attachmentUrl: `https://${bucketName}.s3.amazonaws.com/${itemId}`
    }

    await this.docClient.put({
        TableName: this.todoTable,
        Item: todoItem
    }).promise()

    return todoItem;
}

async updateTodo(request: UpdateTodoRequest, userId: string, todoId: string) {


    const result = await this.docClient.get({
        TableName: this.todoTable,
        Key: {
            userId: userId,
            todoId: todoId
        },

    }).promise()

    console.log(`Result is ${JSON.stringify(result.Item)}`)

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
            ':done': request.done,
            ':name': request.name,
            ':dueDate': request.dueDate
        }
    }).promise()

    console.log("Todo updated")

}

async deleteTodo(userId: string, todoId: string) {


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

}
    

}