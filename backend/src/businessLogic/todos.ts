import * as AWS from 'aws-sdk'
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import * as uuid from 'uuid';


const todoTable = process.env.TODOS_TABLE
const docClient = new AWS.DynamoDB.DocumentClient();

export async function getTodosForUser(userId: string): Promise<TodoItem[]> {


    const result = await docClient.query({
        TableName: todoTable,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
            ':userid': userId
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
        attachmentUrl: "http://example.com/image.png"
    }

    await docClient.put({
        TableName: todoTable,
        Item: todoItem
    }).promise()

    return todoItem;
}

export async function UpdateTodo(request: UpdateTodoRequest, userId: string, todoId: string) {

    const itemCreatedAt = new Date().toISOString();
    const itemId = uuid.v4();

    const todoItem = {
        todoId: itemId,
        name: request.name,
        createdAt: itemCreatedAt,
        dueDate: request.dueDate,
        done: false,
        userId: userId,
        attachmentUrl: "http://example.com/image.png"
    }
        await docClient.update({
            TableName: todoTable,
            Key: {
                todoId: todoId
            },
            UpdateExpression: 'SET done = :done',
            ExpressionAttributeValues: {
                ':done': request.done
            }
        }).promise()

        await docClient.update({
            TableName: todoTable,
            Key: {
                todoId: todoId
            },
            UpdateExpression: 'SET name = :name',
            ExpressionAttributeValues: {
                ':name': request.name
            }
        }).promise()

        await docClient.update({
            TableName: todoTable,
            Key: {
                todoId: todoId
            },
            UpdateExpression: 'SET dueDate = :dueDate',
            ExpressionAttributeValues: {
                ':dueDate': request.dueDate
            }
        }).promise()

}