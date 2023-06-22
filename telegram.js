require('dotenv').config()

const TelegramBot = require('node-telegram-bot-api');
const {getCompletion} = require("./chat");

// replace the value below with the Telegram token you receive from @BotFather
const token = process.env.TELEGRAM_TOKEN;

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});

const chatIdCache = {}

// Listen for any kind of message. There are different kinds of
// messages.
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    if (msg.text === "/start") {
        chatIdCache[msg.chat.id] = []
        return await bot.sendMessage(msg.chat.id, "Welcome, to start a new chat please use /start (clears the ai memory), otherwise just type your message, enjoy!");
    }

    if (!chatIdCache[chatId]) {
        return await bot.sendMessage(chatId, "Please use /start to chat");
    }
    const message = msg.text;
    chatIdCache[chatId].push({
        "role": "user",
        "content": message
    })
    const chatResponse = await getCompletion(chatIdCache[chatId])
    if (!chatResponse) {
        return await bot.sendMessage(chatId, "Sorry, I didn't understand that, please try again!");
    }
    chatIdCache[chatId].push(chatResponse)
    await bot.sendMessage(chatId, chatResponse.content);
});
