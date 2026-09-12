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
      model: 'gpt-4o'
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
    this.settingsBtn = document.getElementById('settingsBtn');

    // 新增：模式切换器与 Agent 面板
    this.modeToggle = document.getElementById('modeToggle');
    this.modeTrigger = document.getElementById('modeTrigger');
    this.triggerLabel = document.getElementById('triggerLabel');
    this.agentPanel = document.getElementById('agentPanel');

    this.bindEvents();
    this.loadConfig();
    this.renderAgentPanel();
    this.updateTriggerLabel();
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

    // 设置按钮（顶栏右侧）直接打开配置
    this.settingsBtn.addEventListener('click', () => this.openConfigModal());

    // 模式切换器：点击 trigger 展开/收起 3 个 tab
    this.modeTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = this.modeToggle.classList.toggle('open');
      // 展开模式切换器时，若选中 agent 则同时显示 agent 面板
      if (isOpen && this.currentMode === 'agent') this.showAgentPanel();
    });

    // 3 个 tab 点击
    document.querySelectorAll('#modePanel .mode-item').forEach(item => {
      item.addEventListener('click', () => {
        const mode = item.dataset.mode;
        this.currentMode = mode;
        document.querySelectorAll('#modePanel .mode-item').forEach(x => x.classList.remove('active'));
        item.classList.add('active');
        if (mode === 'agent') {
          this.showAgentPanel();
        } else {
          this.agentPanel.classList.remove('open');
          this.updateTriggerLabel();
          this.modeToggle.classList.remove('open');
        }
      });
    });

    // 点击其他区域关闭浮层
    document.addEventListener('click', () => {
      this.modeToggle.classList.remove('open');
      this.agentPanel.classList.remove('open');
    });

    // 输入
    this.messageInput.addEventListener('input', () => this.autoResize());
    this.messageInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this.handleSend(); }
    });
    this.sendBtn.addEventListener('click', () => this.handleSend());

    // 配置弹窗
    this.configModalClose.addEventListener('click', () => this.closeConfigModal());
    this.configCancel.addEventListener('click', () => this.closeConfigModal());
    this.configSave.addEventListener('click', () => this.saveConfig());
  }

  renderAgentPanel() {
    this.agentPanel.innerHTML = '';
    Object.values(this.agents).forEach(agent => {
      const btn = document.createElement('button');
      btn.className = 'agent-item' + (agent.id === this.currentAgent ? ' active' : '');
      btn.dataset.agent = agent.id;
      btn.innerHTML =
        '<div class="agent-icon">' + agent.icon + '</div>' +
        '<div class="agent-info"><div class="agent-name">' + agent.name + '</div><div class="agent-desc">' + agent.desc + '</div></div>';
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.selectAgent(agent.id);
      });
      this.agentPanel.appendChild(btn);
    });
  }

  showAgentPanel() {
    this.agentPanel.classList.add('open');
  }

  selectAgent(id) {
    this.currentAgent = id;
    document.querySelectorAll('.agent-item').forEach(el => el.classList.toggle('active', el.dataset.agent === id));
    this.chatName.textContent = this.agents[id].name;
    this.agentPanel.classList.remove('open');
    this.modeToggle.classList.remove('open');
    this.updateTriggerLabel();
  }

  updateTriggerLabel() {
    const label =
      this.currentMode === 'quick' ? '快速' :
      this.currentMode === 'advanced' ? '进阶' :
      this.agents[this.currentAgent].name;
    this.triggerLabel.textContent = label;
  }

  openDrawer() { this.drawer.classList.add('active'); this.drawerOverlay.classList.add('active'); }
  closeDrawer() { this.drawer.classList.remove('active'); this.drawerOverlay.classList.remove('active'); }

  startNewChat() {
    this.messagesEl.innerHTML = '';
    this.welcomeScreen.style.display = 'flex';
    this.chatContainer.style.display = 'none';
  }

  handleSend() {
    const text = this.messageInput.value.trim();
    if (!text) return;
    if (!this.config.apiKey) { this.openConfigModal(); return; }

    this.welcomeScreen.style.display = 'none';
    this.chatContainer.style.display = 'flex';
    this.addMessage('user', text);
    this.messageInput.value = '';
    this.autoResize();
    this.thinkingIndicator.classList.add('show');
    this.callAPI(text);
  }

  autoResize() {
    this.messageInput.style.height = 'auto';
    this.messageInput.style.height = Math.min(this.messageInput.scrollHeight, 100) + 'px';
  }

  addMessage(role, text) {
    const div = document.createElement('div');
    div.className = 'message ' + role;
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = role === 'ai' ? '✦' : '👤';
    const content = document.createElement('div');
    content.className = 'message-content';
    content.innerHTML = this.formatText(text);
    div.appendChild(avatar);
    div.appendChild(content);
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
      const fullPrompt = this.agents[this.currentAgent].prompt + '\n\n' + userMessage;
      const res = await fetch(this.config.baseUrl + '/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + this.config.apiKey
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [{ role: 'system', content: fullPrompt }, { role: 'user', content: userMessage }],
          stream: false
        })
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      this.thinkingIndicator.classList.remove('show');
      this.addMessage('ai', data.choices[0].message.content);
    } catch (e) {
      this.thinkingIndicator.classList.remove('show');
      this.addMessage('ai', '请求失败：' + e.message);
    }
  }

  openConfigModal() {
    this.apiBaseUrl.value = this.config.baseUrl;
    this.apiKey.value = this.config.apiKey;
    this.modelName.value = this.config.model;
    this.configModal.style.display = 'flex';
  }
  closeConfigModal() { this.configModal.style.display = 'none'; }
  saveConfig() {
    this.config.baseUrl = this.apiBaseUrl.value.trim() || 'https://api.openai.com/v1';
    this.config.apiKey = this.apiKey.value.trim();
    this.config.model = this.modelName.value.trim() || 'gpt-4o';
    this.saveConfigToStorage();
    this.closeConfigModal();
  }

  loadConfig() {
    try {
      const saved = localStorage.getItem('southeast_aurelia_config');
      if (saved) this.config = JSON.parse(saved);
    } catch (e) {}
  }
  saveConfigToStorage() {
    localStorage.setItem('southeast_aurelia_config', JSON.stringify(this.config));
  }
}

document.addEventListener('DOMContentLoaded', () => { new SoutheastAurelia(); });
