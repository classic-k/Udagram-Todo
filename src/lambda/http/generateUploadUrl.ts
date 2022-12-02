import 'source-map-support/register'
import * as AWS from "aws-sdk"
const AWSXRay = require('aws-xray-sdk');
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { genAttachUrl } from '../../BusinessLayer/todos'
import { getUserId, headers } from '../utils'
import {createLogger} from "../../utils/logger"
import { cors } from 'middy/middlewares'

const XAWS = AWSXRay.captureAWS(AWS)
const docClient = new XAWS.DynamoDB.DocumentClient()
const logger = createLogger("func_genURL")
const todosTable = process.env.TODOS_TABLE

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
  const userId = getUserId(event)

    const validTodo = await chkTodo(userId, todoId)
    if(!validTodo)
    {
        logger.error("Invalid todo id "+todoId)
        return {statusCode: 404,
       
            body: JSON.stringify({
              error: "Todo not found",
            
            }),headers
        }
    }
    let url = await genAttachUrl(userId, todoId)
    logger.info("Todo URL generated ",url)
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      uploadUrl: url
    })
  }
  }
)
export async function chkTodo(userId: string, todoId: string) {

    const todo = await docClient
      .get({
        TableName: todosTable,
        Key: {
          userId: userId,
          todoId: todoId
        }
      })
      .promise()
  
    return !!todo.Item
  }
  handler.use(
    cors({
      credentials: true,
      origins: "*"
    })
  )
 

  