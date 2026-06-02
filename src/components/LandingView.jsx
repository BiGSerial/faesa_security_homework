import React from 'react';
import { Skull, Shield } from 'lucide-react';

export default function LandingView({ onSelectView }) {
  return (
    <div className="landing-view scale-in">
      <div className="owasp-tag">
        ● OWASP Top 10:2025 — A06 Insecure Design — Cenário #1
      </div>
      
      <h1 className="main-title">
        Autenticação <span>Bancária</span>
      </h1>
      
      <p className="main-subtitle">
        CPF + data de nascimento + nome da mãe não provam identidade — são dados públicos. 
        Veja o ataque e a solução.
      </p>
      
      <div className="cards-container">
        <div 
          className="landing-card vulneravel" 
          onClick={() => onSelectView('vulnerable')}
        >
          <div className="card-icon-container">
            <Skull color="#ef4444" size={40} />
          </div>
          <div className="card-badge">Vulnerável</div>
          <h3 className="card-title">CPF + Nascimento + Mãe</h3>
          <p className="card-text">
            Todos os dados obtíveis por vazamento de dados ou OSINT. Sem senha real, sem OTP.
          </p>
        </div>
        
        <div 
          className="landing-card seguro" 
          onClick={() => onSelectView('secure')}
        >
          <div className="card-icon-container">
            <Shield color="#22c55e" size={40} />
          </div>
          <div className="card-badge">Seguro</div>
          <h3 className="card-title">CPF + Senha + OTP</h3>
          <p className="card-text">
            Autenticação 2FA real. Dados de vazamento são irrelevantes sem a senha e o dispositivo.
          </p>
        </div>
      </div>
      
      <div className="nist-block">
        <strong>NIST SP 800-63b</strong> — Data de nascimento e nome da mãe <strong>não são fatores de autenticação aceitáveis</strong>. 
        São informações que mais de uma pessoa pode conhecer e não provam identidade.
      </div>
      
      <footer className="landing-footer">
        FAESA — Segurança e Auditoria de Sistemas · 2026/1
      </footer>
    </div>
  );
}
