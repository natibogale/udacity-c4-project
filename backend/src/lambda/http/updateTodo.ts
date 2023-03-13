import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { AuthHelper } from '../../helpers/AuthHelper'
import { TodosAccess } from '../../helpers/todosAcess'

const todosAccess = new TodosAccess()
const authHelper = new AuthHelper()

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
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

  await new TodosAccess().updateTodo(updatedTodo, todoId,userId)
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