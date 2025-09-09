/**
 * Jogo Do Número Secreto - Enhanced Version
 * A modern, accessible number guessing game
 */

// ===== GAME STATE MANAGEMENT =====

const GameState = {
  INITIAL: 'initial',
  PLAYING: 'playing',
  WON: 'won',
  LOST: 'lost'
};

const GameConfig = {
  MIN_NUMBER: 1,
  MAX_NUMBER: 10,
  MAX_ATTEMPTS: 5, // Optional: Add attempt limit
  VOICE_RATE: 1.2,
  VOICE_LANGUAGE: 'Brazilian Portuguese Female'
};

class NumberGuessingGame {
  constructor() {
    this.numeroSecreto = null;
    this.tentativas = 1;
    this.listaDeNumerosSorteados = [];
    this.currentState = GameState.INITIAL;
    this.inputTimeout = null;
    this.elements = this.cacheElements();
    this.bindEvents();
    this.inicializarJogo();
  }

  // ===== ELEMENT CACHING =====
  
  cacheElements() {
    return {
      gameTitle: document.getElementById('game-title'),
      gameDescription: document.getElementById('game-description'),
      guessInput: document.getElementById('guess-input'),
      newGameButton: document.getElementById('new-game'),
      feedbackMessage: document.getElementById('feedback-message'),
      attemptCount: document.getElementById('attempt-count'),
      gameStatus: document.getElementById('game-status'),
      inputHint: document.getElementById('input-hint')
    };
  }

  // ===== EVENT BINDING =====
  
  bindEvents() {
    // Input events
    this.elements.guessInput.addEventListener('input', (e) => this.handleInput(e));
    this.elements.guessInput.addEventListener('keypress', (e) => this.handleKeyPress(e));
    this.elements.guessInput.addEventListener('focus', () => this.handleInputFocus());
    this.elements.guessInput.addEventListener('blur', () => this.handleInputBlur());
    
    // Button events
    this.elements.newGameButton.addEventListener('click', () => this.reiniciarJogo());
    
    // Accessibility: Keyboard navigation
    document.addEventListener('keydown', (e) => this.handleGlobalKeyDown(e));
    
    // Performance: Prevent form submission
    document.addEventListener('submit', (e) => e.preventDefault());
  }

  // ===== GAME LOGIC =====
  
  inicializarJogo() {
    this.numeroSecreto = this.gerarNumeroAleatorio();
    this.tentativas = 1;
    this.currentState = GameState.INITIAL;
    this.exibirMensagemInicial();
    this.updateUI();
    this.focusInput();
  }

  gerarNumeroAleatorio() {
    const numeroEscolhido = Math.floor(Math.random() * GameConfig.MAX_NUMBER) + GameConfig.MIN_NUMBER;
    const quantidadeDeElementosNaLista = this.listaDeNumerosSorteados.length;

    // Reset list when all numbers have been used
    if (quantidadeDeElementosNaLista === GameConfig.MAX_NUMBER) {
      this.listaDeNumerosSorteados = [];
    }

    // Ensure unique numbers
    if (this.listaDeNumerosSorteados.includes(numeroEscolhido)) {
      return this.gerarNumeroAleatorio();
    } else {
      this.listaDeNumerosSorteados.push(numeroEscolhido);
      console.log('Números sorteados:', this.listaDeNumerosSorteados);
      console.log('Número secreto atual:', numeroEscolhido);
      return numeroEscolhido;
    }
  }

  verificarChute() {
    const chute = parseInt(this.elements.guessInput.value);
    
    // Input validation
    if (!this.validarInput(chute)) {
      return;
    }

    this.currentState = GameState.PLAYING;
    
    if (chute === this.numeroSecreto) {
      this.handleCorrectGuess();
    } else {
      this.handleIncorrectGuess(chute);
    }
    
    this.updateUI();
  }

  validarInput(chute) {
    if (isNaN(chute) || chute === null || chute === undefined) {
      this.showFeedback('Por favor, digite um número válido!', 'warning', true);
      this.animateElement(this.elements.guessInput, 'animate-shake');
      return false;
    }
    
    if (chute < GameConfig.MIN_NUMBER || chute > GameConfig.MAX_NUMBER) {
      this.showFeedback(`Digite um número entre ${GameConfig.MIN_NUMBER} e ${GameConfig.MAX_NUMBER}!`, 'warning', true);
      this.animateElement(this.elements.guessInput, 'animate-shake');
      return false;
    }
    
    return true;
  }

  handleCorrectGuess() {
    this.currentState = GameState.WON;
    const palavraTentativa = this.tentativas > 1 ? 'tentativas' : 'tentativa';
    const mensagemVitoria = `🎉 Parabéns! Você descobriu o número secreto ${this.numeroSecreto} com ${this.tentativas} ${palavraTentativa}!`;
    
    this.exibirTextoNaTela('h1', 'Você Acertou! 🎉');
    this.showFeedback(mensagemVitoria, 'success', true);
    
    // Enable new game button
    this.elements.newGameButton.disabled = false;
    this.elements.guessInput.disabled = true;
    
    // Celebration animation
    this.animateElement(document.querySelector('.container'), 'animate-bounce');
    this.createConfetti();
  }

  handleIncorrectGuess(chute) {
    let mensagem = '';
    let dica = '';
    
    if (chute > this.numeroSecreto) {
      mensagem = 'O número secreto é menor! 📉';
      dica = 'Tente um número menor';
    } else {
      mensagem = 'O número secreto é maior! 📈';
      dica = 'Tente um número maior';
    }
    
    this.showFeedback(mensagem, 'info', true);
    this.elements.inputHint.textContent = dica;
    
    this.tentativas++;
    this.limparCampo();
    this.focusInput();
    
    // Animate feedback
    this.animateElement(this.elements.feedbackMessage, 'animate-slideIn');
  }

  reiniciarJogo() {
    // Reset game state
    this.numeroSecreto = this.gerarNumeroAleatorio();
    this.tentativas = 1;
    this.currentState = GameState.INITIAL;
    
    // Reset UI elements
    this.elements.newGameButton.disabled = true;
    this.elements.guessInput.disabled = false;
    
    // Clear and reset messages
    this.limparCampo();
    this.exibirMensagemInicial();
    this.updateUI();
    this.focusInput();
    
    // Animate reset
    this.animateElement(document.querySelector('.container'), 'animate-fadeIn');
  }

  // ===== UI MANAGEMENT =====
  
  exibirMensagemInicial() {
    this.exibirTextoNaTela('h1', 'Adivinhe o <span class="game-title__highlight">número secreto</span>');
    this.showFeedback('Faça seu primeiro palpite!', 'info', false);
    this.elements.inputHint.textContent = `Digite um número de ${GameConfig.MIN_NUMBER} a ${GameConfig.MAX_NUMBER}`;
  }

  exibirTextoNaTela(tag, texto) {
    const campo = document.querySelector(tag);
    if (campo) {
      campo.innerHTML = texto;
      
      // Text-to-speech with error handling
      if (typeof responsiveVoice !== 'undefined' && responsiveVoice.voiceSupport()) {
        responsiveVoice.speak(texto.replace(/<[^>]*>/g, ''), GameConfig.VOICE_LANGUAGE, {
          rate: GameConfig.VOICE_RATE,
          onend: () => console.log('Speech completed')
        });
      }
    }
  }

  showFeedback(message, type = 'info', speak = false) {
    this.elements.feedbackMessage.textContent = message;
    this.elements.feedbackMessage.className = `feedback-message show ${type}`;
    
    if (speak) {
      this.speakText(message);
    }
  }

  speakText(text) {
    if (typeof responsiveVoice !== 'undefined' && responsiveVoice.voiceSupport()) {
      responsiveVoice.speak(text, GameConfig.VOICE_LANGUAGE, {
        rate: GameConfig.VOICE_RATE
      });
    }
  }

  updateUI() {
    // Update attempt counter
    this.elements.attemptCount.textContent = this.tentativas;
    this.elements.attemptCount.setAttribute('aria-label', `Tentativa número ${this.tentativas}`);
    
    // Update game status
    const statusText = this.getStatusText();
    this.elements.gameStatus.textContent = statusText;
    
    // Update input state
    this.updateInputState();
  }

  getStatusText() {
    switch (this.currentState) {
      case GameState.INITIAL:
        return 'Pronto para jogar';
      case GameState.PLAYING:
        return 'Em andamento';
      case GameState.WON:
        return 'Você ganhou!';
      case GameState.LOST:
        return 'Tente novamente';
      default:
        return 'Em andamento';
    }
  }

  updateInputState() {
    const isGameActive = this.currentState === GameState.INITIAL || this.currentState === GameState.PLAYING;
    this.elements.guessInput.disabled = !isGameActive;
  }

  // ===== INPUT HANDLING =====
  
  handleInput(event) {
    const value = event.target.value;
    
    // Clear timeout if user is still typing
    if (this.inputTimeout) {
      clearTimeout(this.inputTimeout);
    }
    
    // Real-time validation feedback
    if (value && (parseInt(value) < GameConfig.MIN_NUMBER || parseInt(value) > GameConfig.MAX_NUMBER)) {
      this.elements.inputHint.textContent = `Número deve estar entre ${GameConfig.MIN_NUMBER} e ${GameConfig.MAX_NUMBER}`;
      this.elements.inputHint.style.color = 'var(--error-light)';
    } else {
      this.elements.inputHint.textContent = `Digite um número de ${GameConfig.MIN_NUMBER} a ${GameConfig.MAX_NUMBER}`;
      this.elements.inputHint.style.color = '';
    }
    
    // Auto-submit after user stops typing (debounced)
    if (value && value.length > 0) {
      this.inputTimeout = setTimeout(() => {
        const numValue = parseInt(value);
        if (!isNaN(numValue) && numValue >= GameConfig.MIN_NUMBER && numValue <= GameConfig.MAX_NUMBER) {
          this.verificarChute();
        }
      }, 800); // Wait 800ms after user stops typing
    }
  }

  handleKeyPress(event) {
    // Submit on Enter key
    if (event.key === 'Enter') {
      event.preventDefault();
      this.verificarChute();
    }
  }

  handleInputFocus() {
    this.animateElement(this.elements.guessInput, 'animate-pulse');
  }

  handleInputBlur() {
    this.elements.guessInput.classList.remove('animate-pulse');
  }

  handleGlobalKeyDown(event) {
    // Keyboard shortcuts
    switch (event.key) {
      case 'Escape':
        this.limparCampo();
        break;
      case 'F5':
        event.preventDefault();
        this.reiniciarJogo();
        break;
    }
  }

  // ===== UTILITY FUNCTIONS =====
  
  limparCampo() {
    // Clear input timeout
    if (this.inputTimeout) {
      clearTimeout(this.inputTimeout);
      this.inputTimeout = null;
    }
    
    this.elements.guessInput.value = '';
    this.elements.inputHint.textContent = `Digite um número de ${GameConfig.MIN_NUMBER} a ${GameConfig.MAX_NUMBER}`;
    this.elements.inputHint.style.color = '';
  }

  focusInput() {
    // Delay focus to ensure smooth transitions
    setTimeout(() => {
      this.elements.guessInput.focus();
    }, 100);
  }

  animateElement(element, animationClass) {
    if (!element) return;
    
    element.classList.remove(animationClass);
    // Force reflow
    element.offsetHeight;
    element.classList.add(animationClass);
    
    // Remove animation class after completion
    setTimeout(() => {
      element.classList.remove(animationClass);
    }, 1000);
  }

  createConfetti() {
    // Simple confetti effect using CSS animations
    for (let i = 0; i < 20; i++) {
      setTimeout(() => {
        const confetti = document.createElement('div');
        confetti.style.cssText = `
          position: fixed;
          top: -10px;
          left: ${Math.random() * 100}%;
          width: 10px;
          height: 10px;
          background: ${['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7'][Math.floor(Math.random() * 5)]};
          z-index: 1000;
          border-radius: 50%;
          animation: confetti-fall ${2 + Math.random() * 3}s linear forwards;
        `;
        
        document.body.appendChild(confetti);
        
        setTimeout(() => {
          confetti.remove();
        }, 5000);
      }, i * 50);
    }
  }
}

// ===== BACKWARDS COMPATIBILITY =====
// Keep original function names for onclick handlers

let game;

function verificarChute() {
  if (game) game.verificarChute();
}

function reiniciarJogo() {
  if (game) game.reiniciarJogo();
}

// ===== INITIALIZATION =====

// Wait for DOM and external scripts to load
function initializeGame() {
  game = new NumberGuessingGame();
  console.log('🎮 Jogo do Número Secreto carregado com sucesso!');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeGame);
} else {
  initializeGame();
}

// Add confetti animation CSS
const style = document.createElement('style');
style.textContent = `
  @keyframes confetti-fall {
    to {
      transform: translateY(100vh) rotate(360deg);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);



