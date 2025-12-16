import os
import asyncio
from dotenv import load_dotenv # Импортируем библиотеку
from aiogram import Bot, Dispatcher, types
from aiogram.filters import CommandStart
from aiogram.types import WebAppInfo, InlineKeyboardButton, InlineKeyboardMarkup

# Загружаем переменные из файла .env в систему
load_dotenv()

# Достаем значения переменных окружения
TOKEN = os.getenv("BOT_TOKEN")
URL_MAP = os.getenv("WEB_APP_URL")

# Проверка, что переменные загрузились (для отладки)
if not TOKEN:
    exit("Ошибка: Токен не найден в .env файле!")

bot = Bot(token=TOKEN)
dp = Dispatcher()

@dp.message(CommandStart())
async def start(message: types.Message):
    markup = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="🗺 Открыть карту", web_app=WebAppInfo(url=URL_MAP))]
    ])
    await message.answer("Бот запущен безопасно!", reply_markup=markup)

async def main():
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())