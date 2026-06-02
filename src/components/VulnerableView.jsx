import React, { useState, useEffect, useRef } from 'react';
import { Skull, Terminal as TermIcon, ShieldAlert, ArrowLeft, Play, Search, Zap, RotateCcw } from 'lucide-react';

export default function VulnerableView({ onBack }) {
  // Form States
  const [cpf, setCpf] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [motherName, setMotherName] = useState('');
  
  // App States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Attack States
  const [activeAttack, setActiveAttack] = useState(null); // 'leak' | 'osint' | 'bruteforce'
  const [terminalLogs, setTerminalLogs] = useState([
    { text: 'Sistema atacante inicializado. Pronto para execução.', type: 'info' }
  ]);
  const [flashFields, setFlashFields] = useState({ cpf: false, birthdate: false, motherName: false });

  const terminalEndRef = useRef(null);

  // Auto-scroll terminal logs
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [terminalLogs]);

  const addLog = (text, type = 'info') => {
    setTerminalLogs(prev => [...prev, { text, type }]);
  };

  const clearLogs = () => {
    setTerminalLogs([]);
  };

  // Simulates human typing
  const typeText = (text, setter, delay = 50) => {
    return new Promise(resolve => {
      let current = '';
      let index = 0;
      const interval = setInterval(() => {
        current += text[index];
        setter(current);
        index++;
        if (index >= text.length) {
          clearInterval(interval);
          resolve();
        }
      }, delay);
    });
  };

  // Attack 1: Leak filling
  const runLeakAttack = async () => {
    if (activeAttack || isLoggedIn) return;
    setActiveAttack('leak');
    clearLogs();
    setCpf('');
    setBirthdate('');
    setMotherName('');
    setErrorMsg('');

    addLog('>> Iniciando ataque via Vazamento de Banco de Dados...', 'yellow');
    await new Promise(r => setTimeout(r, 800));
    
    addLog('[ATACANTE] Acessando dump "vazamento_2024.sql" em cache...', 'info');
    await new Promise(r => setTimeout(r, 600));

    addLog('[ATACANTE] Extraindo credenciais da linha 1.847.332 do dump...', 'info');
    addLog('  - Alvo: João Pedro Alves', 'cyan');
    addLog('  - CPF: 048.521.937-62', 'cyan');
    addLog('  - Data Nasc: 14/03/1991', 'cyan');
    addLog('  - Nome da Mãe: Rosana', 'cyan');
    await new Promise(r => setTimeout(r, 800));

    addLog('[ATACANTE] Injetando CPF "048.521.937-62" no navegador...', 'info');
    setFlashFields(f => ({ ...f, cpf: true }));
    await typeText('048.521.937-62', setCpf, 60);
    setFlashFields(f => ({ ...f, cpf: false }));

    addLog('[ATACANTE] Injetando Data de Nascimento "14/03/1991"...', 'info');
    setFlashFields(f => ({ ...f, birthdate: true }));
    await typeText('14/03/1991', setBirthdate, 60);
    setFlashFields(f => ({ ...f, birthdate: false }));

    addLog('[ATACANTE] Injetando Primeiro Nome da Mãe "Rosana"...', 'info');
    setFlashFields(f => ({ ...f, motherName: true }));
    await typeText('Rosana', setMotherName, 60);
    setFlashFields(f => ({ ...f, motherName: false }));

    addLog('[ATACANTE] Submetendo formulário (clique em Entrar)...', 'yellow');
    await new Promise(r => setTimeout(r, 600));

    setIsSubmitting(true);
    addLog('[SERVIDOR] Recebido POST /api/v1/login', 'info');
    addLog('[SERVIDOR] Executando consulta SQL...', 'info');
    addLog('  Query: SELECT * FROM contas WHERE cpf = "048.521.937-62" AND nascimento = "14/03/1991" AND mae = "Rosana";', 'cyan');
    
    await new Promise(r => setTimeout(r, 1000));
    setIsSubmitting(false);

    addLog('[SERVIDOR] Registro encontrado! Autenticado com sucesso.', 'green');
    addLog('[SERVIDOR] Sessão ID 8a93d2e1 criada sem validação de senha.', 'green');
    addLog('[ATACANTE] LOGIN EFETUADO COM SUCESSO! Conta invadida.', 'green');
    
    setIsLoggedIn(true);
    setActiveAttack(null);
  };

  // Attack 2: OSINT Mining
  const runOsintAttack = async () => {
    if (activeAttack || isLoggedIn) return;
    setActiveAttack('osint');
    clearLogs();
    setCpf('');
    setBirthdate('');
    setMotherName('');
    setErrorMsg('');

    addLog('>> Iniciando mineração de dados OSINT...', 'yellow');
    await new Promise(r => setTimeout(r, 800));

    addLog('[OSINT] Cruzando nome "João Pedro Alves" com fontes públicas...', 'info');
    await new Promise(r => setTimeout(r, 600));

    addLog('[OSINT] Varrendo editais do Diário Oficial do ES...', 'info');
    addLog('  - Sucesso: CPF localizado em edital de concurso: "048.521.937-62"', 'cyan');
    await new Promise(r => setTimeout(r, 800));

    addLog('[OSINT] Varrendo redes sociais (Facebook/Instagram)...', 'info');
    addLog('  - Sucesso: Postagem de 14/03/2021 encontrada: "Trintei! Que venham mais trinta anos!"', 'cyan');
    addLog('  -> Ano de nascimento deduzido: 1991. Data: 14/03/1991.', 'cyan');
    await new Promise(r => setTimeout(r, 800));

    addLog('[OSINT] Varrendo fotos públicas e comentários...', 'info');
    addLog('  - Sucesso: Foto com legenda "Almoço em família com minha mãe Rosana!" localizada.', 'cyan');
    addLog('  -> Primeiro nome da mãe: Rosana.', 'cyan');
    await new Promise(r => setTimeout(r, 800));

    addLog('[ATACANTE] Compilando dossiê e preenchendo formulário...', 'yellow');
    
    setFlashFields(f => ({ ...f, cpf: true }));
    await typeText('048.521.937-62', setCpf, 50);
    setFlashFields(f => ({ ...f, cpf: false }));

    setFlashFields(f => ({ ...f, birthdate: true }));
    await typeText('14/03/1991', setBirthdate, 50);
    setFlashFields(f => ({ ...f, birthdate: false }));

    setFlashFields(f => ({ ...f, motherName: true }));
    await typeText('Rosana', setMotherName, 50);
    setFlashFields(f => ({ ...f, motherName: false }));

    addLog('[ATACANTE] Efetuando requisição de login...', 'yellow');
    await new Promise(r => setTimeout(r, 500));

    setIsSubmitting(true);
    addLog('[SERVIDOR] Recebido POST /api/v1/login', 'info');
    await new Promise(r => setTimeout(r, 800));
    setIsSubmitting(false);

    addLog('[SERVIDOR] Dados conferem. Login autorizado!', 'green');
    addLog('[ATACANTE] SUCESSO: Conta logada apenas com informações públicas (OSINT).', 'green');
    
    setIsLoggedIn(true);
    setActiveAttack(null);
  };

  // Attack 3: Birthdate Brute Force
  const runBruteForce = async () => {
    if (activeAttack || isLoggedIn) return;
    setActiveAttack('bruteforce');
    clearLogs();
    setCpf('');
    setBirthdate('');
    setMotherName('');
    setErrorMsg('');

    addLog('>> Iniciando ataque de Força Bruta na data de nascimento...', 'yellow');
    await new Promise(r => setTimeout(r, 600));

    addLog('[ATACANTE] Fixando CPF "048.521.937-62" (vazado)...', 'info');
    setCpf('048.521.937-62');
    addLog('[ATACANTE] Fixando Mãe "Rosana" (obtido via rede social)...', 'info');
    setMotherName('Rosana');
    await new Promise(r => setTimeout(r, 600));

    addLog('[ATACANTE] Sabendo que o alvo nasceu em 1991 (via OSINT)...', 'info');
    addLog('[ATACANTE] Iniciando varredura sequencial de datas (DD/MM/1991)...', 'yellow');
    await new Promise(r => setTimeout(r, 800));

    // Simulate brute-force fast counter loop
    const targetDay = 14;
    const targetMonth = 3;
    let day = 1;
    let month = 1;
    
    setFlashFields(f => ({ ...f, birthdate: true }));
    
    return new Promise(resolve => {
      const interval = setInterval(() => {
        const dStr = String(day).padStart(2, '0');
        const mStr = String(month).padStart(2, '0');
        const simulatedDate = `${dStr}/${mStr}/1991`;
        
        setBirthdate(simulatedDate);
        addLog(`[TENTATIVA] Data: ${simulatedDate} -> Servidor: 401 Credenciais Incorretas`, 'red');
        
        // Advance date
        if (day === targetDay && month === targetMonth) {
          clearInterval(interval);
          setFlashFields(f => ({ ...f, birthdate: false }));
          
          addLog(`[TENTATIVA] Data: 14/03/1991 -> Servidor: 200 OK!`, 'green');
          addLog('[SERVIDOR] Login bem-sucedido após ' + ((month - 1) * 30 + day) + ' requisições.', 'green');
          addLog('[SERVIDOR] IMPORTANTE: Nenhum bloqueio de IP ou atraso artificial (Rate Limiter) foi acionado.', 'yellow');
          addLog('[ATACANTE] SUCESSO: Data de nascimento descoberta via força bruta automatizada!', 'green');
          
          setIsLoggedIn(true);
          setActiveAttack(null);
          resolve();
        } else {
          day++;
          if (day > 30) {
            day = 1;
            month++;
          }
        }
      }, 70); // fast flashing
    });
  };

  const handleManualLogin = (e) => {
    e.preventDefault();
    if (!cpf || !birthdate || !motherName) {
      setErrorMsg('Preencha todos os campos.');
      return;
    }
    
    setIsSubmitting(true);
    setErrorMsg('');
    clearLogs();

    addLog('[MANDATÁRIO] Requisição de login manual enviada...', 'info');
    
    setTimeout(() => {
      setIsSubmitting(false);
      // Fictional credentials of the user
      if (
        cpf.replace(/\D/g, '') === '04852193762' &&
        birthdate === '14/03/1991' &&
        motherName.toLowerCase().trim() === 'rosana'
      ) {
        addLog('[SERVIDOR] Sucesso: Dados coincidem!', 'green');
        setIsLoggedIn(true);
      } else {
        addLog('[SERVIDOR] Erro: Dados não conferem com o banco.', 'red');
        setErrorMsg('CPF, data de nascimento ou nome da mãe incorretos.');
      }
    }, 1000);
  };

  const resetSimulation = () => {
    setCpf('');
    setBirthdate('');
    setMotherName('');
    setIsLoggedIn(false);
    setIsSubmitting(false);
    setErrorMsg('');
    setActiveAttack(null);
    setTerminalLogs([
      { text: 'Simulador reiniciado. Pronto para novos ataques.', type: 'info' }
    ]);
  };

  return (
    <div className="simulation-layout scale-in">
      {/* Simulation Top Bar */}
      <div className="top-nav-bar">
        <button className="back-to-menu-btn" onClick={onBack}>
          <ArrowLeft size={16} /> Voltar ao Menu Principal
        </button>
        <span className="owasp-tag" style={{ margin: 0, padding: '0.2rem 0.8rem', fontSize: '0.75rem' }}>
          A06:2025 - Insecure Design
        </span>
      </div>

      <div className="simulation-top-bar vulneravel">
        Versão Vulnerável — Autenticação por Dados Públicos — Design Inseguro
      </div>

      {/* Main split workspace */}
      <div className="simulation-workspace">
        
        {/* Left Side: The App Simulator */}
        <div className="simulation-panel-left">
          <div className="app-screen-container">
            <div className="bank-header">
              <div className="bank-logo">
                <span className="brand">BancoBR</span>
                <span className="sub">Internet Banking</span>
              </div>
              <Skull size={24} color="#fca5a5" />
            </div>

            <div className="app-screen-content">
              {isLoggedIn ? (
                <div className="success-screen scale-in">
                  <div className="success-icon-container" style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
                    <ShieldAlert size={40} />
                  </div>
                  <h3 className="success-title" style={{ color: '#991b1b' }}>Sessão Invadida!</h3>
                  <p className="success-subtitle" style={{ fontSize: '0.85rem' }}>
                    O atacante acessou a conta sem saber nenhuma senha secreta.
                  </p>
                  
                  <div className="form-group" style={{ width: '100%', background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.5rem' }}>DADOS DA CONTA ACESSADA:</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>João Pedro Alves</div>
                    <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '0.25rem' }}>Agência: 0312-3 | Conta: 104.992-1</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#dc2626', marginTop: '0.75rem' }}>Saldo: R$ 15.420,00</div>
                  </div>

                  <button 
                    className="form-button" 
                    onClick={resetSimulation}
                    style={{ background: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                  >
                    <RotateCcw size={16} /> Reiniciar Demonstrador
                  </button>
                </div>
              ) : (
                <form onSubmit={handleManualLogin}>
                  <div className="app-screen-title">Acesso à Conta</div>
                  
                  <div className="form-group">
                    <label className="form-label">Insira seu CPF ou CNPJ</label>
                    <input 
                      type="text" 
                      className={`form-input ${flashFields.cpf ? 'flash-vulnerable' : ''}`}
                      placeholder="000.000.000-00"
                      value={cpf}
                      onChange={e => setCpf(e.target.value)}
                      disabled={activeAttack || isSubmitting}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Data de nascimento</label>
                    <input 
                      type="text" 
                      className={`form-input ${flashFields.birthdate ? 'flash-vulnerable' : ''}`}
                      placeholder="DD/MM/AAAA"
                      value={birthdate}
                      onChange={e => setBirthdate(e.target.value)}
                      disabled={activeAttack || isSubmitting}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Primeiro nome da mãe</label>
                    <input 
                      type="text" 
                      className={`form-input ${flashFields.motherName ? 'flash-vulnerable' : ''}`}
                      placeholder="Ex: Maria"
                      value={motherName}
                      onChange={e => setMotherName(e.target.value)}
                      disabled={activeAttack || isSubmitting}
                    />
                  </div>

                  {errorMsg && (
                    <div style={{ color: 'var(--red-primary)', fontSize: '0.8rem', textAlign: 'left', marginBottom: '1rem', fontWeight: 500 }}>
                      ⚠️ {errorMsg}
                    </div>
                  )}

                  <button 
                    type="submit" 
                    className="form-button"
                    disabled={activeAttack || isSubmitting}
                  >
                    {isSubmitting ? 'Verificando...' : 'Entrar'}
                  </button>

                  <div className="info-banner vulneravel">
                    <strong>Falha de Design (A06:2025):</strong> CPF, data de nascimento e nome da mãe são dados conhecidos por terceiros e facilmente encontrados em vazamentos ou redes sociais. Não provam identidade — são segredos compartilháveis.
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Attacker perspective / logs */}
        <div className="simulation-panel-right">
          
          <div className="panel-title-section">
            <span className="panel-title">
              <Skull size={14} color="var(--red-primary)" /> PERSPECTIVA DO ATACANTE — OSINT + VAZAMENTO
            </span>
          </div>

          {/* Fictional SQL leak view */}
          <div className="terminal-window" style={{ height: '170px', marginBottom: '1rem' }}>
            <div className="terminal-header">
              <div className="terminal-buttons">
                <span className="terminal-btn close"></span>
                <span className="terminal-btn min"></span>
                <span className="terminal-btn max"></span>
              </div>
              <span className="terminal-title">vazamento_2024.sql — linha 1.847.332</span>
              <span></span>
            </div>
            <div className="terminal-body" style={{ backgroundColor: '#0f172a', padding: '0.75rem' }}>
              <table className="db-table">
                <tbody>
                  <tr>
                    <td>nome:</td>
                    <td>Joao Pedro Alves</td>
                  </tr>
                  <tr>
                    <td>cpf:</td>
                    <td>048.521.937-62</td>
                  </tr>
                  <tr>
                    <td>nascimento:</td>
                    <td>14/03/1991</td>
                  </tr>
                  <tr>
                    <td>mae_primeiro_nome:</td>
                    <td>Rosana</td>
                  </tr>
                  <tr>
                    <td>email:</td>
                    <td>j***@gmail.com</td>
                  </tr>
                  <tr>
                    <td>telefone:</td>
                    <td>(27) 9****-4821</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ textAlign: 'left', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 600 }}>
            Fontes onde esses dados aparecem publicamente:
          </div>
          
          <div className="badge-group">
            <span className="source-badge leak-danger">💀 Vazamento Serasa 2021</span>
            <span className="source-badge leak-danger">💀 Operação Pandemia</span>
            <span className="source-badge">👥 Facebook público</span>
            <span className="source-badge">🔍 Diário Oficial ES</span>
            <span className="source-badge">📋 IBGE Censo público</span>
          </div>

          {/* Action Attack controls */}
          <div className="attack-section-title">Executar Ataque Simulador</div>
          <div className="attack-cards-list">
            
            <div 
              className={`action-card danger ${activeAttack ? 'animate-pulse-slow' : ''}`}
              onClick={runLeakAttack}
              style={{ pointerEvents: activeAttack ? 'none' : 'auto', opacity: activeAttack && activeAttack !== 'leak' ? 0.5 : 1 }}
            >
              <div className="action-card-info">
                <Skull size={18} />
                <span><strong>Usar dados do vazamento</strong> — preencher e entrar</span>
              </div>
              <Play size={14} />
            </div>

            <div 
              className={`action-card danger ${activeAttack ? 'animate-pulse-slow' : ''}`}
              onClick={runOsintAttack}
              style={{ pointerEvents: activeAttack ? 'none' : 'auto', opacity: activeAttack && activeAttack !== 'osint' ? 0.5 : 1 }}
            >
              <div className="action-card-info">
                <Search size={18} />
                <span><strong>OSINT</strong> — minerar redes sociais e Diário Oficial</span>
              </div>
              <Play size={14} />
            </div>

            <div 
              className={`action-card danger ${activeAttack ? 'animate-pulse-slow' : ''}`}
              onClick={runBruteForce}
              style={{ pointerEvents: activeAttack ? 'none' : 'auto', opacity: activeAttack && activeAttack !== 'bruteforce' ? 0.5 : 1 }}
            >
              <div className="action-card-info">
                <Zap size={18} />
                <span><strong>Força bruta na data</strong> — testar datas sem bloqueio</span>
              </div>
              <Play size={14} />
            </div>

          </div>

          {/* Live Action Logs Terminal Console */}
          <div className="attack-section-title" style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <TermIcon size={14} /> Terminal de Logs de Execução
          </div>
          <div className="terminal-window" style={{ flex: 1, minHeight: '130px', margin: 0 }}>
            <div className="terminal-header">
              <span className="terminal-title">attacker_agent_shell.sh</span>
            </div>
            <div className="terminal-body" style={{ fontSize: '0.8rem' }}>
              {terminalLogs.map((log, idx) => (
                <div key={idx} className={`terminal-line ${log.type}`}>
                  {log.text}
                </div>
              ))}
              <div ref={terminalEndRef} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
