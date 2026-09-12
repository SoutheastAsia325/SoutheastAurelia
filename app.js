// SoutheastAurelia - Main Application
class SoutheastAurelia {
  constructor() {
    this.agents = [
      { id: 'assistant', name: '代码助手', icon: '💻', desc: '编写、调试和优化代码', prompt: '你是一个专业的编程助手，擅长编写、调试和优化各种编程语言的代码。请详细解释你的思路，并提供清晰的代码示例。' },
      { id: 'writer', name: '写作助手', icon: '✍️', desc: '撰写文章、邮件和文案', prompt: '你是一个专业的写作助手，擅长撰写各种文体，包括文章、邮件、报告、创意写作等。请根据需求提供高质量的内容。' },
      { id: 'translator', name: '翻译助手', icon: '🌐', desc: '多语言翻译与本地化', prompt: '你是一个专业的翻译助手，精通多种语言，能够提供准确、自然的翻译。请根据上下文选择合适的表达方式。' },
      { id: 'summarizer', name: '总结归纳', icon: '📋', desc: '提取要点，生成摘要', prompt: '你是一个擅长总结归纳的助手。请仔细阅读内容，提取关键信息，生成简洁明了的摘要，突出核心要点。' },
      { id: 'analyst', name: '数据分析', icon: '📊', desc: '分析数据，洞察趋势', prompt: '你是一个数据分析专家，能够帮助理解数据趋势、模式和洞察。请提供清晰的数据分析和建议。' },
      { id: 'creative', name: '创意顾问', icon: '🎨', desc: '激发灵感，头脑风暴', prompt: '你是一个创意顾问，擅长头脑风暴和创新思维。请提供新颖的想法和解决方案，帮助用户突破思维定式。' },
      { id: 'researcher', name: '研究助手', icon: '🔍', desc: '调研分析，信息整合', prompt: '你是一个研究助手，擅长收集、整理和分析信息。请提供全面、准确的研究结果和相关见解。' },
    ];
    this.currentAgent = this.agents[0];
    this.messageHistory = [];
    this.isThinking = false;
    this.config = this.loadConfig();
    this.init();
  }
  init() { this.cacheElements(); this.bindEvents(); this.renderAgents(); this.checkConfig(); }
  cacheElements() {
    this.menuBtn = document.getElementById('menuBtn');
    this.drawer = document.getElementById('drawer');
    this.drawerOverlay = document.getElementById('drawerOverlay');
    this.drawerClose = document.getElementById('drawerClose');
    this.agentList = document.getElementById('agentList');
    this.newChatBtn = document.getElementById('newChatBtn');
    this.configBtn = document.getElementById('configBtn');
    this.aboutBtn = document.getElementById('aboutBtn');
    this.welcomeScreen = document.getElementById('welcomeScreen');
    this.chatContainer = document.getElementById('chatContainer');
    this.messagesEl = document.getElementById('messages');
    this.messageInput = document.getElementById('messageInput');
    this.sendBtn = document.getElementById('sendBtn');
    this.thinkingIndicator = document.getElementById('thinkingIndicator');
    this.chatName = document.getElementById('chatName');
    this.chatStatus = document.getElementById('chatStatus');
    this.configModal = document.getElementById('configModal');
    this.apiBaseUrl = document.getElementById('apiBaseUrl');
    this.apiKey = document.getElementById('apiKey');
    this.modelName = document.getElementById('modelName');
    this.configModalClose = document.getElementById('configModalClose');
    this.configCancel = document.getElementById('configCancel');
    this.configSave = document.getElementById('configSave');
    this.modeToggle = document.getElementById('modeToggle');
  }
  bindEvents() {
    this.menuBtn.addEventListener('click', () => this.openDrawer());
    this.drawerClose.addEventListener('click', () => this.closeDrawer());
    this.drawerOverlay.addEventListener('click', () => this.closeDrawer());
    document.querySelectorAll('.action-chip').forEach(chip => {
      chip.addEventListener('click', (e) => {
        const agent = this.agents.find(a => a.id === e.currentTarget.dataset.agent);
        if (agent) { this.selectAgent(agent); this.startChat(agent.prompt); }
      });
    });
    this.messageInput.addEventListener('input', () => this.autoResize());
    this.messageInput.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this.sendMessage(); } });
    this.sendBtn.addEventListener('click', () => this.sendMessage());
    this.newChatBtn.addEventListener('click', () => this.newChat());
    this.configBtn.addEventListener('click', () => this.openConfig());
    this.aboutBtn.addEventListener('click', () => this.showAbout());
    this.configModalClose.addEventListener('click', () => this.closeConfig());
    this.configCancel.addEventListener('click', () => this.closeConfig());
    this.configSave.addEventListener('click', () => this.saveConfig());
    this.configModal.addEventListener('click', (e) => { if (e.target === this.configModal) this.closeConfig(); });
    this.modeToggle.addEventListener('click', (e) => { if (e.target.classList.contains('mode-item')) this.setMode(e.target.dataset.mode); });
  }
  loadConfig() { try { const s = localStorage.getItem('southeast_aurelia_config'); return s ? JSON.parse(s) : { baseUrl: 'https://api.openai.com/v1', apiKey: '', model: 'gpt-4o' }; } catch { return { baseUrl: 'https://api.openai.com/v1', apiKey: '', model: 'gpt-4o' }; } }
  saveConfigToStorage() { localStorage.setItem('southeast_aurelia_config', JSON.stringify(this.config)); }
  checkConfig() { if (!this.config.apiKey) setTimeout(() => this.openConfig(), 500); }
  renderAgents() {
    this.agentList.innerHTML = this.agents.map(a => '<button class="agent-item ' + (a.id === this.currentAgent.id ? 'active' : '') + '" data-agent="' + a.id + '"><div class="agent-icon">' + a.icon + '</div><div class="agent-info"><div class="agent-name">' + a.name + '</div><div class="agent-desc">' + a.desc + '</div></div></button>').join('');
    this.agentList.querySelectorAll('.agent-item').forEach(item => { item.addEventListener('click', () => { const a = this.agents.find(x => x.id === item.dataset.agent); if (a) { this.selectAgent(a); this.closeDrawer(); } }); });
  }
  selectAgent(a) { this.currentAgent = a; this.renderAgents(); this.chatName.textContent = a.name; }
  startChat(p) { this.welcomeScreen.style.display = 'none'; this.chatContainer.style.display = 'flex'; this.messagesEl.innerHTML = ''; this.messageHistory = []; this.addMessage('ai', '你好！我是' + this.currentAgent.name + '，' + this.currentAgent.desc + '。有什么可以帮助你的？'); }
  newChat() { this.messageHistory = []; this.messagesEl.innerHTML = ''; this.closeDrawer(); this.welcomeScreen.style.display = 'flex'; this.chatContainer.style.display = 'none'; }
  async sendMessage() { const t = this.messageInput.value.trim(); if (!t || this.isThinking) return; this.addMessage('user', t); this.messageInput.value = ''; this.autoResize(); await this.getAIResponse(t); }
  async getAIResponse(msg) { this.isThinking = true; this.showThinking(true); this.sendBtn.disabled = true; try { const r = await this.callAPI(msg); this.showThinking(false); this.addMessage('ai', r || '抱歉，我没有收到有效的回复。请检查 API 配置或稍后重试。'); } catch (e) { this.showThinking(false); console.error('API Error:', e); this.addMessage('ai', '出错了：' + (e.message || '未知错误') + '。请检查网络连接或 API 配置。'); } finally { this.isThinking = false; this.sendBtn.disabled = false; } }
  async callAPI(msg) { const { baseUrl, apiKey, model } = this.config; if (!apiKey) throw new Error('请先配置 API Key'); const messages = [{ role: 'system', content: this.currentAgent.prompt }, ...this.messageHistory.slice(-10).map(m => ({ role: m.type === 'user' ? 'user' : 'assistant', content: m.content })), { role: 'user', content: msg }]; const response = await fetch(baseUrl + '/chat/completions', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + apiKey }, body: JSON.stringify({ model, messages, stream: false, max_tokens: 2000 }) }); if (!response.ok) { const error = await response.json().catch(() => ({})); throw new Error(error.error?.message || 'API 请求失败 (' + response.status + ')'); } const data = await response.json(); return data.choices?.[0]?.message?.content; }
  addMessage(type, content) {
    const el = document.createElement('div');
    el.className = 'message ' + type;
    const avatar = type === 'ai' ? '<span class="message-avatar">✦</span>' : '<span class="message-avatar">👤</span>';
    let rendered = content.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/`([^`]+)`/g,'<code>$1</code>')
      .replace(/\*\*([^\*]+)\*\*/g,'<strong>$1</strong>')
      .replace(/\n/g,'<br>');
    el.innerHTML = avatar + '<div class="message-content">' + rendered + '</div>';
    this.messagesEl.appendChild(el);
    this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
    this.messageHistory.push({ type, content });
  }
  showThinking(show) { this.thinkingIndicator.style.display = show ? 'flex' : 'none'; if (show) { this.messagesEl.appendChild(this.thinkingIndicator); this.thinkingIndicator.scrollIntoView({ behavior: 'smooth' }); } }
  openDrawer() { this.drawer.classList.add('active'); this.drawerOverlay.classList.add('active'); }
  closeDrawer() { this.drawer.classList.remove('active'); this.drawerOverlay.classList.remove('active'); }
  openConfig() { this.apiBaseUrl.value = this.config.baseUrl; this.apiKey.value = this.config.apiKey; this.modelName.value = this.config.model; this.configModal.style.display = 'flex'; }
  closeConfig() { this.configModal.style.display = 'none'; }
  saveConfig() { this.config.baseUrl = this.apiBaseUrl.value.trim() || 'https://api.openai.com/v1'; this.config.apiKey = this.apiKey.value.trim(); this.config.model = this.modelName.value.trim() || 'gpt-4o'; this.saveConfigToStorage(); this.closeConfig(); }
  showAbout() { alert('SoutheastAurelia\n版本: 1.0.0\n\n由 CalistaAI 开发并提供相关支持'); this.closeDrawer(); }
  setMode(mode) { document.querySelectorAll('.mode-item').forEach(item => { item.classList.toggle('active', item.dataset.mode === mode); }); }
  autoResize() { this.messageInput.style.height = 'auto'; this.messageInput.style.height = Math.min(this.messageInput.scrollHeight, 120) + 'px'; }
}
document.addEventListener('DOMContentLoaded', () => { window.app = new SoutheastAurelia(); });
