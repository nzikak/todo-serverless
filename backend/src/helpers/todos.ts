import { TodosAccess } from './todosAcess'
import { AttachmentUtils } from './attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import * as createError from 'http-errors'

// TODO: Implement businessLogic

const todosAccess: TodosAccess = new TodosAccess()
const attachmentUtils: AttachmentUtils = new AttachmentUtils()


export function getTodosForUser(userId: string): Promise<TodoItem[]> { 
    return todosAccess.getTodosForUser(userId)
 }

export function createTodo(request: CreateTodoRequest, userId: string): Promise<TodoItem> {
    const itemCreatedAt = new Date().toISOString()
    const itemId = uuid.v4()
    const bucketName = process.env.ATTACHMENT_S3_BUCKET

    const todoItem = {
        todoId: itemId,
        name: request.name,
        createdAt: itemCreatedAt,
        dueDate: request.dueDate,
        done: false,
        userId: userId,
        attachmentUrl: `https://${bucketName}.s3.amazonaws.com/${itemId}`
    }

    return todosAccess.createTodo(todoItem)
}

export async function updateTodo(request: UpdateTodoRequest, userId: string, todoId: string) {

    await todosAccess.updateTodo(request, userId, todoId)
}

export async function deleteTodo(userId: string, todoId: string) {
    await todosAccess.deleteTodo(userId, todoId)
}

export async function createAttachmentPresignedUrl(todoId: string, userId: string): Promise<string> {
    return attachmentUtils.createAttachmentPresignedUrl(todoId, userId)
}