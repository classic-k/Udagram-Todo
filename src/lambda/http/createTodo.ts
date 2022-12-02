import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import {createTodo} from "../../BusinessLayer/todos"
import {getUserId, headers} from "../utils"
import {createLogger as Logger} from "../../utils/logger"

const logger = Logger("func_createTodo")
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todos: CreateTodoRequest = JSON.parse(event.body)
    try
    {
        const userId = getUserId(event)
    
        const newItem = createTodo(todos, userId)
        if(newItem)
        {
            return {
                statusCode: 201,
                headers,
                body: JSON.stringify({
                  item: newItem,
                  
                })
              }
        }
        
       
    }
    catch(error)
    {
        logger.info("An error occur ",error)
        return {
            statusCode: 500,
            body: JSON.stringify({
              errMsg: "An error occur",
              
            })
          }
    }
    
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: "An error occur",
        })
      }
  }
)

  
  
handler.use(
  cors({
    credentials: true,
    origins: "*"
  })
)
