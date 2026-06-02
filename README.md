# React + Vite
# Simulador de Autenticação Segura vs Insegura (BancoBR)
This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.
> [!IMPORTANT]
> **AVISO IMPORTANTE:** Este projeto é um **demonstrador estático e interativo de caráter puramente educacional**, desenvolvido para uma apresentação acadêmica da disciplina de **Segurança e Auditoria de Sistemas** do curso de **Sistemas de Informação (FAESA)**. **Não se trata de uma ferramenta de segurança real**, de um sistema bancário em produção ou de um utilitário de hacking. Todo o backend, banco de dados e logs de rede são simulados localmente no navegador (client-side).
Currently, two official plugins are available:
O simulador demonstra de forma visual e interativa a diferença entre um design de login vulnerável (baseado em dados públicos vazados e OSINT) e um design seguro (baseado nas diretrizes do NIST SP 800-63b, com múltiplos fatores de autenticação e rate limiting).
- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)
---
## React Compiler
## 🛠️ Funcionalidades Demonstradas
The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).
O projeto divide-se em duas simulações principais que rodam lado a lado com painéis de controle do "atacante" e do "servidor":
## Expanding the ESLint configuration
### 1. Cenário Vulnerável (A06:2025 - Insecure Design)
Demonstra como sistemas que usam dados públicos compartilhados (CPF, data de nascimento e nome da mãe) como fatores exclusivos de acesso à conta são inseguros.
* **Ataque via Vazamento**: O simulador preenche automaticamente dados obtidos de um dump SQL fictício (`vazamento_2024.sql`).
* **Ataque OSINT**: Simula logs de mineração que localizam o aniversário e o nome da mãe do alvo em redes sociais abertas e Diários Oficiais.
* **Ataque de Força Bruta**: O script automatizado varre sequencialmente dezenas de datas de nascimento no input em alta velocidade até achar a correta, sem nenhum bloqueio por parte do servidor.
If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
### 2. Cenário Seguro (Design Seguro)
Demonstra a aplicação prática de múltiplos fatores e mitigação de brute-force.
* **Fator 1 + Fator 2 (CPF + Senha + OTP)**: Fluxo completo de 3 etapas com hash `bcrypt` e envio de token temporário de uso único (OTP).
* **Bloqueio por Rate Limiting (Senha)**: Se o atacante tenta força bruta na senha, após 5 erros seguidos o servidor bloqueia temporariamente o IP por 15 minutos.
* **Bloqueio por Rate Limiting (OTP)**: Se o atacante tenta adivinhar o OTP por força bruta, após 5 erros o token gerado é revogado e a sessão é destruída.
---
## 📋 Pré-requisitos
Para rodar este projeto localmente na sua máquina, você precisa ter instalado:
* **Node.js** (versão 18 ou superior recomendada)
* Um gerenciador de pacotes como **npm** (instalado automaticamente com o Node.js)
---
## 🚀 Instalação e Execução
Siga os passos abaixo para instalar e rodar o simulador em modo de desenvolvimento local:
1. **Clonar ou extrair o repositório** na sua máquina.
2. **Abrir o terminal** na pasta raiz do projeto.
3. **Instalar as dependências** do React e dos ícones executando:
   ```bash
   npm install
   ```
4. **Iniciar o servidor de desenvolvimento** local executando:
   ```bash
   npm run dev
   ```
5. O terminal exibirá o endereço local. Abra o navegador e acesse:
   **[http://localhost:5173/](http://localhost:5173/)**
---
## 💻 Estrutura do Código
* `src/App.jsx`: Componente principal que gerencia o roteamento entre as telas.
* `src/index.css`: Estilização global e sistema de design (variáveis de cores, terminal e animações).
* `src/components/LandingView.jsx`: Tela de boas-vindas com a fundamentação teórica (OWASP / NIST).
* `src/components/VulnerableView.jsx`: Lógica e UI da demonstração vulnerável e do painel do atacante.
* `src/components/SecureView.jsx`: Lógica e UI da demonstração segura (assistente de etapas, inputs OTP interativos, rate limiter e logs de backend).
---
## 🎓 Créditos Acadêmicos
* **Instituição**: FAESA Centro Universitário
* **Curso**: Sistemas de Informação
* **Disciplina**: Segurança e Auditoria de Sistemas
* **Ano/Período**: 2026/1
* **Grupo**: Eve Chalabi, Wilton Oliveira, Yasmin Newmann e Yasmin Souza
