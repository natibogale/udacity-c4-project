import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { AuthHelper } from '../../helpers/AuthHelper'
import { TodosAccess } from '../../helpers/todosAcess'

const authHelper = new AuthHelper();
const todosAccess = new TodosAccess()

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  if (!todoId) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: 'invalid parameters'
      })
    }
  }

  const userId = authHelper.getUserId(event)
  const item = await todosAccess.getTodoById(todoId,userId)
  if (item.Count == 0) {
    return {
      statusCode: 404,
      body: JSON.stringify({
        error: 'No TODO with the provided id is found'
      })
    }
  }

  if (item.Items[0].userId !== userId) {
    return {
      statusCode: 403,
      body: JSON.stringify({
        error: 'You can not perform this action, this TODO does not belong to your account!'
      })
    }
  }

  await todosAccess.deleteTodoById(todoId,userId)
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'The request has succeeded.'
    })
  }
})

handler.use(
  cors({
    credentials: true
  })
)