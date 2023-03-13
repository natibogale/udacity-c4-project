import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { TodosAccess } from '../../helpers/todosAcess'
import { AuthHelper } from '../../helpers/AuthHelper'
import { S3Bucket } from '../../helpers/attachmentUtils'

const todosAccess = new TodosAccess()
const authHelper = new AuthHelper()
const s3Bucket = new S3Bucket()

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const userId = authHelper.getUserId(event)

  const item = await todosAccess.getTodoById(todoId,userId)
  if (item.Count == 0) {
    return {
      statusCode: 404,
      body: JSON.stringify({
        error: 'No TODO with the provided id is found!'
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

  const uploadUrl = s3Bucket.getPresignedUrl(todoId)
  return {
    statusCode: 200,
    body: JSON.stringify({
      uploadUrl: uploadUrl
    })
  }
})

handler.use(
  cors({
    credentials: true
  })
)