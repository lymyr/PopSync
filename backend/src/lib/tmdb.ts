import { TMDB } from "tmdb-ts"

process.loadEnvFile()
const token = process.env.TMDB_ACCESS_TOKEN
    if (!token)
        throw new Error("TMDB_ACCESS_TOKEN env variable is undefined")
const tmdb = new TMDB(token)

export default tmdb