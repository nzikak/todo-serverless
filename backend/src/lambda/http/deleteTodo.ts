import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { deleteTodo } from '../../helpers/todos'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'

const logger = createLogger('deleteTodo')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    const userId = getUserId(event)
    logger.info('Deleting todo', `token: ${event.headers.authorizationToken}`, event.pathParameters.todoId)

    try {
      await deleteTodo(userId, todoId)
      return {
        statusCode: 200,
        body: JSON.stringify('')
      }
    }
    catch (err) {
      logger.error('Todo not deleted', err.message)
      return {
        statusCode: 404,
        body: JSON.stringify({
          'errorMessage': err.message
        })
      }
    }
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
