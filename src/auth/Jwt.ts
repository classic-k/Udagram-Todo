import { JwtPayload } from './JwtPayload'
import { JwtHeader } from 'jsonwebtoken'

/**
 * Interface representing a JWT token
 */
export interface JwtToken {
  header: JwtHeader
  payload: JwtPayload
}
