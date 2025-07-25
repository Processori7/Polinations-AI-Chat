import { App, Plugin, PluginSettingTab, Setting, TFile, Notice, Modal, TextComponent, ButtonComponent, DropdownComponent, MarkdownView } from 'obsidian';

interface PollinationsAISettings {
	defaultModel: string;
	saveToNotes: boolean;
	notesFolder: string;
	apiToken: string;
}

const DEFAULT_SETTINGS: PollinationsAISettings = {
	defaultModel: 'openai',
	saveToNotes: true,
	notesFolder: 'Чаты с ИИ',
	apiToken: ''
}

interface AIModel {
	name: string;
	description: string;
	input_modalities: string[];
}

interface ChatMessage {
	role: 'user' | 'assistant';
	content: string;
	timestamp: Date;
}

export default class PollinationsAIPlugin extends Plugin {
	settings: PollinationsAISettings;
	models: AIModel[] = [];
	currentModel: string;

	async onload() {
		await this.loadSettings();
		this.currentModel = this.settings.defaultModel;

		// Загружаем доступные модели
		await this.loadModels();

		// Добавляем команду для открытия чата
		this.addCommand({
			id: 'open-ai-chat',
			name: 'Открыть ИИ чат',
			callback: () => {
				new AIchatModal(this.app, this).open();
			}
		});

		// Добавляем команду для быстрого вопроса
		this.addCommand({
			id: 'quick-ai-question',
			name: 'Быстрый вопрос ИИ',
			callback: () => {
				new QuickQuestionModal(this.app, this).open();
			}
		});

		// Добавляем настройки
		this.addSettingTab(new PollinationsAISettingTab(this.app, this));

		// Добавляем иконку в левую панель
		this.addRibbonIcon('message-circle', 'ИИ Чат', (evt: MouseEvent) => {
			new AIchatModal(this.app, this).open();
		});
	}

	async loadModels() {
		try {
			const response = await fetch('https://text.pollinations.ai/models');
			if (response.ok) {
				const models = await response.json();
				this.models = models.map((model: any) => {
					let input_modalities = model.input_modalities || [];
					
					// Если API не возвращает модальности, определяем их вручную
					if (!input_modalities.length) {
						if (model.name.toLowerCase().includes('openai')) {
							input_modalities = ['text', 'image'];
						} else if (model.name.toLowerCase().includes('audio')) {
							input_modalities = ['text', 'audio'];
						} else {
							input_modalities = ['text'];
						}
					}

					return {
						name: model.name,
						description: model.description || 'Без описания',
						input_modalities
					};
				});
			} else {
				// Используем модель по умолчанию если не удалось загрузить список
				this.models = [{
					name: 'openai',
					description: 'OpenAI GPT-4o Mini',
					input_modalities: ['text']
				}];
			}
		} catch (error) {
			console.error('Ошибка загрузки моделей:', error);
			this.models = [{
				name: 'openai',
				description: 'OpenAI GPT-4o Mini',
				input_modalities: ['text']
			}];
		}
	}

	async communicateWithAI(modelName: string, messages: { role: string; content: string }[]): Promise<any> {
		try {
			// Извлекаем последнее сообщение пользователя для простого API
			const lastUserMessage = messages.filter(msg => msg.role === 'user').pop();
			if (!lastUserMessage) {
				return { error: 'Нет сообщения пользователя' };
			}

			// Кодируем промпт для URL
			const encodedPrompt = `'${lastUserMessage.content}'`;

			// Строим URL с параметрами
			const url = new URL(`https://text.pollinations.ai/${encodedPrompt}`);
			url.searchParams.set('model', modelName);
			url.searchParams.set('private', 'true');

			// Логируем для отладки
			console.log('Pollinations API запрос:', {
				url: url.toString(),
				model: modelName,
				prompt: lastUserMessage.content
			});

			const response = await fetch(url.toString(), {
				method: 'GET'
			});

			if (response.ok) {
				const text = await response.text();
				// Возвращаем в формате, совместимом с OpenAI API
				return {
					choices: [{
						message: {
							content: text
						}
					}]
				};
			} else {
				return { error: `HTTP ${response.status}: ${response.statusText}` };
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
			new Notice(`Чат сохранен в: ${filePath}`);
		} catch (error) {
			new Notice(`Ошибка сохранения: ${error}`);
		}
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class AIchatModal extends Modal {
	plugin: PollinationsAIPlugin;
	conversation: ChatMessage[] = [];
	chatContainer: HTMLElement;
	inputElement: TextComponent;
	modelSelect: DropdownComponent;

	constructor(app: App, plugin: PollinationsAIPlugin) {
		super(app);
		this.plugin = plugin;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();

		contentEl.createEl('h2', { text: 'ИИ Чат' });

		// Выбор модели
		const modelContainer = contentEl.createDiv('model-selector');
		modelContainer.createEl('label', { text: 'Модель: ' });
		
		this.modelSelect = new DropdownComponent(modelContainer);
		this.plugin.models.forEach(model => {
			this.modelSelect.addOption(model.name, `${model.name} - ${model.description}`);
		});
		this.modelSelect.setValue(this.plugin.currentModel);
		this.modelSelect.onChange((value) => {
			this.plugin.currentModel = value;
		});

		// Контейнер для чата
		this.chatContainer = contentEl.createDiv('chat-container');
		this.chatContainer.style.height = '400px';
		this.chatContainer.style.overflowY = 'auto';
		this.chatContainer.style.border = '1px solid var(--background-modifier-border)';
		this.chatContainer.style.padding = '10px';
		this.chatContainer.style.marginBottom = '10px';

		// Поле ввода
		const inputContainer = contentEl.createDiv('input-container');
		this.inputElement = new TextComponent(inputContainer);
		this.inputElement.inputEl.placeholder = 'Введите ваш вопрос...';
		this.inputElement.inputEl.style.width = '70%';
		this.inputElement.inputEl.addEventListener('keypress', (e) => {
			if (e.key === 'Enter' && !e.shiftKey) {
				e.preventDefault();
				this.sendMessage();
			}
		});

		// Кнопка отправки
		const sendButton = new ButtonComponent(inputContainer);
		sendButton.setButtonText('Отправить');
		sendButton.onClick(() => this.sendMessage());

		// Кнопки управления
		const buttonContainer = contentEl.createDiv('button-container');
		buttonContainer.style.marginTop = '10px';

		const saveButton = new ButtonComponent(buttonContainer);
		saveButton.setButtonText('Сохранить чат');
		saveButton.onClick(() => this.saveChat());

		const clearButton = new ButtonComponent(buttonContainer);
		clearButton.setButtonText('Очистить');
		clearButton.onClick(() => this.clearChat());
	}

	async sendMessage() {
		const message = this.inputElement.getValue().trim();
		if (!message) return;

		// Добавляем сообщение пользователя
		this.addMessage('user', message);
		this.inputElement.setValue('');

		// Показываем индикатор загрузки
		const loadingEl = this.chatContainer.createDiv('loading-message');
		loadingEl.textContent = '🤖 Думаю...';

		try {
			const messages = this.conversation.map(msg => ({
				role: msg.role,
				content: msg.content
			}));

			const response = await this.plugin.communicateWithAI(this.plugin.currentModel, messages);
			
			// Удаляем индикатор загрузки
			loadingEl.remove();

			if (response.error) {
				this.addMessage('assistant', `Ошибка: ${response.error}`);
			} else if (response.choices && response.choices[0] && response.choices[0].message) {
				this.addMessage('assistant', response.choices[0].message.content);
			} else {
				this.addMessage('assistant', 'Получен неожиданный ответ от API');
			}
		} catch (error) {
			loadingEl.remove();
			this.addMessage('assistant', `Ошибка: ${error}`);
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
		const roleText = role === 'user' ? 'Вы' : 'ИИ';
		
		messageEl.innerHTML = `
			<div class="message-header">
				<strong>${roleIcon} ${roleText}</strong>
				<small>${message.timestamp.toLocaleTimeString('ru-RU')}</small>
			</div>
			<div class="message-content">${content}</div>
		`;

		this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
	}

	async saveChat() {
		if (this.conversation.length === 0) {
			new Notice('Нет сообщений для сохранения');
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

		contentEl.createEl('h2', { text: 'Быстрый вопрос ИИ' });

		// Выбор модели
		const modelContainer = contentEl.createDiv();
		modelContainer.createEl('label', { text: 'Модель: ' });
		
		this.modelSelect = new DropdownComponent(modelContainer);
		this.plugin.models.forEach(model => {
			this.modelSelect.addOption(model.name, `${model.name} - ${model.description}`);
		});
		this.modelSelect.setValue(this.plugin.currentModel);

		// Поле ввода
		const inputContainer = contentEl.createDiv();
		inputContainer.createEl('label', { text: 'Ваш вопрос:' });
		this.inputElement = new TextComponent(inputContainer);
		this.inputElement.inputEl.placeholder = 'Введите ваш вопрос...';
		this.inputElement.inputEl.style.width = '100%';
		this.inputElement.inputEl.style.height = '100px';

		// Кнопки
		const buttonContainer = contentEl.createDiv();
		buttonContainer.style.marginTop = '10px';

		const askButton = new ButtonComponent(buttonContainer);
		askButton.setButtonText('Спросить');
		askButton.setCta();
		askButton.onClick(() => this.askQuestion());

		const cancelButton = new ButtonComponent(buttonContainer);
		cancelButton.setButtonText('Отмена');
		cancelButton.onClick(() => this.close());
	}

	async askQuestion() {
		const question = this.inputElement.getValue().trim();
		if (!question) {
			new Notice('Введите вопрос');
			return;
		}

		const selectedModel = this.modelSelect.getValue();
		
		try {
			const messages = [{ role: 'user', content: question }];
			const response = await this.plugin.communicateWithAI(selectedModel, messages);
			
			if (response.error) {
				new Notice(`Ошибка: ${response.error}`);
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
				new Notice('Ответ сохранен в заметку');
				this.close();
			} else {
				new Notice('Получен неожиданный ответ от API');
			}
		} catch (error) {
			new Notice(`Ошибка: ${error}`);
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

		containerEl.createEl('h2', { text: 'Настройки Pollinations AI' });

		new Setting(containerEl)
			.setName('Модель по умолчанию')
			.setDesc('Выберите модель ИИ по умолчанию')
			.addDropdown(dropdown => {
				this.plugin.models.forEach(model => {
					dropdown.addOption(model.name, `${model.name} - ${model.description}`);
				});
				dropdown.setValue(this.plugin.settings.defaultModel);
				dropdown.onChange(async (value) => {
					this.plugin.settings.defaultModel = value;
					this.plugin.currentModel = value;
					await this.plugin.saveSettings();
				});
			});

		new Setting(containerEl)
			.setName('Сохранять чаты в заметки')
			.setDesc('Автоматически сохранять разговоры с ИИ в заметки')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.saveToNotes)
				.onChange(async (value) => {
					this.plugin.settings.saveToNotes = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Папка для заметок')
			.setDesc('Папка, куда будут сохраняться чаты с ИИ')
			.addText(text => text
				.setPlaceholder('AI Чаты')
				.setValue(this.plugin.settings.notesFolder)
				.onChange(async (value) => {
					this.plugin.settings.notesFolder = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('API токен')
			.setDesc('Токен для доступа к API (если требуется)')
			.addText(text => text
				.setPlaceholder('Введите токен...')
				.setValue(this.plugin.settings.apiToken)
				.onChange(async (value) => {
					this.plugin.settings.apiToken = value;
					await this.plugin.saveSettings();
				}));
	}
}
