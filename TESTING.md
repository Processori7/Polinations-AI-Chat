# Инструкция по тестированию плагина Pollinations AI Chat

## Подготовка к тестированию

### 1. Установка плагина в Obsidian

**Вариант A: Для тестирования (рекомендуется)**
1. Откройте Obsidian
2. Перейдите в Settings → Community Plugins → Open plugins folder
3. Создайте папку `pollinations-ai-chat` в папке plugins
4. Скопируйте файлы `main.js`, `manifest.json`, `styles.css` в созданную папку
5. Перезапустите Obsidian
6. Включите плагин в Settings → Community Plugins

**Вариант B: Для разработки**
1. Скопируйте всю папку проекта в `.obsidian/plugins/pollinations-ai-chat/`
2. В терминале перейдите в папку плагина
3. Выполните `npm install && npm run build`
4. Перезапустите Obsidian и включите плагин

### 2. Проверка установки
- В левой панели должна появиться иконка чата
- В Command Palette (Ctrl+P) должны быть доступны команды:
  - "Открыть ИИ чат"
  - "Быстрый вопрос ИИ"
- В Settings должна появиться секция "Pollinations AI"
