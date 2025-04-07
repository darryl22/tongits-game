import {io} from "socket.io-client"
const URL = "http://localhost:3002"
// const URL = "http://185.202.239.81:3002"

export const socket = io(URL, {
    withCredentials: true
})