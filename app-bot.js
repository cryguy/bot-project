require('dotenv').config()

const TelegramBot = require('node-telegram-bot-api');
const {getCompletion} = require("./chat");

let me
// replace the value below with the Telegram token you receive from @BotFather
const token = process.env.TELEGRAM_TOKEN;

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});

const chatIdCache = {}

function isMentioned(message) {
    try {
        if (message.chat.type === "private") {
            return true
        }
        if (message.text.includes("@" + me.username)) {
            return true
        }
        if (message.reply_to_message && message.reply_to_message.from.id === me.id) {
            return true
        }
    } catch (e) {
        return true
    }
    return false
}

// Listen for any kind of message. There are different kinds of
// messages.
bot.on('message', async (msg) => {
    // init the bot
    const chatId = msg.chat.id;
    if (!chatIdCache[chatId]) {
        chatIdCache[chatId] = []
    }
    if (msg.text === "/help" || msg.text === "/help@" + me.username) {
        return await bot.sendMessage(msg.chat.id, "Hi, to clear my memory just use /start or /reset, otherwise just type your message, enjoy!");
    }
    if (msg.text === "/start" || msg.text === "/start@" + me.username) {
        chatIdCache[chatId] = []
        return await bot.sendMessage(msg.chat.id, "Welcome, I'm a bot that can be a bit chatty and I can remember what you say, just type your message and I'll reply, if you want to clear my memory just use /reset, to get help use /help, enjoy!");
    }
    if (msg.text === "/reset" || msg.text === "/reset@" + me.username) {
        chatIdCache[chatId] = []
        return await bot.sendMessage(msg.chat.id, "My memory has been cleared :(");
    }

    // check if bot is mentioned (private, mention, or reply), if not, ignore the message
    if (!isMentioned(msg)) {
        return
    }

    // add the message along with the username to the cache
    chatIdCache[chatId].push({
        "role": "user", "content": msg.from.username + " said : " + msg.text
    })

    // get the response from the chat api
    const chatResponse = await getCompletion(chatIdCache[chatId])
    if (!chatResponse) {
        return await bot.sendMessage(chatId, "Sorry, I didn't understand that, please try again!");
    }
    chatIdCache[chatId].push(chatResponse)

    // send the response back
    await bot.sendMessage(chatId, chatResponse.content);
});

bot.getMe().then((info) => {
    me = info
    console.log("Bot started!")
    console.log("Bot info: ", info)
})