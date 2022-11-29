import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { updateTodo } from '../../logics/todos'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { getUserId} from '../utils'
import { createLogger } from '../../utils/logger'

const logger = createLogger("func_updateTodo")
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    const todo: UpdateTodoRequest = JSON.parse(event.body)
    
    // TODO: Update a TODO item with the provided id using values in the "updatedTodo" objectconst userId = getUserId(event)
try{
const userId = getUserId(event)
    const res = updateTodo(userId, todoId, todo)
const name = res["name"]

if(res)
  {  
      logger.info("Todo Updated",todoId)
      
    return {statusCode: 200,
        
        body: JSON.stringify({
          message: "Todo "+name+"Updated",
        
        })
    }}
    return {statusCode: 500,
       
        body: JSON.stringify({
          message: "An error occur",
        
        })
    }
}
catch(error)
{
    logger.info("An error occur ",error)
    return {statusCode: 500,
       
        body: JSON.stringify({
          message: "An error occur",
        
        })
    }
}
} 
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true,
      origins: "*"
    })
  )

 
   