import express, { Request, Response } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import router from './routes'
dotenv.config()

const app = express()
const port = process.env.PORT as string
app.use(express.json())

app.use(cors())

app.get('/', (req: Request, res: Response) => {
  res.send('Knights Ecommerce API')
})
app.use(router)
app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`)
})
