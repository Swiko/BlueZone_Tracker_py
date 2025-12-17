import os
import asyncio
from pathlib import Path
from dotenv import load_dotenv
from aiogram import Bot, Dispatcher, types
from aiogram.filters import CommandStart
from aiogram.types import WebAppInfo, InlineKeyboardButton, InlineKeyboardMarkup

# 1. Надежная загрузка переменных из .env
BASE_DIR = Path(__file__).resolve().parent
load_dotenv(dotenv_path=BASE_DIR / ".env")

TOKEN = os.getenv("BOT_TOKEN")
URL_MAP = os.getenv("WEB_APP_URL")

if not TOKEN or not URL_MAP:
    exit("Ошибка: BOT_TOKEN или WEB_APP_URL не найдены в .env файле!")

bot = Bot(token=TOKEN)
dp = Dispatcher()


@dp.message(CommandStart())
async def cmd_start(message: types.Message):
    # Добавляем ?v=1 для форсированного обновления кэша Telegram
    web_app_link = f"{URL_MAP}?v=1.14"

    markup = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="📍 Открыть карту озёр", web_app=WebAppInfo(url=web_app_link))]
    ])

    await message.answer(
        f"Привет, {message.from_user.first_name}!\nЯ помогу найти озера Ленинградской области.",
        reply_markup=markup
    )


async def main():
    print(f"Бот запущен. Ссылка на карту: {URL_MAP}")
    await dp.start_polling(bot)


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except (KeyboardInterrupt, SystemExit):
        print("Бот остановлен")
