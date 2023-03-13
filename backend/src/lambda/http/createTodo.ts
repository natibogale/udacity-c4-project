import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { TodosAccess } from '../../helpers/todosAcess'
import { AuthHelper } from '../../helpers/AuthHelper'

const authHelper = new AuthHelper();

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const newTodo: CreateTodoRequest = JSON.parse(event.body)

  const userId = authHelper.getUserId(event)


  const todo = await new TodosAccess().createTodo(newTodo, userId)

  return {
    statusCode: 201,
    body: JSON.stringify({
      item: todo
    })
  }
})

handler.use(
  cors({
    credentials: true
  })
)