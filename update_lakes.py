import json
import os
import random

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(BASE_DIR, 'lakes.json')


def auto_update_lakes():
    if not os.path.exists(DATA_FILE):
        print("[❌] Файл lakes.json не найден!")
        return

    # 1. Читаем текущие данные
    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        lakes = json.load(f)

    print(f"[*] Считывание базы данных... Найдено озер: {len(lakes)}")

    # 2. Имитируем обновление статусов эко-мониторинга
    # (Здесь может быть ваш requests.get() к сайту мониторинга)
    changed = False
    for lake in lakes:
        # Для демонстрации работы автоматики меняем статус с вероятностью 20%
        if random.random() < 0.20:
            old_status = lake['status']
            new_status = "Unsafe" if old_status == "Safe" else "Safe"
            lake['status'] = new_status

            if new_status == "Unsafe":
                lake['description'] = "⚠️ Внимание! Последние пробы воды зафиксировали отклонения от санитарных норм."
            else:
                lake['description'] = "✅ Проверка пройдена. Вода полностью соответствует гигиеническим нормативам."

            print(f"[🔄] Статус озера '{lake['name']}' изменен: {old_status} -> {new_status}")
            changed = True

    # 3. Сохраняем обновленный JSON, если были изменения
    if changed:
        with open(DATA_FILE, 'w', encoding='utf-8') as f:
            json.dump(lakes, f, indent=2, ensure_ascii=False)
        print("[+] Файл lakes.json успешно обновлен автоматикой!")
    else:
        print("[|] Изменений в статусах водоемов сегодня не обнаружено.")


if __name__ == '__main__':
    auto_update_lakes()
