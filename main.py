import asyncio
import logging
from aiogram import Bot, Dispatcher, types
from aiogram.filters import CommandStart
from aiogram.types import WebAppInfo, InlineKeyboardButton, InlineKeyboardMarkup

# Вставьте ваш токен
TOKEN = "ВАШ_ТОКЕН_ИЗ_BOTFATHER"
# Вставьте ссылку на ваш развернутый index.html
WEB_APP_URL = "your-domain.com"

bot = Bot(token=TOKEN)
dp = Dispatcher()


@dp.message(CommandStart())
async def start_cmd(message: types.Message):
    # Создаем клавиатуру с кнопкой Mini App
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(
                text="📍 Открыть карту озёр",
                web_app=WebAppInfo(url=WEB_APP_URL)
            )
        ]
    ])

    await message.answer(
        "Привет! Нажми на кнопку ниже, чтобы увидеть интерактивную карту озер Ленинградской области.",
        reply_markup=keyboard
    )


async def main():
    logging.basicConfig(level=logging.INFO)
    print("Бот запущен!")
    await dp.start_polling(bot)


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("Бот выключен")