import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { secretsManager } from 'middy/middlewares'
import {createLogger} from "../../utils/logger"
import { verify } from 'jsonwebtoken'
import { JwtToken } from '../../auth/Jwt'

const secretId = process.env.AUTH_0_SECRET_ID
const secretField = process.env.AUTH_0_SECRET_FIELD
const logger = createLogger("AuthLogger")
export const handler = middy(async (event: CustomAuthorizerEvent, context): Promise<CustomAuthorizerResult> => {
  try {
    logger.info('Initiate Token auth')
    const decodedToken = verifyToken(
      event.authorizationToken,
      context.AUTH0_SECRET[secretField]
    )
    logger.info('User was authorized')

    const {sub} = decodedToken.payload
    return {
      principalId: sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User was not authorized', e.message)

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
})

function verifyToken(authHeader: string, secret: string): JwtToken {
  if (!authHeader)
    throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
  {  
      logger.error("Invalid authentication header")
      throw new Error('Invalid authentication header')
}
  const split = authHeader.split(' ')
  const token = split[1]
  logger.info("Return JWTToken")
  return verify(token, secret) as JwtToken
}

handler.use(
  secretsManager({
    cache: true,
    cacheExpiryInMillis: 60000,
    // Throw an error if can't read the secret
    throwOnFailedCall: true,
    secrets: {
      AUTH0_SECRET: secretId
    }
  })
)
