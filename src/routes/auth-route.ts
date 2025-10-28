import express,{Application} from 'express'
import { handleLogout, refreshToken } from '../modules/auth/controller'

const authRoute:Application=express()


authRoute.post('/refresh',refreshToken)
authRoute.post('/logout',handleLogout)

export default authRoute