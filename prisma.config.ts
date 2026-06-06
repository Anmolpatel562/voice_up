import { defineConfig } from "prisma/config"
import * as dotenv from "dotenv"

dotenv.config()

console.log("process.env.DATABASE_URL ==>> ", process.env.DATABASE_URL);
export default defineConfig({
    datasource: {
        url: process.env.DATABASE_URL,
    },
})