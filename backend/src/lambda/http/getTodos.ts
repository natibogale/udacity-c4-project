import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { TodosAccess } from '../../helpers/todosAcess'
import { AuthHelper } from '../../helpers/AuthHelper'
import { S3Bucket } from '../../helpers/attachmentUtils'

const s3Bucket = new S3Bucket()
const authHelper = new AuthHelper();

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const userId = authHelper.getUserId(event)
  const todos = await new TodosAccess().getUserTodos(userId)

  for (const todo of todos) {
    todo.attachmentUrl = await s3Bucket.getTodoAttachmentUrl(todo.todoId)
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      items: todos
    })
  }
})


handler.use(
  cors({
    credentials: true
  })
)