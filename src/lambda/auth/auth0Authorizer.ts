import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import {createLogger} from "../../utils/logger"
import { verify,decode } from 'jsonwebtoken'
import { JwtToken } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'
import Axios from "axios"


const jwksUrl = 'https://dev-8b0fovvy.us.auth0.com/.well-known/jwks.json'
const logger = createLogger("AuthLogger")
export const handler = middy(async (event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {
  try {
    logger.info('Initiate Token auth')
   
    const decodedToken = await verifyToken(
      event.authorizationToken
      
    )
   
    logger.info('User was token ', decodedToken)
    logger.info('User was authorized')
    logger.info("Payload is ",decodedToken)
  const sub = decodedToken.sub
  logger.info(`Payload sub is ${sub}`)
 

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
    logger.error('User was not authorized'+ e.message)

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


async function verifyToken(authHeader: string): Promise<JwtPayload> {
    if (!authHeader)
  {  logger.error("Invalid authentication header")
    throw new Error('No authentication header')
}
  if (!authHeader.toLowerCase().startsWith('bearer '))
  {  
      logger.error("Invalid authentication header")
      throw new Error('Invalid authentication header')
}
  const split = authHeader.split(' ')
  const token = split[1]
  const jwt = decode(token, { complete: true }) 
  
    
    const { header} = jwt as JwtToken;
  
    let key = await getSigningKey(jwksUrl, header.kid)
    const jwtVet = verify(token, key.publicKey, { algorithms: ['RS256'] })
    logger.info("Verified token ",jwtVet)
    const pysub = jwtVet as JwtPayload
    logger.info("Verified token ",jwtVet)
    return pysub as JwtPayload
  
  }
  
 
  
  const getSigningKey = async (jwkurl, kid) => {
    let res = await Axios.get(jwkurl, {
      headers: {
        'Content-Type': 'application/json',
        "Access-Control-Allow-Origin": "*",
        'Access-Control-Allow-Credentials': true,
      }
    });
    let keys  = res.data.keys;
    
    const signingKeys = keys.filter(key => key.use === 'sig'
        && key.kty === 'RSA' 
        && key.kid          
        && key.x5c && key.x5c.length
      ).map(key => {
        return { kid: key.kid, nbf: key.nbf, publicKey: con_cert(key.x5c[0]) };
      });
    const signingKey = signingKeys.find(key => key.kid === kid);
    if(!signingKey){
        logger.error("No signing keys")
      throw new Error('Invalid signing keys')
      
    }
  
    logger.info(`Signing keys is ${signingKey}`)
    return signingKey
  
  };
  
  function con_cert(cert) {
    cert = cert.match(/.{1,64}/g).join('\n');
    cert = `-----BEGIN CERTIFICATE-----\n${cert}\n-----END CERTIFICATE-----\n`;
    return cert;
  }
