const axios = require("axios");

module.exports = {
    "getCompletion": async function (message, model=36, voice=0) {
        const url = process.env.CHAT_API_URL
        const resp = (await axios.post(url, {
            "message": message,
            "voice": voice,
            "model": model
        })).data
        if (resp.error) {
            return null
        }
        return resp.data.response.raw_message
    }
}