import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { getUserId } from '../utils';
import { createTodo } from '../../helpers/todos'
import { createLogger } from '../../utils/logger'


const logger = createLogger('createTodo')


export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const userId = getUserId(event);
    const newTodo: CreateTodoRequest = JSON.parse(event.body)
    logger.info('Creating todo...', `token: ${event.headers.authorizationToken}`, event.body)
    // TODO: Implement creating a new TODO item
    try {
      const todoItem = await createTodo(newTodo, userId);

    return {
      statusCode: 201,
      body: JSON.stringify({
        "item": todoItem
      })
    }
    }
    catch(err) {
      logger.error('Todo not created', err.message)
      return {
        statusCode: 401,
        body: JSON.stringify(
          {
            "errorMessage": err.message
          }
        )
      }
    }
  }
)

handler.use(
  cors({
    credentials: true
  })
)
