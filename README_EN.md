# Pollinations AI Chat Plugin for Obsidian

[Русская версия](README.md)

A plugin for integration with Pollinations AI API, allowing you to chat with various AI models and generate images directly from Obsidian with automatic saving to notes.

## Features

- 🤖 Chat with various AI models via Pollinations API
- 🎨 AI image generation (Flux, Turbo, Zimage, and more)
- 💾 Automatic saving of conversations and images to notes
- ⚡ Quick questions with instant answer saving
- 🌍 Multilingual interface (English / Русский)
- 🔒 Free models filter for working without API key
- 🎭 Beautiful interface with dark/light theme
- 📱 Responsive design for mobile devices
- 🔧 Flexible settings

## Installation

### Option 1: Manual Installation
1. Download `main.js`, `manifest.json`, `styles.css` files or download archive from releases
2. Create `pollinations-ai-chat` folder in `.obsidian/plugins/`
3. Place files in the created folder
4. Restart Obsidian
5. Enable the plugin in settings

### Option 2: Development
1. Clone the repository: `git clone https://github.com/Processori7/Obsidian_PolinationsAI.git`
2. Navigate to folder: `cd Obsidian_PolinationsAI`
3. Run `npm install`
4. Run `npm run build`
5. Copy `main.js`, `manifest.json`, `styles.css` files to `.obsidian/plugins/` folder
6. Restart Obsidian
7. Enable the plugin in Obsidian settings (if not enabled)

## Usage

### Commands
- **Ctrl+P** → "Open AI chat" - open full chat interface
- **Ctrl+P** → "Quick AI question" - ask a question and save the answer
- **Ctrl+P** → "Generate AI image" - create image from description
- Click the icon in the left panel - open chat

### Chat Interface
1. Select an AI model from the dropdown list
2. Enter your question in the input field
3. Press Enter or "Send" button
4. Use "Save chat" and "Clear" buttons for management

### Image Generation
1. Open "Generate AI image" command
2. Select image model (Flux, Turbo, Zimage, etc.)
3. Describe the desired image
4. Adjust size (width × height)
5. Click "Generate"
6. Image will be automatically saved and inserted into the active note

### Settings
- **Interface language** - choose between English and Russian
- **Show only free models** - filter models that work without API key
- **Default model** - select preferred chat model
- **Default image model** - select preferred image generation model
- **Auto-save chats** - enable/disable automatic saving
- **Chats folder** - path for saving conversations
- **Images folder** - path for saving generated images
- **API token** - key for access to advanced features

## Available Models

The plugin automatically loads the list of available models from Pollinations API:

### Text Models
- GPT models (openai, openai-fast)
- Claude models
- Gemini models (gemini-fast)
- Llama models
- Qwen Coder
- Mistral
- DeepSeek
- Nova Micro
- And many more

### Image Generation Models
- **Zimage** - standard model (default)
- **Flux** - high quality
- **Turbo** - fast generation
- **GPT Image** - from OpenAI
- **Kontext** - context-aware generation
- **SeeDream** - artistic style
- **Nanobanana** - compact model

### Free Models
When "Show only free models" option is enabled:
- Text: openai, openai-fast, qwen-coder, mistral, gemini-fast, nova-micro, deepseek
- Images: all image models work without API key

## API Key

For access to advanced features and image generation, it's recommended to get an API key:

1. Go to [https://enter.pollinations.ai/sign-in](https://enter.pollinations.ai/sign-in)
2. Sign in or register
3. Get a **Server API Key** - it provides more capabilities
4. Add the key in plugin settings

> **Note:** Basic text models work without API key. The key is required for image generation and access to premium models.

## Saved Chats Structure
Chats are saved in Markdown format with the following structure:
```markdown
# Chat Title

**Model:** model-name
**Date:** date and time

---

## 👤 User

Your question

---

## 🤖 AI

AI response
```

## Development

### Requirements
- Node.js
- npm
- TypeScript

### Commands
```bash
npm install         # Install dependencies
npm run dev         # Development with hot-reload
npm run build       # Build for production
```

### Project Structure
```
├── main.ts          # Main plugin file
├── manifest.json    # Plugin manifest
├── styles.css       # Interface styles
├── package.json     # Dependencies
├── tsconfig.json    # TypeScript settings
├── esbuild.config.mjs # Build configuration
└── versions.json    # Plugin versions
```

## API
The plugin uses Pollinations AI API:
- **Text Generation:** `https://gen.pollinations.ai/v1/chat/completions`
- **Image Generation:** `https://gen.pollinations.ai/image/{prompt}`
- **Text models list:** `https://gen.pollinations.ai/text/models`
- **Image models list:** `https://gen.pollinations.ai/image/models`
- Free usage of basic models without registration
- Extended capabilities with API key
- Support for various models: OpenAI, Claude, Llama, Gemini, and more

### Text API Example:
```json
POST https://gen.pollinations.ai/v1/chat/completions
{
  "model": "openai",
  "messages": [
    {"role": "user", "content": "Hello, how are you?"}
  ],
  "private": true
}
```

### Image API Example:
```
GET https://gen.pollinations.ai/image/Beautiful%20sunset?model=flux&width=1024&height=1024&private=true&key=YOUR_API_KEY
```

Returns an image in PNG format.

## License

MIT License

## Support

If you have questions or suggestions, create an issue in the project repository.
