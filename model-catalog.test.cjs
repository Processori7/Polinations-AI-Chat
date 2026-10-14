const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const bundle = fs.readFileSync(require('node:path').join(__dirname, 'main.js'), 'utf8');
const catalog = [
  { name: 'openai/gpt-image-1', aliases: ['gptimage'], input_modalities: ['text', 'image'], output_modalities: ['image'] },
  { name: 'tongyi-mai/z-image-turbo', aliases: ['zimage'], input_modalities: ['text'], output_modalities: ['image'] },
  { name: 'google/gemini-image', aliases: ['nanobanana'], input_modalities: ['text', 'image'], output_modalities: ['image'] },
  { name: 'google/veo-3', aliases: ['veo'], input_modalities: ['text'], output_modalities: ['video'] },
];

async function loadPlugin(images = catalog) {
  const calls = [];
  const obsidian = {
    Plugin: class {}, PluginSettingTab: class {}, Modal: class {},
    requestUrl: async request => {
      calls.push(request);
      if (request.url.endsWith('/text/models')) return { status: 200, json: [] };
      if (request.url.endsWith('/image/models')) return { status: 200, json: images };
      return { status: 200, arrayBuffer: new ArrayBuffer(1) };
    },
  };
  const context = vm.createContext({
    module: { exports: {} },
    require: name => { assert.equal(name, 'obsidian'); return obsidian; },
    console: { debug() {}, warn() {} }, URL,
  });
  vm.runInContext(bundle, context);
  const plugin = new context.module.exports.default();
  plugin.settings = { language: 'en', apiToken: 'test-only-placeholder' };
  await plugin.loadModels();
  return { plugin, calls, context };
}

test('canonical media models retain their generation categories', async () => {
  const { plugin } = await loadPlugin();
  for (const model of catalog.slice(0, 3)) assert.equal(plugin.getCategoryForModel(model.name), 'Images', model.name);
  assert.equal(plugin.getCategoryForModel(catalog[3].name), 'Video');
  assert.equal(plugin.getCategoryForModel('gptimage'), 'Images');
});

test('image picker includes renamed image models, not video models', async () => {
  const { plugin, context } = await loadPlugin();
  const ModalClass = vm.runInContext('ImageGenerationModal', context);
  const modal = new ModalClass({}, plugin);
  const options = [];
  modal.modelSelect = { selectEl: { empty() {} }, addOption: name => options.push(name) };
  modal.updateModelList();
  assert.deepEqual(options, catalog.slice(0, 3).map(model => model.name));
});

test('reference images are forwarded for a saved alias without rewriting the request model', async () => {
  const { plugin, calls } = await loadPlugin();
  await plugin.generateImage('test', 'gptimage', 1024, 1024, 'https://example.com/reference.png');
  const request = new URL(calls[calls.length - 1].url);
  assert.equal(request.searchParams.get('model'), 'gptimage');
  assert.equal(request.searchParams.get('image'), 'https://example.com/reference.png');
});

test('chat dispatches a canonical image model to image generation, not chat completions', async () => {
  const { plugin, context } = await loadPlugin();
  const ChatClass = vm.runInContext('AIchatModal', context);
  const chat = new ChatClass({}, plugin);
  plugin.currentModel = 'openai/gpt-image-1';
  let route;
  plugin.generateImage = async () => { route = 'image'; return { error: 'test response' }; };
  plugin.communicateWithAI = async () => { route = 'text'; return { error: 'test response' }; };
  chat.inputElement = { getValue: () => 'draw a tree', setValue() {} };
  chat.addMessage = () => {};
  chat.chatContainer = { createDiv: () => ({ remove() {} }) };
  await chat.sendMessage();
  assert.equal(route, 'image');
});

test('existing free-only filter can still recognize its aliases', async () => {
  const { plugin } = await loadPlugin();
  assert.equal(plugin.isModelFree('openai/gpt-image-1'), true);
  assert.equal(plugin.isModelFree('google/veo-3'), false);
});

test('old catalogs and fallback name classification remain supported', async () => {
  const { plugin } = await loadPlugin([{ name: 'gptimage', input_modalities: ['image'] }]);
  assert.equal(plugin.getCategoryForModel('gptimage'), 'Images');
  assert.equal(plugin.modelSupportsImageInput('gptimage'), true);
  assert.equal(plugin.modelSupportsImageInput('unknown'), false);
});
