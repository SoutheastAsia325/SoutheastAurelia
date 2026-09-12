/* SoutheastAurelia - AI 聊天应用 */
class SoutheastAurelia {
  constructor() {
    this.agents = {
      assistant: { id: 'assistant', name: '代码助手', desc: '编程问题与代码分析', icon: '💻', prompt: '你是一个专业的编程助手，擅长解答编程问题和提供代码建议。' },
      writer: { id: 'writer', name: '写作助手', desc: '文章撰写与润色', icon: '✍️', prompt: '你是一个专业的写作助手，擅长文章撰写与润色。' },
      translator: { id: 'translator', name: '翻译', desc: '多语言翻译', icon: '🌐', prompt: '你是一个专业的翻译助手，擅长多语言翻译。' },
      summarizer: { id: 'summarizer', name: '总结归纳', desc: '长文本摘要提炼', icon: '📋', prompt: '你是一个总结归纳助手，擅长从长文本中提取关键信息。' },
      analyst: { id: 'analyst', name: '数据分析', desc: '数据解读与洞察', icon: '📊', prompt: '你是一个数据分析助手，擅长数据解读与洞察。' },
      creative: { id: 'creative', name: '创意生成', desc: '脑洞与灵感激发', icon: '💡', prompt: '你是一个创意生成助手，擅长脑洞与灵感激发。' },
      researcher: { id: 'researcher', name: '研究助手', desc: '深度研究与调研', icon: '🔍', prompt: '你是一个研究助手，擅长深度研究与调研。' }
    };
    this.config = {
      apiKey: '',
      baseUrl: 'https://api.openai.com/v1',
      model: 'gpt-4o',
      theme: 'dark',
      agentAuthed: false
    };
    this.currentAgent = 'assistant';
    this.currentMode = 'advanced';

    this.menuBtn = document.getElementById('menuBtn');
    this.drawer = document.getElementById('drawer');
    this.drawerOverlay = document.getElementById('drawerOverlay');
    this.drawerClose = document.getElementById('drawerClose');
    this.newChatBtn = document.getElementById('newChatBtn');
    this.configBtn = document.getElementById('configBtn');
    this.aboutBtn = document.getElementById('aboutBtn');
    this.themeToggleBtn = document.getElementById('themeToggleBtn');
    this.themeToggleLabel = document.getElementById('themeToggleLabel');
    this.welcomeScreen = document.getElementById('welcomeScreen');
    this.welcomeMessageInput = document.getElementById('welcomeMessageInput');
    this.welcomeSendBtn = document.getElementById('welcomeSendBtn');
    this.chatContainer = document.getElementById('chatContainer');
    this.messagesEl = document.getElementById('messages');
    this.messageInput = document.getElementById('messageInput');
    this.sendBtn = document.getElementById('sendBtn');
    this.thinkingIndicator = document.getElementById('thinkingIndicator');
    this.configModal = document.getElementById('configModal');
    this.apiBaseUrl = document.getElementById('apiBaseUrl');
    this.apiKey = document.getElementById('apiKey');
    this.modelName = document.getElementById('modelName');
    this.modelSavedList = document.getElementById('modelSavedList');
    this.configModalClose = document.getElementById('configModalClose');
    this.configCancel = document.getElementById('configCancel');
    this.configSave = document.getElementById('configSave');
    this.settingsBtn = document.getElementById('settingsBtn');
    this.modeToggle = document.getElementById('modeToggle');
    this.modeTrigger = document.getElementById('modeTrigger');
    this.triggerLabel = document.getElementById('triggerLabel');
    // Agent 授权弹窗
    this.agentAuthModal = document.getElementById('agentAuthModal');
    this.agentAuthStatus = document.getElementById('agentAuthStatus');
    this.agentAuthClose = document.getElementById('agentAuthClose');
    this.agentAuthCancel = document.getElementById('agentAuthCancel');
    this.agentAuthGrant = document.getElementById('agentAuthGrant');

    this.bindEvents();
    this.loadConfig();
    this.applyTheme(this.config.theme || 'dark');
    this.updateTriggerLabel();
    this.requestStoragePermission();
    this.startTypewriter();
  }

  bindEvents() {
    // 抽屉
    this.menuBtn.addEventListener('click', () => this.openDrawer());
    this.drawerClose.addEventListener('click', () => this.closeDrawer());
    this.drawerOverlay.addEventListener('click', () => this.closeDrawer());
    this.newChatBtn.addEventListener('click', () => { this.closeDrawer(); this.startNewChat(); });
    this.configBtn.addEventListener('click', () => { this.closeDrawer(); this.openConfigModal(); });
    this.aboutBtn.addEventListener('click', () => {
      this.closeDrawer();
      alert('SoutheastAurelia\n由 CalistaAI 开发并提供相关支持。');
    });

    // 主题切换（菜单最下方）
    this.themeToggleBtn.addEventListener('click', () => {
      const next = this.config.theme === 'dark' ? 'light' : 'dark';
      this.config.theme = next;
      this.saveConfigToStorage();
      this.applyTheme(next);
    });

    this.settingsBtn.addEventListener('click', () => this.openConfigModal());

    // 模式切换器
    this.modeTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      this.modeToggle.classList.toggle('open');
    });

    document.querySelectorAll('#modePanel .mode-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        const mode = item.dataset.mode;
        this.currentMode = mode;
        document.querySelectorAll('#modePanel .mode-item').forEach(x => x.classList.remove('active'));
        item.classList.add('active');
        if (mode === 'agent' && !this.config.agentAuthed) {
          this.openAgentAuthModal();
          return;
        }
        this.updateTriggerLabel();
        this.modeToggle.classList.remove('open');
      });
    });

    // 点击其他区域关闭浮层
    document.addEventListener('click', () => {
      this.modeToggle.classList.remove('open');
    });

    // 聊天输入（普通界面）
    this.messageInput.addEventListener('input', () => this.autoResize(this.messageInput));
    this.messageInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this.handleSend(this.messageInput); }
    });
    this.sendBtn.addEventListener('click', () => this.handleSend(this.messageInput));

    // 欢迎屏输入
    this.welcomeMessageInput.addEventListener('input', () => this.autoResize(this.welcomeMessageInput));
    this.welcomeMessageInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this.handleSend(this.welcomeMessageInput); }
    });
    this.welcomeSendBtn.addEventListener('click', () => this.handleSend(this.welcomeMessageInput));

    // 配置弹窗
    this.configModalClose.addEventListener('click', () => this.closeConfigModal());
    this.configCancel.addEventListener('click', () => this.closeConfigModal());
    this.configSave.addEventListener('click', () => { this.saveConfig(); this.fetchModelList(); });

    // Agent 授权弹窗
    this.agentAuthClose.addEventListener('click', () => this.closeAgentAuthModal());
    this.agentAuthCancel.addEventListener('click', () => this.closeAgentAuthModal());
    this.agentAuthGrant.addEventListener('click', () => this.grantAgentAuth());
  }

  // 应用主题
  applyTheme(theme) {
    if (theme === 'light') {
      document.body.classList.add('light');
      this.themeToggleLabel.textContent = '浅色模式';
      document.querySelector('meta[name="theme-color"]').setAttribute('content', '#f8f9fa');
    } else {
      document.body.classList.remove('light');
      this.themeToggleLabel.textContent = '深色模式';
      document.querySelector('meta[name="theme-color"]').setAttribute('content', '#000000');
    }
  }

  // 请求本地存储权限（Agent 最高权限）
  async requestStoragePermission() {
    try {
      const Filesystem = (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Filesystem);
      if (Filesystem) {
        await Filesystem.getStatus({});
        this.config.storageGranted = true;
      }
    } catch (e) {
      this.config.storageGranted = false;
    }
  }

  // Agent 授权弹窗
  openAgentAuthModal() {
    this.agentAuthStatus.className = 'form-hint';
    this.agentAuthStatus.textContent = this.config.storageGranted
      ? '本地存储权限已就绪，点击授权即可启用 Agent 最高权限。'
      : '正在检测本地存储权限...';
    this.agentAuthModal.style.display = 'flex';
  }
  closeAgentAuthModal() { this.agentAuthModal.style.display = 'none'; }
  async grantAgentAuth() {
    this.agentAuthStatus.textContent = '正在授予最高权限...';
    try {
      const Filesystem = (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Filesystem);
      if (Filesystem) {
        await Filesystem.writeDirectory({
          dir: Filesystem.Defs.Directory.Data,
          path: '.aurelia_agent',
          recursive: true
        });
      }
      this.config.agentAuthed = true;
      this.saveConfigToStorage();
      this.agentAuthStatus.className = 'form-hint ok';
      this.agentAuthStatus.textContent = '✅ Agent 最高权限已授予';
      setTimeout(() => {
        this.closeAgentAuthModal();
      }, 600);
      this.fetchModelList();
    } catch (e) {
      this.agentAuthStatus.textContent = '授权失败：' + e.message;
    }
  }


  updateTriggerLabel() {
    const label =
      this.currentMode === 'quick' ? '快速' :
      this.currentMode === 'advanced' ? '进阶' :
      'Agent';
    this.triggerLabel.textContent = label;
  }

  openDrawer() { this.drawer.classList.add('active'); this.drawerOverlay.classList.add('active'); }
  closeDrawer() { this.drawer.classList.remove('active'); this.drawerOverlay.classList.remove('active'); }

  startNewChat() {
    this.messagesEl.innerHTML = '';
    this.welcomeScreen.style.display = 'flex';
    this.chatContainer.style.display = 'none';
  }

  handleSend(inputEl) {
    const text = inputEl.value.trim();
    if (!text) return;
    if (!this.config.apiKey) { this.openConfigModal(); return; }

    // 切换到聊天界面
    this.welcomeScreen.style.display = 'none';
    this.chatContainer.style.display = 'flex';
    this.addMessage('user', text);
    this.messageInput.value = '';
    this.welcomeMessageInput.value = '';
    this.autoResize(this.messageInput);
    this.autoResize(this.welcomeMessageInput);
    this.thinkingIndicator.classList.add('show');
    this.callAPI(text);
  }

  autoResize(el) {
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 100) + 'px';
  }

  addMessage(role, text, thinking) {
    const div = document.createElement('div');
    div.className = 'message ' + role;

    // 用户消息：保留头像+气泡
    if (role === 'user') {
      const avatar = document.createElement('div');
      avatar.className = 'message-avatar';
      avatar.textContent = '我';
      const content = document.createElement('div');
      content.className = 'message-content user-bubble';
      content.textContent = text;
      div.appendChild(avatar);
      div.appendChild(content);
      this.messagesEl.appendChild(div);
      this.messagesEl.parentElement.scrollTop = this.messagesEl.parentElement.scrollHeight;
      return;
    }

    // AI 消息：无气泡，纯文字 + 可选思考过程（灰色竖线）
    if (thinking) {
      const think = document.createElement('div');
      think.className = 'thinking-block';
      const thinkToggle = document.createElement('div');
      thinkToggle.className = 'thinking-toggle';
      thinkToggle.innerHTML = '<span class="thinking-icon">●</span> 思考过程';
      thinkToggle.addEventListener('click', () => {
        think.classList.toggle('collapsed');
      });
      const thinkContent = document.createElement('div');
      thinkContent.className = 'thinking-content';
      thinkContent.textContent = thinking;
      think.appendChild(thinkToggle);
      think.appendChild(thinkContent);
      div.appendChild(think);
    }

    const textEl = document.createElement('div');
    textEl.className = 'message-content ai-text';
    textEl.innerHTML = this.formatText(text);
    div.appendChild(textEl);
    this.messagesEl.appendChild(div);
    this.messagesEl.parentElement.scrollTop = this.messagesEl.parentElement.scrollHeight;
  }

  formatText(text) {
    const esc = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    let out = esc
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/`([^`]+)`/g, '<code>$1</code>');
    out = out.replace(/\n```(\w+)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>');
    out = out.replace(/```(\w+)?\n?([\s\S]*?)```/g, '<pre><code>$2</code></pre>');
    return out;
  }

  async callAPI(userMessage) {
    try {
      const agentPrompt = this.agents[this.currentAgent].prompt;
      const fullPrompt = agentPrompt;

      // 快速 = 无深度思考直接输出，进阶 = 高思考深度
      const body = {
        model: this.config.model,
        messages: [
          { role: 'system', content: fullPrompt },
          { role: 'user', content: userMessage }
        ],
        stream: false
      };
      if (this.currentMode === 'advanced') {
        body.reasoning_effort = 'high';
      }

      const res = await fetch(this.config.baseUrl + '/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + this.config.apiKey
        },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      const msg = data.choices[0].message;
      const content = msg.content || '';
      const thinking = msg.reasoning_content || msg.reasoning || msg.thinking || '';
      this.thinkingIndicator.classList.remove('show');
      this.addMessage('ai', content, thinking);
    } catch (e) {
      this.thinkingIndicator.classList.remove('show');
      this.addMessage('ai', '请求失败：' + e.message, '');
    }
  }

  openConfigModal() {
    this.apiBaseUrl.value = this.config.baseUrl;
    this.apiKey.value = this.config.apiKey;
    this.config.savedModels = this.config.savedModels || [];
    this.populateModelSelector();
    this.renderSavedModels();
    // 有 key 和 url 就自动拉模型列表
    if (this.config.apiKey && this.config.baseUrl) this.fetchModelList();
    this.configModal.style.display = 'flex';
  }
  closeConfigModal() { this.configModal.style.display = 'none'; }
  saveConfig() {
    this.config.baseUrl = this.apiBaseUrl.value.trim() || 'https://api.openai.com/v1';
    this.config.apiKey = this.apiKey.value.trim();
    const selectedModel = this.modelName.value;
    if (selectedModel) {
      this.config.model = selectedModel;
      // 加入已保存模型列表（去重）
      this.config.savedModels = this.config.savedModels || [];
      if (!this.config.savedModels.includes(selectedModel)) {
        this.config.savedModels.push(selectedModel);
      }
    }
    this.saveConfigToStorage();
    this.renderSavedModels();
    this.closeConfigModal();
  }

  populateModelSelector() {
    const sel = this.modelName;
    sel.innerHTML = '<option value="">— 请选择 —</option>';
    const all = (this.config.savedModels || []).slice();
    if (this.config.model && !all.includes(this.config.model)) all.unshift(this.config.model);
    all.forEach(id => {
      const opt = document.createElement('option');
      opt.value = id; opt.textContent = id;
      sel.appendChild(opt);
    });
    sel.value = this.config.model || '';
  }

  renderSavedModels() {
    const list = this.modelSavedList;
    list.innerHTML = '';
    const models = this.config.savedModels || [];
    if (models.length === 0) {
      list.innerHTML = '<p class="model-empty-hint">暂无已保存模型</p>';
      return;
    }
    models.forEach(id => {
      const item = document.createElement('div');
      item.className = 'model-saved-item' + (id === this.config.model ? ' active' : '');
      item.innerHTML = '<span class="model-saved-name">' + id + '</span><span class="model-saved-tag">已保存</span>';
      item.addEventListener('click', () => {
        this.config.model = id;
        this.saveConfigToStorage();
        this.modelName.value = id;
        this.renderSavedModels();
      });
      list.appendChild(item);
    });
  }

  async fetchModelList() {
    try {
      const res = await fetch(this.config.baseUrl + '/models', {
        headers: { 'Authorization': 'Bearer ' + this.config.apiKey }
      });
      if (!res.ok) return;
      const data = await res.json();
      const models = (data.data || []).map(m => m.id || m.name).filter(Boolean);
      if (models.length === 0) return;
      // 把拉取到的模型也写入已保存列表
      this.config.savedModels = this.config.savedModels || [];
      models.forEach(id => {
        if (!this.config.savedModels.includes(id)) this.config.savedModels.push(id);
      });
      this.saveConfigToStorage();
      this.populateModelSelector();
      this.renderSavedModels();
    } catch (e) { /* 静默失败 */ }
  }

  loadConfig() {
    try {
      const saved = localStorage.getItem('southeast_aurelia_config');
      if (saved) this.config = Object.assign(this.config, JSON.parse(saved));
    } catch (e) {}
  }
  saveConfigToStorage() {
    localStorage.setItem('southeast_aurelia_config', JSON.stringify(this.config));
  }

  /* 打字机效果 */
  startTypewriter() {
    const lines = [
      '今天想探索什么？尽管问。',
      '写代码、查资料、聊天，我都在。',
      '把任务丢给我，剩下的交给我处理。',
      '文档太长？我帮你提炼重点。',
      '需要翻译、润色、总结？说一声就行。',
      '复杂问题也能拆，我们一步步来。',
      '数据看不懂？发给我试试。',
      '想到哪问到哪，别客气。',
      '有灵感了？我帮你捋一捋。',
      '我一直在，随时开始。'
    ];
    this.twLines = lines;
    this.twIdx = 0;
    this.twCharIdx = 0;
    this.twDeleting = false;
    this.twTextEl = document.getElementById('twText');
    this.typewriterLoop();
  }

  typewriterLoop() {
    if (!this.twTextEl) return;
    const line = this.twLines[this.twIdx];
    const speed = this.twDeleting ? 30 : 65;

    if (!this.twDeleting) {
      // 打字
      this.twCharIdx++;
      this.twTextEl.textContent = line.slice(0, this.twCharIdx);
      if (this.twCharIdx >= line.length) {
        this.twDeleting = true;
        this.typewriterTimer = setTimeout(() => this.typewriterLoop(), 1600);
        return;
      }
      this.typewriterTimer = setTimeout(() => this.typewriterLoop(), speed);
    } else {
      // 退格
      this.twCharIdx--;
      this.twTextEl.textContent = line.slice(0, this.twCharIdx);
      if (this.twCharIdx <= 0) {
        this.twDeleting = false;
        this.twIdx = (this.twIdx + 1) % this.twLines.length;
        this.typewriterTimer = setTimeout(() => this.typewriterLoop(), 400);
        return;
      }
      this.typewriterTimer = setTimeout(() => this.typewriterLoop(), speed);
    }
  }


}

document.addEventListener('DOMContentLoaded', () => { new SoutheastAurelia(); });
