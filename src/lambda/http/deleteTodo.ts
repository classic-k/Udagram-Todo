import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { createLogger } from "../../utils/logger"
import { deleteTodo } from '../../logics/todos'
import { getUserId, headers} from '../utils'


const logger = createLogger("func_deleteTodo")
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId  
    try {
        
        // TODO: Remove a TODO item by id
        const userId = getUserId(event)
        const delItem = deleteTodo(userId, todoId)
        logger.info("Deleted item: "+delItem)
        if(!delItem)
      {  return {
            statusCode: 500,
            body: JSON.stringify({
              messgae: "An error occur",
            })
          } 
    }
    return {statusCode: 200,
      headers,
        body: JSON.stringify({
          message: "Todo deleted",
        
        })
        
      
    }
    
      } 
      catch (error) {
        logger.info("Error during delete"+ error.mesage)  
    return {
        statusCode: 500,
        body: JSON.stringify({
          errMsg: "An error occur",
        })  
    
    }
}

  }   

)

handler
  .use(
    cors({
      credentials: true,
      origins: "*"
    })
  )


