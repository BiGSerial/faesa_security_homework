import React, { useState, useEffect, useRef } from 'react';
import { Shield, ArrowLeft, RefreshCw, Key, ShieldCheck, Mail, ArrowRight, Trash2, Terminal as TermIcon, AlertTriangle } from 'lucide-react';

export default function SecureView({ onBack }) {
  // Navigation Steps
  const [step, setStep] = useState(1); // 1: Password, 2: OTP, 3: Success

  // Form States
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  
  // Security Simulation States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState(5);
  const [lockoutTime, setLockoutTime] = useState(0); // in seconds
  const [otpTimeLeft, setOtpTimeLeft] = useState(600); // 10 minutes in seconds
  const [errorMsg, setErrorMsg] = useState('');
  const [successBanner, setSuccessBanner] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  
  // Attack simulation states
  const [activeAttack, setActiveAttack] = useState(null); // null | 'bruteforce_password' | 'bruteforce_otp'
  const [terminalLogs, setTerminalLogs] = useState([
    { text: 'Servidor BancoBR inicializado. Firewall ativo.', type: 'green' },
    { text: 'Aguardando requisições na porta 443 (HTTPS)...', type: 'info' }
  ]);
  const [flashFields, setFlashFields] = useState({ cpf: false, password: false, otp: false });

  // CONSTANTS
  const DEMO_OTP = "583047";

  const terminalEndRef = useRef(null);
  const otpInputsRef = useRef([]);

  // Auto-scroll terminal
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [terminalLogs]);

  // Lockout countdown timer
  useEffect(() => {
    let timer;
    if (lockoutTime > 0) {
      setIsLocked(true);
      timer = setInterval(() => {
        setLockoutTime(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsLocked(false);
            setRemainingAttempts(5);
            addLog('[RATE LIMITER] Tempo esgotado. IP desbloqueado.', 'green');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [lockoutTime]);

  // OTP expiration countdown timer
  useEffect(() => {
    let timer;
    if (step === 2 && otpTimeLeft > 0) {
      timer = setInterval(() => {
        setOtpTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            addLog('[SERVIDOR] Token OTP expirado (TTL de 10 min atingido).', 'red');
            setErrorMsg('Código OTP expirado por inatividade. Faça login novamente.');
            setStep(1);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, otpTimeLeft]);

  const addLog = (text, type = 'info') => {
    setTerminalLogs(prev => [...prev, { text, type }]);
  };

  const clearLogs = () => {
    setTerminalLogs([]);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Step 1: Handle Login Submit (CPF + Password)
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (isLocked) return;

    if (!cpf || !password) {
      setErrorMsg('Preencha CPF e Senha.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('A senha deve conter pelo menos 6 caracteres.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessBanner('');
    
    addLog(`[SERVER] POST /api/login - CPF: ${cpf}`, 'info');
    addLog('[SERVER] Verificando políticas de Rate Limit para o IP 189.12.33.45...', 'info');

    setTimeout(() => {
      setIsSubmitting(false);
      
      // For demonstration, let's accept Joao Pedro's CPF or any CPF with password length >= 6
      // But verify password hash
      addLog('[SERVER] Resgatando Hash de senha bcrypt no Banco de Dados...', 'info');
      addLog('  - Hash encontrado: $2b$10$e7r/yXf... (bcrypt seguro)', 'cyan');
      addLog('[SERVER] Executando bcrypt.compare(password, hash)...', 'info');

      // Let's simulate a correct login
      addLog('[SERVER] Senha confere! Fator 1 verificado com sucesso.', 'green');
      addLog('[SERVER] Solicitando segundo fator (2FA)...', 'yellow');
      
      // CSPRNG OTP Generation
      addLog(`[SERVER] Gerando OTP de 6 dígitos via CSPRNG seguro...`, 'info');
      addLog(`[SERVER] OTP gerado: ${DEMO_OTP} (Expiração em 10 minutos, hash salvo em cache)`, 'green');
      
      addLog('[SERVER] Enviando OTP para e-mail verificado: j***@gmail.com', 'info');
      
      setStep(2);
      setOtpTimeLeft(600); // reset 10m
      setRemainingAttempts(5);
    }, 1200);
  };

  // Step 2: Handle OTP Verification
  const handleVerifyOtp = (e) => {
    if (e) e.preventDefault();
    const typedOtp = otpDigits.join('');
    
    if (typedOtp.length < 6) {
      setErrorMsg('Preencha todos os 6 dígitos.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    addLog(`[SERVER] POST /api/verify-otp - Tentando validar código: ${typedOtp}`, 'info');

    setTimeout(() => {
      setIsSubmitting(false);

      if (typedOtp === DEMO_OTP) {
        addLog('[SERVER] Sucesso: Código coincide com o hash do OTP gerado.', 'green');
        addLog('[SERVER] Invalidando token OTP imediatamente para evitar Replay Attack.', 'yellow');
        addLog('[SERVER] Autenticação multifator bem-sucedida!', 'green');
        addLog('[SERVER] Gerando JWT assinado criptograficamente...', 'green');
        setStep(3);
      } else {
        const nextAttempts = remainingAttempts - 1;
        setRemainingAttempts(nextAttempts);
        addLog(`[SERVER] ERRO: Código incorreto. Tentativas restantes para este token: ${nextAttempts}/5`, 'red');
        
        if (nextAttempts <= 0) {
          addLog('[SERVER] ALERTA DE SEGURANÇA: Limite de tentativas de OTP excedido!', 'red');
          addLog('[SERVER] Token OTP revogado permanentemente. Sessão de login destruída.', 'red');
          setErrorMsg('Token OTP revogado por excesso de erros. Refaça o login.');
          setStep(1);
          setCpf('');
          setPassword('');
          setOtpDigits(['', '', '', '', '', '']);
        } else {
          setErrorMsg(`Código OTP inválido. Você tem mais ${nextAttempts} tentativa(s).`);
          setOtpDigits(['', '', '', '', '', '']);
          if (otpInputsRef.current[0]) otpInputsRef.current[0].focus();
        }
      }
    }, 1000);
  };

  // OTP Input controls (focus shifting & pasting)
  const handleOtpChange = (index, value) => {
    const val = value.replace(/\D/g, ''); // keep digits only
    if (!val) {
      const newDigits = [...otpDigits];
      newDigits[index] = '';
      setOtpDigits(newDigits);
      return;
    }

    const lastChar = val.substring(val.length - 1);
    const newDigits = [...otpDigits];
    newDigits[index] = lastChar;
    setOtpDigits(newDigits);

    // Auto-focus next input
    if (index < 5 && otpInputsRef.current[index + 1]) {
      otpInputsRef.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otpDigits[index] && index > 0 && otpInputsRef.current[index - 1]) {
        otpInputsRef.current[index - 1].focus();
        const newDigits = [...otpDigits];
        newDigits[index - 1] = '';
        setOtpDigits(newDigits);
      } else if (otpDigits[index]) {
        const newDigits = [...otpDigits];
        newDigits[index] = '';
        setOtpDigits(newDigits);
      }
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').substring(0, 6);
    if (!pastedData) return;

    const newDigits = [...otpDigits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pastedData[i] || '';
    }
    setOtpDigits(newDigits);

    // Focus last filled box or verify
    const focusIdx = Math.min(pastedData.length - 1, 5);
    if (otpInputsRef.current[focusIdx]) {
      otpInputsRef.current[focusIdx].focus();
    }

    // Auto-trigger verification if a full 6-digit OTP is pasted
    if (pastedData.length === 6) {
      setIsSubmitting(true);
      setErrorMsg('');
      addLog(`[SERVER] POST /api/verify-otp - Validando código colado: ${pastedData}`, 'info');

      setTimeout(() => {
        setIsSubmitting(false);
        if (pastedData === DEMO_OTP) {
          addLog('[SERVER] Sucesso: Código coincide com o hash do OTP gerado.', 'green');
          addLog('[SERVER] Invalidando token OTP imediatamente para evitar Replay Attack.', 'yellow');
          addLog('[SERVER] Autenticação multifator bem-sucedida!', 'green');
          addLog('[SERVER] Gerando JWT assinado criptograficamente...', 'green');
          setStep(3);
        } else {
          const nextAttempts = remainingAttempts - 1;
          setRemainingAttempts(nextAttempts);
          addLog(`[SERVER] ERRO: Código incorreto. Tentativas restantes para este token: ${nextAttempts}/5`, 'red');
          if (nextAttempts <= 0) {
            addLog('[SERVER] ALERTA DE SEGURANÇA: Limite de tentativas de OTP excedido!', 'red');
            addLog('[SERVER] Token OTP revogado permanentemente. Sessão de login destruída.', 'red');
            setErrorMsg('Token OTP revogado por excesso de erros. Refaça o login.');
            setStep(1);
            setCpf('');
            setPassword('');
            setOtpDigits(['', '', '', '', '', '']);
          } else {
            setErrorMsg(`Código OTP inválido. Você tem mais ${nextAttempts} tentativa(s).`);
            setOtpDigits(['', '', '', '', '', '']);
            if (otpInputsRef.current[0]) otpInputsRef.current[0].focus();
          }
        }
      }, 1000);
    }
  };

  // Attack Sim 1: Use leaked details (Nasc/Mãe)
  const runLeakedDetailsOnSecure = async () => {
    if (activeAttack || step !== 1 || isLocked) return;
    setActiveAttack('bruteforce_password');
    clearLogs();
    setCpf('');
    setPassword('');
    setErrorMsg('');

    addLog('>> Simulando envio de dados públicos do vazamento...', 'yellow');
    await new Promise(r => setTimeout(r, 600));

    addLog('[CLIENTE] Tentando enviar CPF + Nascimento + Mãe para a rota de login...', 'info');
    await new Promise(r => setTimeout(r, 800));

    addLog('[SERVER] POST /api/login - Payload recebido com campos adicionais.', 'yellow');
    addLog('[SERVER] VERIFICAÇÃO REJEITADA: Campos "nascimento" e "nome_mae" foram desativados no backend.', 'red');
    addLog('[SERVER] MOTIVO: Em conformidade com NIST SP 800-63b, segredos públicos não são fatores válidos de autenticação.', 'red');
    addLog('[SERVER] RETORNO: 400 Bad Request - Senha Secreta é Obrigatória.', 'red');

    setErrorMsg('Acesso negado. Senha secreta é necessária.');
    setActiveAttack(null);
  };

  // Attack Sim 2: Brute force password (Rate limiting trigger)
  const runPasswordBruteForce = async () => {
    if (activeAttack || step !== 1 || isLocked) return;
    setActiveAttack('bruteforce_password');
    clearLogs();
    setCpf('048.521.937-62');
    setPassword('');
    setErrorMsg('');

    addLog('>> Iniciando Ataque de Força Bruta na Senha...', 'yellow');
    await new Promise(r => setTimeout(r, 600));
    addLog('[ATACANTE] Alvo: 048.521.937-62 (CPF vazado). Testando senhas comuns...', 'info');
    await new Promise(r => setTimeout(r, 600));

    const badPasswords = ['123456', 'senha123', 'admin', 'bancobr12', 'joaopedro'];
    
    for (let i = 0; i < badPasswords.length; i++) {
      const attemptNum = i + 1;
      const pass = badPasswords[i];
      
      addLog(`[ATACANTE] Tentativa #${attemptNum}: Senha "${pass}"`, 'yellow');
      setFlashFields(f => ({ ...f, password: true }));
      setPassword(pass);
      await new Promise(r => setTimeout(r, 400));
      setFlashFields(f => ({ ...f, password: false }));

      addLog(`[SERVER] POST /api/login - Validando login para CPF: 048.521.937-62`, 'info');
      addLog(`[SERVER] Hash verificado. Senha INCORRETA. Erros acumulados: ${attemptNum}/5`, 'red');
      
      if (attemptNum === 5) {
        addLog('[SERVER] ALERTA DE SEGURANÇA: Limite de erros (5) atingido para este IP/CPF.', 'red');
        addLog('[SERVER] RATE LIMITER ATIVADO: Bloqueando requisições do IP 189.12.33.45 por 15 minutos.', 'red');
        
        setErrorMsg('IP Bloqueado. Excesso de tentativas de login incorretas. Tente novamente em 15 minutos.');
        setLockoutTime(900); // 15 minutes
        setIsLocked(true);
      } else {
        setErrorMsg(`Senha incorreta. Tentativas restantes: ${5 - attemptNum}/5`);
      }
      
      await new Promise(r => setTimeout(r, 600));
    }

    setActiveAttack(null);
  };

  // Attack Sim 3: Brute force OTP in Step 2
  const runOtpBruteForce = async () => {
    if (activeAttack || step !== 2) return;
    setActiveAttack('bruteforce_otp');
    setErrorMsg('');

    addLog('>> Iniciando Força Bruta no OTP de 6 dígitos (2FA)...', 'yellow');
    await new Promise(r => setTimeout(r, 600));
    addLog('[ATACANTE] Alvo logado (CPF/Senha). Tentando adivinhar token OTP por palpites...', 'info');
    await new Promise(r => setTimeout(r, 600));

    const guesses = ['102938', '998811', '554321', '009238', '772183'];
    
    for (let i = 0; i < guesses.length; i++) {
      const attemptNum = i + 1;
      const guess = guesses[i];
      const digits = guess.split('');
      
      addLog(`[ATACANTE] Enviando palpite OTP #${attemptNum}: ${guess}`, 'yellow');
      setFlashFields(f => ({ ...f, otp: true }));
      setOtpDigits(digits);
      await new Promise(r => setTimeout(r, 400));
      setFlashFields(f => ({ ...f, otp: false }));

      addLog(`[SERVER] POST /api/verify-otp - Validando código para CPF: 048.521.937-62`, 'info');
      
      const remaining = 5 - attemptNum;
      setRemainingAttempts(remaining);
      addLog(`[SERVER] Código incorreto. Tentativas restantes para este token: ${remaining}/5`, 'red');
      
      if (remaining === 0) {
        addLog('[SERVER] CRÍTICO: Limite de erros no OTP excedido!', 'red');
        addLog('[SERVER] AÇÃO: Token OTP revogado imediatamente.', 'red');
        addLog('[SERVER] AÇÃO: Sessão pendente encerrada. Usuário deve refazer login inicial.', 'red');
        
        setErrorMsg('Token OTP revogado devido a excesso de erros. Refaça o login.');
        setStep(1);
        setCpf('');
        setPassword('');
        setOtpDigits(['', '', '', '', '', '']);
      } else {
        setErrorMsg(`Código OTP incorreto. Restam ${remaining} tentativas.`);
      }
      
      await new Promise(r => setTimeout(r, 800));
    }

    setActiveAttack(null);
  };

  const resetAll = () => {
    setStep(1);
    setCpf('');
    setPassword('');
    setOtpDigits(['', '', '', '', '', '']);
    setRemainingAttempts(5);
    setLockoutTime(0);
    setIsLocked(false);
    setErrorMsg('');
    setSuccessBanner('');
    setActiveAttack(null);
    setTerminalLogs([
      { text: 'Servidor BancoBR inicializado. Firewall ativo.', type: 'green' },
      { text: 'Aguardando requisições na porta 443 (HTTPS)...', type: 'info' }
    ]);
  };

  return (
    <div className="simulation-layout scale-in">
      
      {/* Simulation Top Bar */}
      <div className="top-nav-bar">
        <button className="back-to-menu-btn" onClick={onBack}>
          <ArrowLeft size={16} /> Voltar ao Menu Principal
        </button>
        <span className="owasp-tag" style={{ margin: 0, padding: '0.2rem 0.8rem', fontSize: '0.75rem', backgroundColor: '#dcfce7', color: '#166534', borderColor: '#dcfce7' }}>
          Design Seguro - 2FA & Rate Limiting
        </span>
      </div>

      <div className="simulation-top-bar seguro">
        Versão Segura — CPF + Senha Real + OTP — Sem Segredos Compartilháveis
      </div>

      {/* Workspace */}
      <div className="simulation-workspace">
        
        {/* Left Side: Secure Banking App */}
        <div className="simulation-panel-left">
          <div className="app-screen-container">
            <div className="bank-header-secure">
              <div className="bank-logo">
                <span className="brand">BancoBR</span>
                <span className="sub">Internet Banking</span>
              </div>
              <Shield size={24} color="#a7f3d0" />
            </div>

            <div className="app-screen-content">
              {/* Step indicator */}
              <div className="step-wizard">
                <span className={`step-item ${step === 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
                  <span className="step-num">1</span> CPF + Senha
                </span>
                <span className="step-arrow">›</span>
                <span className={`step-item ${step === 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
                  <span className="step-num">2</span> Código OTP
                </span>
                <span className="step-arrow">›</span>
                <span className={`step-item ${step === 3 ? 'active' : ''}`}>
                  <span className="step-num">3</span> Acesso
                </span>
              </div>

              {/* Step 1: CPF + Senha */}
              {step === 1 && (
                <form onSubmit={handleLoginSubmit} className="scale-in">
                  
                  <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', borderRadius: '0.5rem', padding: '0.65rem 1rem', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                    <span style={{ display: 'inline-block', width: '6px', height: '6px', backgroundColor: '#22c55e', borderRadius: '9999px' }}></span>
                    Rate limiting: máx. 5 tentativas / 15 min por IP
                  </div>

                  <div className="form-group">
                    <label className="form-label">Insira seu CPF ou CNPJ</label>
                    <input 
                      type="text" 
                      className={`form-input ${flashFields.cpf ? 'flash-secure' : ''}`}
                      placeholder="000.000.000-00"
                      value={cpf}
                      onChange={e => setCpf(e.target.value)}
                      disabled={activeAttack || isSubmitting || isLocked}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Senha</label>
                    <input 
                      type="password" 
                      className={`form-input ${flashFields.password ? 'flash-secure' : ''}`}
                      placeholder="Sua senha bancária"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      disabled={activeAttack || isSubmitting || isLocked}
                    />
                  </div>

                  {errorMsg && (
                    <div style={{ color: 'var(--red-primary)', fontSize: '0.8rem', textAlign: 'left', marginBottom: '1rem', fontWeight: 500 }}>
                      ⚠️ {errorMsg}
                    </div>
                  )}

                  {isLocked ? (
                    <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5', padding: '0.75rem', borderRadius: '0.5rem', fontSize: '0.8rem', textAlign: 'center', fontWeight: 600, marginBottom: '1rem' }}>
                      IP BLOQUEADO: Tente novamente em {formatTime(lockoutTime)}
                    </div>
                  ) : null}

                  <button 
                    type="submit" 
                    className="form-button btn-success"
                    disabled={activeAttack || isSubmitting || isLocked}
                  >
                    {isSubmitting ? 'Criptografando hash...' : 'Entrar'}
                  </button>

                  <div className="info-banner seguro">
                    <strong>Design seguro:</strong> A autenticação exige uma senha que só o titular conhece — não dados públicos. Combinada com OTP, forma um 2FA real. Sem data de nascimento, sem nome de mãe.
                  </div>
                </form>
              )}

              {/* Step 2: Código OTP */}
              {step === 2 && (
                <div className="scale-in">
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0.5rem 0' }}>
                    <div style={{ width: '3.5rem', height: '3.5rem', borderRadius: '9999px', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1d4ed8', marginBottom: '1rem' }}>
                      <Mail size={24} />
                    </div>
                    <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1.1rem', fontWeight: 700 }}>Código enviado</h4>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center', lineHeight: 1.4 }}>
                      Enviamos um código de 6 dígitos para <strong style={{ color: '#334155' }}>j***@gmail.com</strong>.<br/>
                      Válido por 10 minutos · Uso único
                    </p>
                  </div>

                  <div className="otp-timer" style={{ marginTop: '0.75rem' }}>
                    Código expira em: <span>{formatTime(otpTimeLeft)}</span>
                  </div>

                  <div className="otp-input-container">
                    {otpDigits.map((digit, idx) => (
                      <input 
                        key={idx}
                        type="text"
                        maxLength="2"
                        ref={el => otpInputsRef.current[idx] = el}
                        className={`otp-box ${flashFields.otp ? 'flash-secure' : ''}`}
                        value={digit}
                        onChange={e => handleOtpChange(idx, e.target.value)}
                        onKeyDown={e => handleOtpKeyDown(idx, e)}
                        onPaste={handleOtpPaste}
                        onFocus={e => e.target.select()}
                        disabled={activeAttack || isSubmitting}
                      />
                    ))}
                  </div>

                  <div className="otp-attempts">
                    Tentativas restantes: <span>{remainingAttempts}/5</span>
                  </div>

                  {errorMsg && (
                    <div style={{ color: 'var(--red-primary)', fontSize: '0.8rem', textAlign: 'center', marginBottom: '1rem', fontWeight: 500 }}>
                      ⚠️ {errorMsg}
                    </div>
                  )}

                  <button 
                    onClick={() => handleVerifyOtp()}
                    className="form-button btn-success"
                    disabled={activeAttack || isSubmitting}
                    style={{ margin: '0.5rem 0' }}
                  >
                    {isSubmitting ? 'Validando token...' : 'Verificar código'}
                  </button>

                  <button 
                    onClick={() => {
                      setStep(1);
                      setErrorMsg('');
                    }}
                    className="form-button"
                    disabled={activeAttack || isSubmitting}
                    style={{ background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', marginTop: 0 }}
                  >
                    ← Voltar
                  </button>

                  <div className="info-banner seguro" style={{ margin: '1rem 0' }}>
                    <strong>Token OTP:</strong> Gerado com CSPRNG, armazenado como hash, TTL de 10 min, invalidado após o primeiro uso. Após 5 erros, token revogado automaticamente.
                  </div>

                  <div style={{ backgroundColor: '#e2f8e9', color: '#166534', border: '1px dashed #22c55e', padding: '0.5rem', borderRadius: '0.35rem', fontSize: '0.8rem', fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                    <span>Código OTP para demo:</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', letterSpacing: '1px' }}>{DEMO_OTP}</span>
                  </div>
                </div>
              )}

              {/* Step 3: Success Screen */}
              {step === 3 && (
                <div className="success-screen scale-in">
                  <div className="success-icon-container">
                    <ShieldCheck size={40} />
                  </div>
                  <h3 className="success-title">Acesso autorizado!</h3>
                  <p className="success-subtitle" style={{ fontSize: '0.85rem' }}>
                    Identidade verificada por dois fatores: senha + OTP por canal seguro.
                  </p>
                  
                  <div style={{ backgroundColor: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4, textAlign: 'left', marginBottom: '1.5rem' }}>
                    Em nenhum momento o sistema perguntou data de nascimento ou nome da mãe — dados que terceiros podem conhecer.
                  </div>

                  <div className="info-banner seguro" style={{ width: '100%', boxSizing: 'border-box', marginBottom: '1.5rem' }}>
                    <strong>2FA completo:</strong> Algo que você sabe (senha) + algo que você tem (dispositivo com acesso ao e-mail/SMS). Impossível de replicar apenas com dados de vazamentos.
                  </div>

                  <button 
                    className="form-button"
                    onClick={resetAll}
                    style={{ background: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                  >
                    <RefreshCw size={16} /> Reiniciar demonstração
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Security analysis & Logs */}
        <div className="simulation-panel-right">
          
          <div className="panel-title-section">
            <span className="panel-title" style={{ color: 'var(--green-primary)' }}>
              <Shield size={14} color="var(--green-primary)" /> DESIGN SEGURO — POR QUE FUNCIONA
            </span>
          </div>

          <div className="explanation-list">
            
            <div className="explanation-item">
              <div className="explanation-number">1</div>
              <div className="explanation-content">
                <h4>CPF + Senha (fator 1)</h4>
                <p>
                  Senha conhecida apenas pelo titular. Não aparece em vazamentos públicos, pois é criptografada com salt individual e hash <strong>bcrypt</strong> no servidor.
                </p>
                <span className="source-badge" style={{ display: 'inline-block', backgroundColor: '#e2f8e9', color: '#166534', borderColor: '#bbf7d0', fontSize: '0.7rem' }}>
                  rate limited — 5 tent. / 15min
                </span>
              </div>
            </div>

            <div className="explanation-item">
              <div className="explanation-number">2</div>
              <div className="explanation-content">
                <h4>OTP por canal verificado (fator 2)</h4>
                <p>
                  Código temporário enviado ao e-mail cadastrado. Apenas quem possui acesso à caixa de correio/dispositivo consegue receber.
                </p>
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  <span className="source-badge" style={{ fontSize: '0.7rem' }}>CSPRNG</span>
                  <span className="source-badge" style={{ fontSize: '0.7rem' }}>TTL 10min</span>
                  <span className="source-badge" style={{ fontSize: '0.7rem' }}>uso único</span>
                </div>
              </div>
            </div>

            <div className="explanation-item">
              <div className="explanation-number">3</div>
              <div className="explanation-content">
                <h4>Token revogado + sessão segura</h4>
                <p>
                  OTP é invalidado imediatamente após a primeira verificação. A sessão é protegida por um token JWT assinado criptograficamente.
                </p>
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  <span className="source-badge" style={{ fontSize: '0.7rem' }}>single use</span>
                  <span className="source-badge" style={{ fontSize: '0.7rem' }}>session revocation</span>
                </div>
              </div>
            </div>

          </div>

          {/* Table comparing Vulnerable vs Secure results */}
          <div className="results-matrix-card">
            <div className="results-matrix-title">Ataques do Sistema Vulnerável — Resultado Aqui</div>
            <table className="results-table">
              <thead>
                <tr>
                  <th>Ataque</th>
                  <th>Comportamento Seguro</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="attack-name">Usar dados de vazamento (CPF+nasc+mãe)</td>
                  <td className="status-ok">✓ Irrelevante — precisa da senha secreta</td>
                </tr>
                <tr>
                  <td className="attack-name">OSINT (Redes Sociais, Editais)</td>
                  <td className="status-ok">✓ Irrelevante — precisa da senha secreta</td>
                </tr>
                <tr>
                  <td className="attack-name">Força bruta na data de nascimento</td>
                  <td className="status-ok">✓ Campo removido do fluxo de login</td>
                </tr>
                <tr>
                  <td className="attack-name">Senha correta, sem OTP</td>
                  <td className="status-ok">✓ Bloqueado — 2FA obrigatório</td>
                </tr>
                <tr>
                  <td className="attack-name">Força bruta no OTP</td>
                  <td className="status-ok">✓ Revogado após 5 tentativas de erro</td>
                </tr>
                <tr>
                  <td className="attack-name">OTP interceptado e reutilizado</td>
                  <td className="status-ok">✓ Uso único — já invalidado na primeira tentativa</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Action Simulation controllers */}
          <div className="attack-section-title">Testar Ataques no Design Seguro</div>
          <div className="attack-cards-list" style={{ marginBottom: '1.5rem' }}>
            
            <div 
              className="action-card secure-test"
              onClick={runLeakedDetailsOnSecure}
              style={{ pointerEvents: activeAttack ? 'none' : 'auto', opacity: activeAttack || step !== 1 ? 0.5 : 1 }}
            >
              <div className="action-card-info">
                <Trash2 size={16} />
                <span>Testar Dados Vazados (CPF + Nasc + Mãe)</span>
              </div>
              <ArrowRight size={14} />
            </div>

            <div 
              className="action-card secure-test"
              onClick={runPasswordBruteForce}
              style={{ pointerEvents: activeAttack ? 'none' : 'auto', opacity: activeAttack || step !== 1 || isLocked ? 0.5 : 1 }}
            >
              <div className="action-card-info">
                <AlertTriangle size={16} />
                <span>Simular Força Bruta na Senha (Rate Limiting)</span>
              </div>
              <ArrowRight size={14} />
            </div>

            <div 
              className="action-card secure-test"
              onClick={runOtpBruteForce}
              style={{ pointerEvents: activeAttack ? 'none' : 'auto', opacity: activeAttack || step !== 2 ? 0.5 : 1 }}
            >
              <div className="action-card-info">
                <Key size={16} />
                <span>Simular Força Bruta no OTP (Rate Limiting 2FA)</span>
              </div>
              <ArrowRight size={14} />
            </div>

          </div>

          {/* Server Backend Live Logs */}
          <div className="attack-section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <TermIcon size={14} /> Log do Servidor de Autenticação (BancoBR Backend)
          </div>
          <div className="terminal-window" style={{ flex: 1, minHeight: '130px', margin: 0 }}>
            <div className="terminal-header">
              <span className="terminal-title">auth_backend_logs.log</span>
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

          <div className="nist-block" style={{ marginTop: '1.5rem', marginBottom: 0, padding: '0.75rem 1.25rem', fontSize: '0.8rem', maxWidth: 'none' }}>
            <strong>NIST SP 800-63b</strong> — Autenticação multifator recomendada: algo que você sabe (senha) + algo que você tem (OTP por canal verificado). Data de nascimento e nome da mãe NÃO são fatores de autenticação aceitáveis — são dados públicos.
          </div>

        </div>

      </div>

    </div>
  );
}
