import * as AWS from 'aws-sdk'
import { TodoItem } from '../models/TodoItem'


const todoTable = process.env.TODOS_TABLE

export async function getTodosForUser(userId: string): Promise<TodoItem[]> {

    const docClient = new AWS.DynamoDB.DocumentClient();

    const result = await docClient.query({
        TableName:  todoTable,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
            ':userid': userId
        }
    }).promise()

    const todos = result.Items

    return todos as TodoItem[];
}