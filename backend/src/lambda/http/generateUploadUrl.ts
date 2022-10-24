import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { createAttachmentPresignedUrl } from '../../helpers/businessLogic/todos'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'

const logger = createLogger('generateUploadUrl')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    const userId = getUserId(event)
    logger.info('Generating upload url...', `token: ${event.headers.authorizationToken}`, event.pathParameters.todoId)
    // TODO: Return a presigned URL to upload a file for a TODO item with the provided id

    try {
      const url = await createAttachmentPresignedUrl(todoId, userId)
      return {
        statusCode: 200,
        body: JSON.stringify({
          "uploadUrl": url
        })
      }
    }
    catch(err) {
      logger.error('Url not generated', err.message)
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
