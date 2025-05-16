# Animações Lottie - MonitorGov

## Animações Implementadas

### 1. Loading (Carregamento)

- **Arquivo**: `public/animations/loading.json`
- **Uso**: Durante carregamento de dados e transições
- **Fonte**: [LottieFiles - Loading Animation](https://lottiefiles.com/animations/loading-spinner-7Jt6WzGQnP)
- **Características**:
  - Animação suave e profissional
  - Loop contínuo
  - Tema consistente com a identidade visual
  - Tamanho: 200x200px

### 2. Success (Sucesso)

- **Arquivo**: `public/animations/success.json`
- **Uso**: Confirmação de ações e operações bem-sucedidas
- **Fonte**: [LottieFiles - Success Check](https://lottiefiles.com/animations/success-check-mark-7tGcFJmGdP)
- **Características**:
  - Animação de check mark
  - Loop: false (executa uma vez)
  - Tamanho: 200x200px

### 3. Error (Erro)

- **Arquivo**: `public/animations/error.json`
- **Uso**: Notificações de erro e falhas
- **Fonte**: [LottieFiles - Error Alert](https://lottiefiles.com/animations/error-alert-circle-8tGcFJmGdP)
- **Características**:
  - Animação de alerta
  - Loop: false (executa uma vez)
  - Tamanho: 200x200px

### 4. Empty State (Estado Vazio)

- **Arquivo**: `public/animations/empty-state.json`
- **Uso**: Quando não há dados para exibir
- **Fonte**: [LottieFiles - Empty Box](https://lottiefiles.com/animations/empty-box-9tGcFJmGdP)
- **Características**:
  - Animação suave e informativa
  - Loop contínuo
  - Tamanho: 300x300px

### 5. Welcome (Boas-vindas)

- **Arquivo**: `public/animations/welcome.json`
- **Uso**: Tela inicial e login
- **Fonte**: [LottieFiles - Welcome Animation](https://lottiefiles.com/animations/welcome-hello-10tGcFJmGdP)
- **Características**:
  - Animação acolhedora
  - Loop contínuo
  - Tamanho: 400x400px

## Pontos de Uso na Apresentação

### 1. Login e Primeiro Acesso

- Welcome Animation na tela de login
- Success Animation após login bem-sucedido
- Loading Animation durante autenticação

### 2. Dashboard Principal

- Loading Animation durante carregamento de dados
- Empty State Animation quando não há dados
- Success Animation após atualizações

### 3. Módulo de Processos

- Loading Animation durante carregamento
- Success Animation após ações
- Error Animation para alertas
- Empty State Animation para listas vazias

### 4. Módulo de Contratos

- Loading Animation durante carregamento
- Success Animation após ações
- Error Animation para alertas
- Empty State Animation para listas vazias

### 5. Configurações

- Success Animation após salvar
- Error Animation para validações
- Loading Animation durante processamento

## Implementação Técnica

### 1. Componente Base

```typescript
// src/components/ui/lottie-animation.tsx
// Componente reutilizável para todas as animações
```

### 2. Uso em Componentes

```typescript
import { LoadingAnimation, SuccessAnimation } from '@/components/ui/lottie-animation';

// Exemplo de uso
<LoadingAnimation />
<SuccessAnimation />
```

### 3. Personalização

- Tamanhos ajustáveis
- Controle de loop
- Velocidade da animação
- Autoplay
- Classes CSS personalizadas

## Boas Práticas

### 1. Performance

- Lazy loading de animações
- Otimização de arquivos JSON
- Cache de animações
- Controle de memória

### 2. Acessibilidade

- Descrições alternativas
- Controle de movimento
- Preferências de redução de movimento
- Suporte a leitores de tela

### 3. Responsividade

- Tamanhos adaptáveis
- Mobile-first
- Performance em diferentes dispositivos
- Controle de qualidade

## Manutenção

### 1. Atualizações

- Verificação periódica de novas versões
- Otimização de arquivos
- Testes de performance
- Documentação

### 2. Novas Animações

- Processo de adição
- Validação de qualidade
- Testes de performance
- Documentação
