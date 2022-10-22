import * as AWS from 'aws-sdk'
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import * as uuid from 'uuid';



const todoTable = process.env.TODOS_TABLE
const uploadUrlExpiration = process.env.SIGNED_URL_EXPIRATION
const bucketName = process.env.ATTACHMENT_S3_BUCKET
const docClient = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3({
    signatureVersion: 'v4'
});

export async function getTodosForUser(userId: string): Promise<TodoItem[]> {


    const result = await docClient.query({
        TableName: todoTable,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
            ':userId': userId
        }
    }).promise()

    const todos = result.Items

    return todos as TodoItem[];
}

export async function createTodo(request: CreateTodoRequest, userId: string): Promise<TodoItem> {

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

    await docClient.put({
        TableName: todoTable,
        Item: todoItem
    }).promise()

    return todoItem;
}

export async function updateTodo(request: UpdateTodoRequest, userId: string, todoId: string) {


    const result = await docClient.get({
        TableName: todoTable,
        Key: {
            userId: userId,
            todoId: todoId
        },

    }).promise()

    console.log(`Result is ${JSON.stringify(result.Item)}`)

    if(!result.Item) {
        throw Error('Item does not exist')
    }

        await docClient.update({
            TableName: todoTable,
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

export async function deleteTodo(userId: string, todoId: string) {


    const result = await docClient.get({
        TableName: todoTable,
        Key: {
            userId: userId,
            todoId: todoId
        }
    }).promise()

    if(!result.Item) {
        throw Error('Item does not exist')
    }

    docClient.delete({
        TableName: todoTable,
        Key: {
            userId: userId,
            todoId: todoId
        }
    }).promise

}


export async function createAttachmentPresignedUrl(todoId: string, userId: string): Promise<string> {

    const result = await docClient.get({
        TableName: todoTable,
        Key: {
            userId: userId,
            todoId: todoId
        }
    }).promise()

    if(!result.Item) {
        throw Error('Item does not exist')
    }

    return s3.getSignedUrl('putObject', {
        Bucket: bucketName,
        Key: todoId,
        Expires: uploadUrlExpiration
      })
}