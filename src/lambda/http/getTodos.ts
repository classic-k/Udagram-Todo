import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { getTodos } from '../../logics/todos'
import { getUserId} from '../utils';
import { createLogger } from '../../utils/logger'

const logger = createLogger("func_getTodos")
// TODO: Get all TODO items for a current user
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // Write your code here
    try
    {
        const userId = getUserId(event)
        logger.info("Fecth users todos: ",userId)
        const todos = await getTodos(userId)
        if(todos)
        {
            return {
                statusCode: 200,
                body: JSON.stringify({
                  todos: todos,
                  
                })
            }
        }
        return {
            statusCode: 500,
            body: JSON.stringify({
              messgae: "An error occur" 
              
            })
        }
    }
    catch(error)
    {
        logger.error("Fetch todo error: ",error )
     return   {
            statusCode: 500,
            body: JSON.stringify({
              messgae: "An error occur" 
              
            })
        }
    }

}
)
handler.use(
  cors({
    credentials: true,
    origins: "*"
  })
)

