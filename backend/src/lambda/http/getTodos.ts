import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { getTodosForUser as getTodosForUser } from '../../helpers/businessLogic/todos'
import { getUserId } from '../utils';
import { createLogger } from '../../utils/logger'

const logger = createLogger('getTodos')
// TODO: Get all TODO items for a current user
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // Write your code here
    logger.info('Fetching todos...', `token: ${event.headers.authorizationToken}`)
    const userId = getUserId(event);
    const todos =  await getTodosForUser(userId);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(
        {
          "items": todos
        }
      )
    }

  })

  handler.use(
    cors({
      credentials: true
    })
  )
