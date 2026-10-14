import { App, Plugin, PluginSettingTab, Setting, Notice, Modal, TextComponent, ButtonComponent, DropdownComponent, requestUrl } from 'obsidian';

interface PollinationsAISettings {
	defaultModel: string;
	saveToNotes: boolean;
	notesFolder: string;
	apiToken: string;
	imagesFolder: string;
	defaultImageModel: string;
	videosFolder: string;
	audioFolder: string;
	defaultVideoModel: string;
	language: 'en' | 'ru';
	showFreeModelsOnly: boolean;
}

const DEFAULT_SETTINGS: PollinationsAISettings = {
	defaultModel: 'openai',
	saveToNotes: true,
	notesFolder: 'AI chats',
	apiToken: '',
	imagesFolder: 'AI images',
	defaultImageModel: 'zimage',
	videosFolder: 'AI videos',
	audioFolder: 'AI audio',
	defaultVideoModel: 'veo',
	language: 'en',
	showFreeModelsOnly: false
}

const TRANSLATIONS = {
	en: {
		// Commands
		openAIChat: 'Open AI chat',
		quickAIQuestion: 'Quick AI question',
		generateAIImage: 'Generate AI image',
		generateAIVideo: 'Generate AI video',
		generateAIAudio: 'Generate AI audio',
		aiChat: 'AI chat',
		
		// Modal titles
		aiChatTitle: 'AI chat',
		quickQuestionTitle: 'Quick AI question',
		imageGenerationTitle: 'Generate AI image',
		videoGenerationTitle: 'Generate AI video',
		audioGenerationTitle: 'Generate AI audio',
		
		// Labels
		model: 'Model',
		prompt: 'Prompt',
		size: 'Size',
		yourQuestion: 'Your question',
		duration: 'Duration (seconds)',
		aspectRatio: 'Aspect ratio',
		voice: 'Voice',
		attachImage: 'Attach image',
		uploadImage: 'Upload image',
		
		// Placeholders
		enterQuestion: 'Enter your question...',
		enterPrompt: 'Describe the image you want to generate...',
		enterToken: 'Enter token...',
		
		// Buttons
		send: 'Send',
		saveChat: 'Save chat',
		clear: 'Clear',
		ask: 'Ask',
		cancel: 'Cancel',
		generate: 'Generate',
		
		// Messages
		thinking: 'Thinking...',
		noMessages: 'No messages to save',
		enterQuestionMsg: 'Enter a question',
		enterPromptMsg: 'Enter a prompt',
		chatSaved: 'Chat saved to',
		saveError: 'Save error',
		imageSaved: 'Image saved',
		imageError: 'Failed to save image',
		videoSaved: 'Video saved',
		videoError: 'Failed to save video',
		audioSaved: 'Audio saved',
		audioError: 'Failed to save audio',
		generating: 'Generating image...',
		generatingVideo: 'Generating video...',
		generatingAudio: 'Generating audio...',
		answerSaved: 'Answer saved to note',
		unexpectedResponse: 'Unexpected API response',
		error: 'Error',
		imageUploaded: 'Image uploaded',
		
		// User/AI labels
		user: 'You',
		ai: 'AI',
		
		// Settings
		settingsTitle: 'Pollinations AI settings',
		defaultModel: 'Default model',
		defaultModelDesc: 'Select default AI model',
		saveChatsToNotes: 'Save chats to notes',
		saveChatsDesc: 'Automatically save AI conversations to notes',
		notesFolder: 'Notes folder',
		notesFolderDesc: 'Folder where AI chats will be saved',
		apiToken: 'API token',
		apiTokenDesc: 'Access token for API (optional)',
		imagesFolder: 'Images folder',
		imagesFolderDesc: 'Folder where generated images will be saved',
		defaultImageModel: 'Default image model',
		defaultImageModelDesc: 'Default model for image generation',
		videosFolder: 'Videos folder',
		videosFolderDesc: 'Folder where generated videos will be saved',
		defaultVideoModel: 'Default video model',
		defaultVideoModelDesc: 'Default model for video generation',
		audioFolder: 'Audio folder',
		audioFolderDesc: 'Folder where generated audio will be saved',
		language: 'Language',
		languageDesc: 'Interface language',
		showFreeModelsOnly: 'Show only free models',
		showFreeModelsOnlyDesc: 'Show only models that work without API key',
		
		// Model categories
		categoryText: 'Text',
		categoryImages: 'Images',
		categoryVideo: 'Video',
		categoryAudio: 'Audio',
		
		// Image models
		imageModelZimage: 'Zimage (default)',
		imageModelFlux: 'Flux',
		imageModelTurbo: 'Turbo (fast)',
		imageModelGPT: 'GPT image',
		imageModelKontext: 'Kontext',
		imageModelSeeDream: 'SeeDream',
		imageModelNanobanana: 'Nanobanana'
	},
	ru: {
		// Commands
		openAIChat: 'Открыть ИИ чат',
		quickAIQuestion: 'Быстрый вопрос ИИ',
		generateAIImage: 'Генерировать ИИ изображение',
		generateAIVideo: 'Генерировать ИИ видео',
		generateAIAudio: 'Генерировать ИИ аудио',
		aiChat: 'ИИ чат',
		
		// Modal titles
		aiChatTitle: 'ИИ чат',
		quickQuestionTitle: 'Быстрый вопрос ИИ',
		imageGenerationTitle: 'Генерация ИИ изображения',
		videoGenerationTitle: 'Генерация ИИ видео',
		audioGenerationTitle: 'Генерация ИИ аудио',
		
		// Labels
		model: 'Модель',
		prompt: 'Промпт',
		size: 'Размер',
		yourQuestion: 'Ваш вопрос',
		duration: 'Длительность (секунды)',
		aspectRatio: 'Соотношение сторон',
		voice: 'Голос',
		attachImage: 'Прикрепить изображение',
		uploadImage: 'Загрузить изображение',
		
		// Placeholders
		enterQuestion: 'Введите ваш вопрос...',
		enterPrompt: 'Опишите изображение, которое хотите сгенерировать...',
		enterToken: 'Введите токен...',
		
		// Buttons
		send: 'Отправить',
		saveChat: 'Сохранить чат',
		clear: 'Очистить',
		ask: 'Спросить',
		cancel: 'Отмена',
		generate: 'Генерировать',
		
		// Messages
		thinking: 'Думаю...',
		noMessages: 'Нет сообщений для сохранения',
		enterQuestionMsg: 'Введите вопрос',
		enterPromptMsg: 'Введите промпт',
		chatSaved: 'Чат сохранен в',
		saveError: 'Ошибка сохранения',
		imageSaved: 'Изображение сохранено',
		imageError: 'Не удалось сохранить изображение',
		videoSaved: 'Видео сохранено',
		videoError: 'Не удалось сохранить видео',
		audioSaved: 'Аудио сохранено',
		audioError: 'Не удалось сохранить аудио',
		generating: 'Генерация изображения...',
		generatingVideo: 'Генерация видео...',
		generatingAudio: 'Генерация аудио...',
		answerSaved: 'Ответ сохранен в заметку',
		unexpectedResponse: 'Получен неожиданный ответ от API',
		error: 'Ошибка',
		imageUploaded: 'Изображение загружено',
		
		// User/AI labels
		user: 'Вы',
		ai: 'ИИ',
		
		// Settings
		settingsTitle: 'Настройки Pollinations AI',
		defaultModel: 'Модель по умолчанию',
		defaultModelDesc: 'Выберите модель ИИ по умолчанию',
		saveChatsToNotes: 'Сохранять чаты в заметки',
		saveChatsDesc: 'Автоматически сохранять разговоры с ИИ в заметки',
		notesFolder: 'Папка для заметок',
		notesFolderDesc: 'Папка, куда будут сохраняться чаты с ИИ',
		apiToken: 'API токен',
		apiTokenDesc: 'Токен для доступа к API (опционально)',
		imagesFolder: 'Папка для изображений',
		imagesFolderDesc: 'Папка, куда будут сохраняться сгенерированные изображения',
		defaultImageModel: 'Модель изображений по умолчанию',
		defaultImageModelDesc: 'Модель для генерации изображений по умолчанию',
		videosFolder: 'Папка для видео',
		videosFolderDesc: 'Папка, куда будут сохраняться сгенерированные видео',
		defaultVideoModel: 'Модель видео по умолчанию',
		defaultVideoModelDesc: 'Модель для генерации видео по умолчанию',
		audioFolder: 'Папка для аудио',
		audioFolderDesc: 'Папка, куда будут сохраняться сгенерированные аудио',
		language: 'Язык',
		languageDesc: 'Язык интерфейса',
		showFreeModelsOnly: 'Показывать только бесплатные модели',
		showFreeModelsOnlyDesc: 'Показывать только модели, работающие без API ключа',
		
		// Model categories
		categoryText: 'Текст',
		categoryImages: 'Картинки',
		categoryVideo: 'Видео',
		categoryAudio: 'Аудио',
		
		// Image models
		imageModelZimage: 'Zimage (по умолчанию)',
		imageModelFlux: 'Flux',
		imageModelTurbo: 'Turbo (быстрая)',
		imageModelGPT: 'GPT Image',
		imageModelKontext: 'Kontext',
		imageModelSeeDream: 'SeeDream',
		imageModelNanobanana: 'Nanobanana'
	}
};

interface AIModel {
	name: string;
	aliases?: string[];
	description: string;
	input_modalities: string[];
	output_modalities?: string[];
}

interface ChatMessage {
	role: 'user' | 'assistant';
	content: string;
	timestamp: Date;
}

interface APIModelResponse {
	name: string;
	aliases?: string[];
	description?: string;
	input_modalities?: string[];
	output_modalities?: string[];
	is_specialized?: boolean;
}

export default class PollinationsAIPlugin extends Plugin {
	settings: PollinationsAISettings;
	models: AIModel[] = [];
	currentModel: string;

	t(key: keyof typeof TRANSLATIONS.en): string {
		return TRANSLATIONS[this.settings.language][key];
	}

	findModel(modelName: string): AIModel | undefined {
		return this.models.find(m => m.name === modelName || m.aliases?.includes(modelName));
	}

	getCategoryForModel(modelName: string): string {
		const outputs = this.findModel(modelName)?.output_modalities;
		if (outputs?.includes('video')) return this.t('categoryVideo');
		if (outputs?.includes('image')) return this.t('categoryImages');
		if (outputs?.includes('audio')) return this.t('categoryAudio');
		if (outputs?.includes('text')) return this.t('categoryText');

		const name = modelName.toLowerCase();
		// Video generation models
		if (name === 'veo' || name.includes('seedance')) {
			return this.t('categoryVideo');
		}
		// Image generation models
		if (name.includes('flux') || name === 'turbo' || name === 'gptimage' || 
		    name === 'kontext' || name.includes('seedream') || name.includes('nanobanana') ||
		    name === 'zimage') {
			return this.t('categoryImages');
		}
		// Audio models (music, speech, etc.)
		if (name.includes('audio') || name.includes('tts') || name.includes('speech') ||
		    name.includes('midijourney')) {
			return this.t('categoryAudio');
		}
		// Default to text models
		return this.t('categoryText');
	}

	modelSupportsImages(modelName: string): boolean {
		const model = this.findModel(modelName);
		if (!model || !model.input_modalities) return false;
		return model.input_modalities.indexOf('image') !== -1 || model.input_modalities.indexOf('vision') !== -1;
	}

	modelSupportsImageInput(modelName: string): boolean {
		// Check if model supports image input based on API model data
		const model = this.findModel(modelName);
		if (!model || !model.input_modalities) return false;
		return model.input_modalities.includes('image');
	}

	isModelFree(modelName: string): boolean {
		const name = modelName.toLowerCase();
		// Models available in free tier (cheapest models based on pricing)
		const freeModels = [
			// Text models (cheapest)
			'openai', 'openai-fast', 'qwen-coder', 'mistral', 'gemini-fast', 'nova-micro', 'deepseek',
			// Image models (basic free tier)
			'flux', 'turbo', 'gptimage', 'kontext', 'seedream', 'nanobanana', 'zimage'
		];
		const model = this.findModel(modelName);
		return freeModels.some(id => id === name || model?.aliases?.includes(id));
	}

	async onload() {
		await this.loadSettings();
		this.currentModel = this.settings.defaultModel;

		// Загружаем доступные модели
		void this.loadModels();

		// Добавляем команду для открытия чата
		this.addCommand({
			id: 'open-ai-chat',
			name: this.t('openAIChat'),
			callback: () => {
				new AIchatModal(this.app, this).open();
			}
		});

		// Добавляем команду для быстрого вопроса
		this.addCommand({
			id: 'quick-ai-question',
			name: this.t('quickAIQuestion'),
			callback: () => {
				new QuickQuestionModal(this.app, this).open();
			}
		});

		// Добавляем команду для генерации изображений
		this.addCommand({
			id: 'generate-ai-image',
			name: this.t('generateAIImage'),
			callback: () => {
				new ImageGenerationModal(this.app, this).open();
			}
		});

		// Добавляем команду для генерации видео
		this.addCommand({
			id: 'generate-ai-video',
			name: this.t('generateAIVideo'),
			callback: () => {
				new VideoGenerationModal(this.app, this).open();
			}
		});

		// Добавляем команду для генерации аудио
		this.addCommand({
			id: 'generate-ai-audio',
			name: this.t('generateAIAudio'),
			callback: () => {
				new AudioGenerationModal(this.app, this).open();
			}
		});

		// Добавляем настройки
		this.addSettingTab(new PollinationsAISettingTab(this.app, this));

		// Добавляем иконку в левую панель
		this.addRibbonIcon('message-circle', this.t('aiChat'), (evt: MouseEvent) => {
			new AIchatModal(this.app, this).open();
		});
	}

		async loadModels() {
		// Список моделей по умолчанию на случай проблем с API
		const defaultModels: AIModel[] = [
			{ name: 'openai', description: 'OpenAI GPT-5 Mini', input_modalities: ['text'] },
			{ name: 'mistral', description: 'Mistral Small', input_modalities: ['text'] },
			{ name: 'gemini-fast', description: 'Gemini Flash Lite', input_modalities: ['text'] },
			{ name: 'qwen-coder', description: 'Qwen Coder', input_modalities: ['text'] },
			{ name: 'flux', description: 'Flux Image Generator', input_modalities: ['text'] },
			{ name: 'turbo', description: 'Turbo Image (Fast)', input_modalities: ['text'] }
		];

		try {
			const headers: Record<string, string> = {};
			if (this.settings.apiToken) {
				headers['Authorization'] = `Bearer ${this.settings.apiToken}`;
			}

			// Load text models
			const textResponse = await requestUrl({ 
				url: 'https://gen.pollinations.ai/text/models',
				method: 'GET',
				headers,
				throw: false
			});
			
			// Load image models
			const imageResponse = await requestUrl({ 
				url: 'https://gen.pollinations.ai/image/models',
				method: 'GET',
				headers,
				throw: false
			});
			
			console.debug('Text models response:', textResponse);
			console.debug('Image models response:', imageResponse);
			
			const allModels: AIModel[] = [];
			
			// Process text models
			if (textResponse.status === 200 && textResponse.json && Array.isArray(textResponse.json)) {
				const textModels = textResponse.json
					.filter((m: APIModelResponse) => !m.is_specialized) // Exclude specialized models (midijourney, chickytutor)
					.map((model: APIModelResponse) => ({
						name: model.name,
						aliases: model.aliases,
						description: model.description || model.name,
						output_modalities: model.output_modalities,
						input_modalities: model.input_modalities || ['text']
					}));
				allModels.push(...textModels);
			}
			
			// Process image models
			if (imageResponse.status === 200 && imageResponse.json && Array.isArray(imageResponse.json)) {
				const imageModels = imageResponse.json
					.filter((m: APIModelResponse) => !m.is_specialized)
					.map((model: APIModelResponse) => ({
						name: model.name,
						aliases: model.aliases,
						description: model.description || model.name,
						output_modalities: model.output_modalities,
						input_modalities: model.input_modalities || ['text']
					}));
				allModels.push(...imageModels);
			}
			
			if (allModels.length > 0) {
				this.models = allModels;
				console.debug('Loaded models:', this.models);
				return;
			}
			
			console.warn('API response not valid, using default models');
			this.models = defaultModels;
		} catch (error) {
			console.warn('Не удалось загрузить модели из API, используем список по умолчанию:', error);
			this.models = defaultModels;
		}
	}

	async communicateWithAI(modelName: string, messages: { role: string; content: string | Array<{type: string; text?: string; image_url?: {url: string}}> }[]): Promise<{ error?: string; choices?: Array<{ message: { content: string } }> }> {
		try {
			const headers: Record<string, string> = {
				'Content-Type': 'application/json'
			};
			
			if (this.settings.apiToken) {
				headers['Authorization'] = `Bearer ${this.settings.apiToken}`;
			}

			const requestBody = {
				model: modelName,
				messages: messages,
				private: true
			};

			console.debug('Pollinations API запрос:', {
				url: 'https://gen.pollinations.ai/v1/chat/completions',
				model: modelName,
				messages: messages
			});

			const response = await requestUrl({
				url: 'https://gen.pollinations.ai/v1/chat/completions',
				method: 'POST',
				headers,
				body: JSON.stringify(requestBody),
				throw: false
			});

			if (response.status === 200 && response.json) {
				return response.json;
			} else {
				return { error: `HTTP ${response.status}` };
			}
		} catch (error) {
			return { error: error.toString() };
		}
	}

	async saveConversationToNote(conversation: ChatMessage[], title: string) {
		if (!this.settings.saveToNotes) return;

		const folderPath = this.settings.notesFolder;
		
		// Создаем папку если её нет
		if (!this.app.vault.getAbstractFileByPath(folderPath)) {
			await this.app.vault.createFolder(folderPath);
		}

		const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
		const fileName = `${title || 'ИИ чат'} ${timestamp}.md`;
		const filePath = `${folderPath}/${fileName}`;

		let content = `# ${title || 'ИИ чат'}\n\n`;
		content += `**Модель:** ${this.currentModel}\n`;
		content += `**Дата:** ${new Date().toLocaleString('ru-RU')}\n\n`;
		content += `---\n\n`;

		conversation.forEach((message, index) => {
			const roleIcon = message.role === 'user' ? '👤' : '🤖';
			const roleText = message.role === 'user' ? 'Пользователь' : 'ИИ';
			
			content += `## ${roleIcon} ${roleText}\n\n`;
			content += `${message.content}\n\n`;
			
			if (index < conversation.length - 1) {
				content += `---\n\n`;
			}
		});

		try {
			await this.app.vault.create(filePath, content);
			new Notice(`${this.t('chatSaved')} ${filePath}`);
		} catch (error) {
			new Notice(`${this.t('saveError')}: ${error}`);
		}
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async generateImage(prompt: string, model: string = 'zimage', width: number = 1024, height: number = 1024, referenceImage?: string | null): Promise<{ error?: string; imageData?: ArrayBuffer; filename?: string }> {
		try {
			// Image generation requires API key
			if (!this.settings.apiToken) {
				return { error: 'API key required for image generation. Please add it in settings.' };
			}
			
			// Build the URL for image generation
			const url = new URL(`https://gen.pollinations.ai/image/${encodeURIComponent(prompt)}`);
			url.searchParams.set('model', model);
			url.searchParams.set('width', width.toString());
			url.searchParams.set('height', height.toString());
			url.searchParams.set('nologo', 'true');
			url.searchParams.set('private', 'true');
			url.searchParams.set('key', this.settings.apiToken);
			
			// Image-to-image: only works with public HTTP/HTTPS URLs
			if (referenceImage && this.modelSupportsImageInput(model)) {
				// Check if it's a public URL (not base64)
				if (referenceImage.startsWith('http://') || referenceImage.startsWith('https://')) {
					// Public URL - API will accept it
					url.searchParams.set('image', referenceImage);
					console.debug('Image-to-image with URL:', referenceImage.substring(0, 100));
				} else if (referenceImage.startsWith('data:')) {
					// Base64 data URL - not supported due to URL length limits
					return { 
						error: 'Local files cannot be used for image editing. Please use a public image URL (http:// or https://) instead.' 
					};
				}
			}

			console.debug('Generating image...');

			const response = await requestUrl({
				url: url.toString(),
				method: 'GET',
				throw: false
			});

			console.debug('Image generation response:', { status: response.status, hasArrayBuffer: !!response.arrayBuffer });

			if (response.status === 200 && response.arrayBuffer) {
				const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
				const filename = `ai-image-${timestamp}.png`;
				return { 
					imageData: response.arrayBuffer,
					filename
				};
			} else {
				const errorText = response.text || response.json ? JSON.stringify(response.json) : 'Unknown error';
				return { error: `HTTP ${response.status}: ${errorText}` };
			}
		} catch (error) {
			return { error: error.toString() };
		}
	}

	async saveImage(imageData: ArrayBuffer, filename: string): Promise<string | null> {
		try {
			const folderPath = this.settings.imagesFolder;
			
			// Создаем папку если её нет
			if (!this.app.vault.getAbstractFileByPath(folderPath)) {
				await this.app.vault.createFolder(folderPath);
			}

			const filePath = `${folderPath}/${filename}`;
			
			// Сохраняем изображение
			await this.app.vault.createBinary(filePath, imageData);
			
			return filePath;
		} catch (error) {
			console.error('Error saving image:', error);
			return null;
		}
	}

	async generateVideo(prompt: string, model: string = 'veo', duration: number = 4, aspectRatio: string = '16:9', referenceImage?: string): Promise<{ error?: string; videoData?: ArrayBuffer; filename?: string }> {
		try {
			if (!this.settings.apiToken) {
				return { error: 'API key required for video generation. Please add it in settings.' };
			}
			
			const url = new URL(`https://gen.pollinations.ai/image/${encodeURIComponent(prompt)}`);
			url.searchParams.set('model', model);
			url.searchParams.set('duration', duration.toString());
			url.searchParams.set('aspectRatio', aspectRatio);
			url.searchParams.set('nologo', 'true');
			url.searchParams.set('private', 'true');
			url.searchParams.set('key', this.settings.apiToken);
			
			if (referenceImage) {
				url.searchParams.set('image', referenceImage);
			}

			const response = await requestUrl({
				url: url.toString(),
				method: 'GET',
				throw: false
			});

			if (response.status === 200 && response.arrayBuffer) {
				const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
				const filename = `ai-video-${timestamp}.mp4`;
				return { 
					videoData: response.arrayBuffer,
					filename
				};
			} else {
				const errorText = response.text || response.json ? JSON.stringify(response.json) : 'Unknown error';
				return { error: `HTTP ${response.status}: ${errorText}` };
			}
		} catch (error) {
			return { error: error.toString() };
		}
	}

	async saveVideo(videoData: ArrayBuffer, filename: string): Promise<string | null> {
		try {
			const folderPath = this.settings.videosFolder;
			
			if (!this.app.vault.getAbstractFileByPath(folderPath)) {
				await this.app.vault.createFolder(folderPath);
			}

			const filePath = `${folderPath}/${filename}`;
			await this.app.vault.createBinary(filePath, videoData);
			
			return filePath;
		} catch (error) {
			console.error('Error saving video:', error);
			return null;
		}
	}

	async generateAudio(text: string, voice: string = 'alloy'): Promise<{ error?: string; audioData?: ArrayBuffer; filename?: string }> {
		try {
			if (!this.settings.apiToken) {
				return { error: 'API key required for audio generation. Please add it in settings.' };
			}
			
			const headers: Record<string, string> = {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${this.settings.apiToken}`
			};

			const requestBody = {
				model: 'openai',
				messages: [{ role: 'user', content: text }],
				modalities: ['audio'],
				audio: {
					voice: voice,
					format: 'wav'
				}
			};

			const response = await requestUrl({
				url: 'https://gen.pollinations.ai/v1/chat/completions',
				method: 'POST',
				headers,
				body: JSON.stringify(requestBody),
				throw: false
			});

			if (response.status === 200 && response.json) {
				const audioData = response.json.choices?.[0]?.message?.audio?.data;
				if (audioData) {
					// Convert base64 to ArrayBuffer
					const binaryString = atob(audioData);
					const bytes = new Uint8Array(binaryString.length);
					for (let i = 0; i < binaryString.length; i++) {
						bytes[i] = binaryString.charCodeAt(i);
					}
					
					const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
					const filename = `ai-audio-${timestamp}.wav`;
					return { 
						audioData: bytes.buffer,
						filename
					};
				} else {
					return { error: 'No audio data in response' };
				}
			} else {
				const errorText = response.text || response.json ? JSON.stringify(response.json) : 'Unknown error';
				return { error: `HTTP ${response.status}: ${errorText}` };
			}
		} catch (error) {
			return { error: error.toString() };
		}
	}

	async saveAudio(audioData: ArrayBuffer, filename: string): Promise<string | null> {
		try {
			const folderPath = this.settings.audioFolder;
			
			if (!this.app.vault.getAbstractFileByPath(folderPath)) {
				await this.app.vault.createFolder(folderPath);
			}

			const filePath = `${folderPath}/${filename}`;
			await this.app.vault.createBinary(filePath, audioData);
			
			return filePath;
		} catch (error) {
			console.error('Error saving audio:', error);
			return null;
		}
	}
}

class AIchatModal extends Modal {
	plugin: PollinationsAIPlugin;
	conversation: ChatMessage[] = [];
	chatContainer: HTMLElement;
	inputElement: TextComponent;
	modelSelect: DropdownComponent;
	attachedImageUrl: string | null = null;
	attachedImageEl: HTMLElement | null = null;
	promptHistory: string[] = [];
	historyIndex: number = -1;

	constructor(app: App, plugin: PollinationsAIPlugin) {
		super(app);
		this.plugin = plugin;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();

		contentEl.createEl('h2', { text: this.plugin.t('aiChatTitle') });

		// Выбор модели
		const modelContainer = contentEl.createDiv('model-selector');
		modelContainer.createEl('label', { text: this.plugin.t('model') + ':' });
		
		this.modelSelect = new DropdownComponent(modelContainer);
		
		// Filter models based on showFreeModelsOnly setting
		const modelsToShow = this.plugin.settings.showFreeModelsOnly 
			? this.plugin.models.filter(m => this.plugin.isModelFree(m.name))
			: this.plugin.models;
		
		// Group models by category
		const categories = new Map<string, AIModel[]>();
		modelsToShow.forEach(model => {
			const category = this.plugin.getCategoryForModel(model.name);
			if (!categories.has(category)) {
				categories.set(category, []);
			}
			const categoryModels = categories.get(category);
			if (categoryModels) {
				categoryModels.push(model);
			}
		});
		
		// Add models by category
		categories.forEach((models, category) => {
			models.forEach(model => {
			this.modelSelect.addOption(model.name, `[${category}] ${model.description}`);
		});
	});
	
	this.modelSelect.setValue(this.plugin.currentModel);
	this.modelSelect.onChange((value) => {
		this.plugin.currentModel = value;
	});

	// Контейнер для чата
	this.chatContainer = contentEl.createDiv('chat-container');

	// Контейнер для ввода
		const inputContainer = contentEl.createDiv('input-container');
		
		this.inputElement = new TextComponent(inputContainer);
		this.inputElement.inputEl.placeholder = this.plugin.t('enterQuestion');
		this.inputElement.inputEl.addClass('input-wide');
		this.inputElement.inputEl.addClass('chat-input-multiline');
		this.inputElement.inputEl.addEventListener('keydown', (e) => {
			if (e.key === 'Enter' && !e.shiftKey) {
				e.preventDefault();
				void this.sendMessage();
			} else if (e.key === 'ArrowUp') {
				e.preventDefault();
				this.navigateHistory('up');
			} else if (e.key === 'ArrowDown') {
				e.preventDefault();
				this.navigateHistory('down');
			}
		});

		// Кнопка отправки
		const sendButton = new ButtonComponent(inputContainer);
		sendButton.setButtonText(this.plugin.t('send'));
		sendButton.onClick(() => void this.sendMessage());

		// Кнопки управления
		const buttonContainer = contentEl.createDiv('button-container');

		const saveButton = new ButtonComponent(buttonContainer);
		saveButton.setButtonText(this.plugin.t('saveChat'));
		saveButton.onClick(() => void this.saveChat());

		const clearButton = new ButtonComponent(buttonContainer);
		clearButton.setButtonText(this.plugin.t('clear'));
		clearButton.onClick(() => this.clearChat());
	}

	async sendMessage() {
		const message = this.inputElement.getValue().trim();
		if (!message) return;

		// Save to history
		this.promptHistory.push(message);
		this.historyIndex = this.promptHistory.length;

		// Добавляем сообщение пользователя
		this.addMessage('user', message);
		this.inputElement.setValue('');

		// Проверяем, является ли модель моделью изображений/видео
		const category = this.plugin.getCategoryForModel(this.plugin.currentModel);
		const isImageModel = category === this.plugin.t('categoryImages');
		const isVideoModel = category === this.plugin.t('categoryVideo');

		// Показываем индикатор загрузки
		const loadingEl = this.chatContainer.createDiv('loading-message');
		loadingEl.textContent = '🤖 ' + this.plugin.t('thinking');

		try {
			if (isVideoModel) {
				// Генерация видео
				const result = await this.plugin.generateVideo(message, this.plugin.currentModel, 4, '16:9');
				
				loadingEl.remove();

				if (result.error) {
					this.addMessage('assistant', `${this.plugin.t('error')}: ${result.error}`);
				} else if (result.videoData && result.filename) {
					const filePath = await this.plugin.saveVideo(result.videoData, result.filename);
					
					if (filePath) {
						this.addMessage('assistant', `${this.plugin.t('videoSaved')}: [[${filePath}]]`);
					} else {
						this.addMessage('assistant', this.plugin.t('videoError'));
					}
				}
			} else if (isImageModel) {
				// Генерация изображения
				const result = await this.plugin.generateImage(
					message, 
					this.plugin.currentModel, 
					1024, 
					1024
				);
				
				loadingEl.remove();

				if (result.error) {
					this.addMessage('assistant', `${this.plugin.t('error')}: ${result.error}`);
				} else if (result.imageData && result.filename) {
					const filePath = await this.plugin.saveImage(result.imageData, result.filename);
					
					if (filePath) {
						this.addMessage('assistant', `${this.plugin.t('imageSaved')}: [[${filePath}]]`);
					} else {
						this.addMessage('assistant', this.plugin.t('imageError'));
					}
				}
			} else {
				// Текстовый чат
				const messages = this.conversation.map(msg => ({
					role: msg.role,
					content: msg.content
				}));

				const response = await this.plugin.communicateWithAI(this.plugin.currentModel, messages);
				
				loadingEl.remove();

				if (response.error) {
					this.addMessage('assistant', `${this.plugin.t('error')}: ${response.error}`);
				} else if (response.choices && response.choices[0] && response.choices[0].message) {
					this.addMessage('assistant', response.choices[0].message.content);
				} else {
					this.addMessage('assistant', this.plugin.t('unexpectedResponse'));
				}
			}
		} catch (error) {
			loadingEl.remove();
			this.addMessage('assistant', `${this.plugin.t('error')}: ${error}`);
		}
	}

	navigateHistory(direction: 'up' | 'down') {
		if (this.promptHistory.length === 0) return;
		
		if (direction === 'up') {
			if (this.historyIndex > 0) {
				this.historyIndex--;
				this.inputElement.setValue(this.promptHistory[this.historyIndex]);
			}
		} else {
			if (this.historyIndex < this.promptHistory.length - 1) {
				this.historyIndex++;
				this.inputElement.setValue(this.promptHistory[this.historyIndex]);
			} else {
				// At the end, clear input
				this.historyIndex = this.promptHistory.length;
				this.inputElement.setValue('');
			}
		}
	}

	addMessage(role: 'user' | 'assistant', content: string) {
		const message: ChatMessage = {
			role,
			content,
			timestamp: new Date()
		};
		this.conversation.push(message);

		const messageEl = this.chatContainer.createDiv('chat-message');
		messageEl.addClass(role === 'user' ? 'user-message' : 'assistant-message');
		
		const roleIcon = role === 'user' ? '👤' : '🤖';
		const roleText = role === 'user' ? this.plugin.t('user') : this.plugin.t('ai');
		
		const headerDiv = messageEl.createDiv('message-header');
		const headerStrong = headerDiv.createEl('strong');
		headerStrong.textContent = `${roleIcon} ${roleText}`;
		const headerSmall = headerDiv.createEl('small');
		headerSmall.textContent = message.timestamp.toLocaleTimeString('ru-RU');
		
		const contentDiv = messageEl.createDiv('message-content');
		contentDiv.textContent = content;

	}

	async saveChat() {
		if (this.conversation.length === 0) {
			new Notice(this.plugin.t('noMessages'));
			return;
		}

		const title = `Чат с ${this.plugin.currentModel}`;
		await this.plugin.saveConversationToNote(this.conversation, title);
	}

	clearChat() {
		this.conversation = [];
		this.chatContainer.empty();
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

class QuickQuestionModal extends Modal {
	plugin: PollinationsAIPlugin;
	inputElement: TextComponent;
	modelSelect: DropdownComponent;

	constructor(app: App, plugin: PollinationsAIPlugin) {
		super(app);
		this.plugin = plugin;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();

		contentEl.createEl('h2', { text: this.plugin.t('quickQuestionTitle') });

		// Выбор модели
		const modelContainer = contentEl.createDiv();
		modelContainer.createEl('label', { text: this.plugin.t('model') + ':' });
		
		this.modelSelect = new DropdownComponent(modelContainer);
		
		// Filter models based on showFreeModelsOnly setting
		const modelsToShow = this.plugin.settings.showFreeModelsOnly 
			? this.plugin.models.filter(m => this.plugin.isModelFree(m.name))
			: this.plugin.models;
		
		// Group models by category
		const categories = new Map<string, AIModel[]>();
		modelsToShow.forEach(model => {
			const category = this.plugin.getCategoryForModel(model.name);
			if (!categories.has(category)) {
				categories.set(category, []);
			}
			const categoryModels = categories.get(category);
			if (categoryModels) {
				categoryModels.push(model);
			}
		});
		
		categories.forEach((models, category) => {
			models.forEach(model => {
			this.modelSelect.addOption(model.name, `[${category}] ${model.description}`);
		});
	});

		// Поле ввода
		const inputContainer = contentEl.createDiv();
		inputContainer.createEl('label', { text: this.plugin.t('yourQuestion') + ':' });
		this.inputElement = new TextComponent(inputContainer);
		this.inputElement.inputEl.placeholder = this.plugin.t('enterQuestion');
		this.inputElement.inputEl.addClass('input-full');
		this.inputElement.inputEl.addClass('input-tall');

		// Кнопки
		const buttonContainer = contentEl.createDiv();

		const askButton = new ButtonComponent(buttonContainer);
		askButton.setButtonText(this.plugin.t('ask'));
		askButton.setCta();
		askButton.onClick(() => this.askQuestion());

		const cancelButton = new ButtonComponent(buttonContainer);
		cancelButton.setButtonText(this.plugin.t('cancel'));
		cancelButton.onClick(() => this.close());
	}

	async askQuestion() {
		const question = this.inputElement.getValue().trim();
		if (!question) {
			new Notice(this.plugin.t('enterQuestionMsg'));
			return;
		}

		const selectedModel = this.modelSelect.getValue();
		
		try {
			const messages = [{ role: 'user', content: question }];
			const response = await this.plugin.communicateWithAI(selectedModel, messages);
			
			if (response.error) {
				new Notice(`${this.plugin.t('error')}: ${response.error}`);
				return;
			}

			if (response.choices && response.choices[0] && response.choices[0].message) {
				const answer = response.choices[0].message.content;
				
				// Создаем новую заметку с вопросом и ответом
				const conversation: ChatMessage[] = [
					{ role: 'user', content: question, timestamp: new Date() },
					{ role: 'assistant', content: answer, timestamp: new Date() }
				];
				
				await this.plugin.saveConversationToNote(conversation, 'Быстрый вопрос');
				new Notice(this.plugin.t('answerSaved'));
				this.close();
			} else {
				new Notice(this.plugin.t('unexpectedResponse'));
			}
		} catch (error) {
			new Notice(`${this.plugin.t('error')}: ${error}`);
		}
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

class ImageGenerationModal extends Modal {
	plugin: PollinationsAIPlugin;
	promptInput: TextComponent;
	modelSelect: DropdownComponent;
	widthInput: TextComponent;
	heightInput: TextComponent;

	constructor(app: App, plugin: PollinationsAIPlugin) {
		super(app);
		this.plugin = plugin;
	}

	updateModelList() {
		// Clear existing options
		this.modelSelect.selectEl.empty();
		
		// Get image generation models from loaded models
		const imageModels = this.plugin.models.filter(m => {
			const category = this.plugin.getCategoryForModel(m.name);
			return category === this.plugin.t('categoryImages');
		});
		
		// Add models to dropdown
		imageModels.forEach(model => {
		this.modelSelect.addOption(model.name, model.description);
	});
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();

		contentEl.createEl('h2', { text: this.plugin.t('imageGenerationTitle') });

		// Model selector
		const modelContainer = contentEl.createDiv();
		modelContainer.createEl('label', { text: this.plugin.t('model') + ':' });
		this.modelSelect = new DropdownComponent(modelContainer);
		this.updateModelList();
		this.modelSelect.setValue(this.plugin.findModel(this.plugin.settings.defaultImageModel)?.name || this.plugin.settings.defaultImageModel);

		// Prompt input
		const promptContainer = contentEl.createDiv();
		promptContainer.createEl('label', { text: this.plugin.t('prompt') + ':' });
		this.promptInput = new TextComponent(promptContainer);
		this.promptInput.inputEl.placeholder = this.plugin.t('enterPrompt');
		this.promptInput.inputEl.addClass('input-full');
		this.promptInput.inputEl.addClass('input-tall');

	// Size settings
	const sizeContainer = contentEl.createDiv();
	sizeContainer.createEl('label', { text: this.plugin.t('size') + ':' });
	
	const sizeInputContainer = sizeContainer.createDiv('size-input-container');

	this.widthInput = new TextComponent(sizeInputContainer);
	this.widthInput.setValue('1024');
	this.widthInput.inputEl.addClass('dimension-input');
	
	sizeInputContainer.createSpan({ text: '×' });
	
	this.heightInput = new TextComponent(sizeInputContainer);
		this.heightInput.setValue('1024');
		this.heightInput.inputEl.addClass('dimension-input');

		// Buttons
		const buttonContainer = contentEl.createDiv();

		const generateButton = new ButtonComponent(buttonContainer);
		generateButton.setButtonText(this.plugin.t('generate'));
		generateButton.setCta();
		generateButton.onClick(() => this.generateImage());

		const cancelButton = new ButtonComponent(buttonContainer);
		cancelButton.setButtonText(this.plugin.t('cancel'));
		cancelButton.onClick(() => this.close());
	}

	async generateImage() {
		const prompt = this.promptInput.getValue().trim();
		
		if (!prompt) {
			new Notice(this.plugin.t('enterPromptMsg'));
			return;
		}

		const model = this.modelSelect.getValue();
		const width = parseInt(this.widthInput.getValue()) || 1024;
		const height = parseInt(this.heightInput.getValue()) || 1024;

		const loadingNotice = new Notice(this.plugin.t('generating'), 0);

		try {
			const result = await this.plugin.generateImage(prompt, model, width, height);

			loadingNotice.hide();

			if (result.error) {
				new Notice(`${this.plugin.t('error')}: ${result.error}`);
				return;
			}

			if (result.imageData && result.filename) {
				const filePath = await this.plugin.saveImage(result.imageData, result.filename);
				
				if (filePath) {
					new Notice(`${this.plugin.t('imageSaved')}: ${filePath}`);
					
					// Insert image link into active note
					const activeFile = this.app.workspace.getActiveFile();
					if (activeFile) {
						const editor = this.app.workspace.activeEditor?.editor;
						if (editor) {
							editor.replaceSelection(`![[${filePath}]]\n`);
						}
					}
					
					this.close();
				} else {
					new Notice(this.plugin.t('imageError'));
				}
			}
		} catch (error) {
			loadingNotice.hide();
			new Notice(`${this.plugin.t('error')}: ${error}`);
		}
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

class VideoGenerationModal extends Modal {
	plugin: PollinationsAIPlugin;
	promptInput: TextComponent;
	modelSelect: DropdownComponent;
	durationInput: TextComponent;
	aspectRatioSelect: DropdownComponent;

	constructor(app: App, plugin: PollinationsAIPlugin) {
		super(app);
		this.plugin = plugin;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();

		contentEl.createEl('h2', { text: this.plugin.t('videoGenerationTitle') });

		// Video models
		const videoModels = [
			{ id: 'veo', name: 'Veo (4-8s, text-to-video)' },
			{ id: 'seedance', name: 'Seedance (2-10s, text/image-to-video)' },
			{ id: 'seedance-pro', name: 'Seedance pro' }
		];

		// Model selector
		const modelContainer = contentEl.createDiv();
		modelContainer.createEl('label', { text: this.plugin.t('model') + ':' });
		this.modelSelect = new DropdownComponent(modelContainer);
		videoModels.forEach(model => {
			this.modelSelect.addOption(model.id, model.name);
		});
		this.modelSelect.setValue(this.plugin.settings.defaultVideoModel);

		// Prompt input
		const promptContainer = contentEl.createDiv();
		promptContainer.createEl('label', { text: this.plugin.t('prompt') + ':' });
		this.promptInput = new TextComponent(promptContainer);
		this.promptInput.inputEl.placeholder = this.plugin.t('enterPrompt');
		this.promptInput.inputEl.addClass('input-full');
		this.promptInput.inputEl.addClass('input-tall');

	// Duration settings
	const durationContainer = contentEl.createDiv();
	durationContainer.createEl('label', { text: this.plugin.t('duration') + ':' });
	this.durationInput = new TextComponent(durationContainer);
	this.durationInput.setValue('4');
	this.durationInput.inputEl.addClass('duration-input');

	// Aspect ratio
	const aspectContainer = contentEl.createDiv();
	aspectContainer.createEl('label', { text: this.plugin.t('aspectRatio') + ':' });
	this.aspectRatioSelect = new DropdownComponent(aspectContainer);
	this.aspectRatioSelect.addOption('16:9', '16:9 (landscape)');
	this.aspectRatioSelect.addOption('9:16', '9:16 (portrait)');
	this.aspectRatioSelect.setValue('16:9');

	// Buttons
	const buttonContainer = contentEl.createDiv();

	const generateButton = new ButtonComponent(buttonContainer);
	generateButton.setButtonText(this.plugin.t('generate'));
	generateButton.setCta();
	generateButton.onClick(() => this.generateVideo());

	const cancelButton = new ButtonComponent(buttonContainer);
	cancelButton.setButtonText(this.plugin.t('cancel'));
	cancelButton.onClick(() => this.close());
}

	async generateVideo() {
		const prompt = this.promptInput.getValue().trim();
		
		if (!prompt) {
			new Notice(this.plugin.t('enterPromptMsg'));
			return;
		}

		const model = this.modelSelect.getValue();
		const duration = parseInt(this.durationInput.getValue()) || 4;
		const aspectRatio = this.aspectRatioSelect.getValue();

		const loadingNotice = new Notice(this.plugin.t('generatingVideo'), 0);

		try {
			const result = await this.plugin.generateVideo(prompt, model, duration, aspectRatio);

			loadingNotice.hide();

			if (result.error) {
				new Notice(`${this.plugin.t('error')}: ${result.error}`);
				return;
			}

			if (result.videoData && result.filename) {
				const filePath = await this.plugin.saveVideo(result.videoData, result.filename);
				
				if (filePath) {
					new Notice(`${this.plugin.t('videoSaved')}: ${filePath}`);
					
					// Insert video link into active note
					const activeFile = this.app.workspace.getActiveFile();
					if (activeFile) {
						const editor = this.app.workspace.activeEditor?.editor;
						if (editor) {
							editor.replaceSelection(`![[${filePath}]]\n`);
						}
					}
					
					this.close();
				} else {
					new Notice(this.plugin.t('videoError'));
				}
			}
		} catch (error) {
			loadingNotice.hide();
			new Notice(`${this.plugin.t('error')}: ${error}`);
		}
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

class AudioGenerationModal extends Modal {
	plugin: PollinationsAIPlugin;
	textInput: TextComponent;
	voiceSelect: DropdownComponent;

	constructor(app: App, plugin: PollinationsAIPlugin) {
		super(app);
		this.plugin = plugin;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();

		contentEl.createEl('h2', { text: this.plugin.t('audioGenerationTitle') });

		// Text input
		const textContainer = contentEl.createDiv();
		textContainer.createEl('label', { text: this.plugin.t('prompt') + ':' });
		this.textInput = new TextComponent(textContainer);
		this.textInput.inputEl.placeholder = this.plugin.t('enterPrompt');
		this.textInput.inputEl.addClass('input-full');
		this.textInput.inputEl.addClass('input-tall');

		// Voice selector
		const voiceContainer = contentEl.createDiv();
		voiceContainer.createEl('label', { text: this.plugin.t('voice') + ':' });
		this.voiceSelect = new DropdownComponent(voiceContainer);
		const voices = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];
		voices.forEach(voice => {
			this.voiceSelect.addOption(voice, voice.charAt(0).toUpperCase() + voice.slice(1));
		});
		this.voiceSelect.setValue('alloy');

		// Buttons
		const buttonContainer = contentEl.createDiv();

		const generateButton = new ButtonComponent(buttonContainer);
		generateButton.setButtonText(this.plugin.t('generate'));
		generateButton.setCta();
		generateButton.onClick(() => this.generateAudio());

		const cancelButton = new ButtonComponent(buttonContainer);
		cancelButton.setButtonText(this.plugin.t('cancel'));
		cancelButton.onClick(() => this.close());
	}

	async generateAudio() {
		const text = this.textInput.getValue().trim();
		
		if (!text) {
			new Notice(this.plugin.t('enterPromptMsg'));
			return;
		}

		const voice = this.voiceSelect.getValue();

		const loadingNotice = new Notice(this.plugin.t('generatingAudio'), 0);

		try {
			const result = await this.plugin.generateAudio(text, voice);

			loadingNotice.hide();

			if (result.error) {
				new Notice(`${this.plugin.t('error')}: ${result.error}`);
				return;
			}

			if (result.audioData && result.filename) {
				const filePath = await this.plugin.saveAudio(result.audioData, result.filename);
				
				if (filePath) {
					new Notice(`${this.plugin.t('audioSaved')}: ${filePath}`);
					
					// Insert audio link into active note
					const activeFile = this.app.workspace.getActiveFile();
					if (activeFile) {
						const editor = this.app.workspace.activeEditor?.editor;
						if (editor) {
							editor.replaceSelection(`![[${filePath}]]\n`);
						}
					}
					
					this.close();
				} else {
					new Notice(this.plugin.t('audioError'));
				}
			}
		} catch (error) {
			loadingNotice.hide();
			new Notice(`${this.plugin.t('error')}: ${error}`);
		}
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

class PollinationsAISettingTab extends PluginSettingTab {
	plugin: PollinationsAIPlugin;

	constructor(app: App, plugin: PollinationsAIPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl)
			.setName(this.plugin.t('settingsTitle'))
			.setHeading();

		new Setting(containerEl)
			.setName(this.plugin.t('language'))
			.setDesc(this.plugin.t('languageDesc'))
			.addDropdown(dropdown => {
				dropdown.addOption('en', 'English');
				dropdown.addOption('ru', 'Русский');
				dropdown.setValue(this.plugin.settings.language);
				dropdown.onChange(async (value: 'en' | 'ru') => {
					this.plugin.settings.language = value;
					await this.plugin.saveSettings();
					this.display(); // Refresh to show new language
				});
			});

		new Setting(containerEl)
			.setName(this.plugin.t('showFreeModelsOnly'))
			.setDesc(this.plugin.t('showFreeModelsOnlyDesc'))
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.showFreeModelsOnly)
				.onChange(async (value) => {
					this.plugin.settings.showFreeModelsOnly = value;
					await this.plugin.saveSettings();
					this.display(); // Refresh to update model dropdowns
				}));

		new Setting(containerEl)
			.setName(this.plugin.t('defaultModel'))
			.setDesc(this.plugin.t('defaultModelDesc'))
			.addDropdown(dropdown => {
				// Filter models based on showFreeModelsOnly setting
				const modelsToShow = this.plugin.settings.showFreeModelsOnly 
					? this.plugin.models.filter(m => this.plugin.isModelFree(m.name))
					: this.plugin.models;
				
				// Group models by category
				const categories = new Map<string, AIModel[]>();
				modelsToShow.forEach(model => {
					const category = this.plugin.getCategoryForModel(model.name);
					if (!categories.has(category)) {
						categories.set(category, []);
					}
					const categoryModels = categories.get(category);
					if (categoryModels) {
						categoryModels.push(model);
					}
				});
				
				categories.forEach((models, category) => {
					models.forEach(model => {
					dropdown.addOption(model.name, `[${category}] ${model.description}`);
				});
			});
			
			dropdown.setValue(this.plugin.settings.defaultModel);
			dropdown.onChange(async (value) => {
					await this.plugin.saveSettings();
				});
			});

		new Setting(containerEl)
			.setName(this.plugin.t('saveChatsToNotes'))
			.setDesc(this.plugin.t('saveChatsDesc'))
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.saveToNotes)
				.onChange(async (value) => {
					this.plugin.settings.saveToNotes = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName(this.plugin.t('notesFolder'))
			.setDesc(this.plugin.t('notesFolderDesc'))
			.addText(text => text
				.setPlaceholder('AI chats')
				.setValue(this.plugin.settings.notesFolder)
				.onChange(async (value) => {
					this.plugin.settings.notesFolder = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName(this.plugin.t('apiToken'))
			.setDesc(this.plugin.t('apiTokenDesc'))
			.addText(text => text
				.setPlaceholder(this.plugin.t('enterToken'))
				.setValue(this.plugin.settings.apiToken)
				.onChange(async (value) => {
					this.plugin.settings.apiToken = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName(this.plugin.t('imagesFolder'))
			.setDesc(this.plugin.t('imagesFolderDesc'))
			.addText(text => text
				.setPlaceholder('AI images')
				.setValue(this.plugin.settings.imagesFolder)
				.onChange(async (value) => {
					this.plugin.settings.imagesFolder = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName(this.plugin.t('defaultImageModel'))
			.setDesc(this.plugin.t('defaultImageModelDesc'))
			.addDropdown(dropdown => {
				dropdown.addOption('zimage', this.plugin.t('imageModelZimage'));
				dropdown.addOption('flux', this.plugin.t('imageModelFlux'));
				dropdown.addOption('turbo', this.plugin.t('imageModelTurbo'));
				dropdown.addOption('gptimage', this.plugin.t('imageModelGPT'));
				dropdown.addOption('kontext', this.plugin.t('imageModelKontext'));
				dropdown.addOption('seedream', this.plugin.t('imageModelSeeDream'));
				dropdown.addOption('nanobanana', this.plugin.t('imageModelNanobanana'));
				dropdown.setValue(this.plugin.settings.defaultImageModel);
				dropdown.onChange(async (value) => {
					this.plugin.settings.defaultImageModel = value;
					await this.plugin.saveSettings();
				});
			});

		new Setting(containerEl)
			.setName(this.plugin.t('videosFolder'))
			.setDesc(this.plugin.t('videosFolderDesc'))
			.addText(text => text
				.setPlaceholder('AI videos')
				.setValue(this.plugin.settings.videosFolder)
				.onChange(async (value) => {
					this.plugin.settings.videosFolder = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName(this.plugin.t('defaultVideoModel'))
			.setDesc(this.plugin.t('defaultVideoModelDesc'))
			.addDropdown(dropdown => {
				dropdown.addOption('veo', 'Veo');
				dropdown.addOption('seedance', 'Seedance');
				dropdown.addOption('seedance-pro', 'Seedance pro');
				dropdown.setValue(this.plugin.settings.defaultVideoModel);
				dropdown.onChange(async (value) => {
					this.plugin.settings.defaultVideoModel = value;
					await this.plugin.saveSettings();
				});
			});

		new Setting(containerEl)
			.setName(this.plugin.t('audioFolder'))
			.setDesc(this.plugin.t('audioFolderDesc'))
			.addText(text => text
				.setPlaceholder('AI audio')
				.setValue(this.plugin.settings.audioFolder)
				.onChange(async (value) => {
					this.plugin.settings.audioFolder = value;
					await this.plugin.saveSettings();
				}));
	}
}
