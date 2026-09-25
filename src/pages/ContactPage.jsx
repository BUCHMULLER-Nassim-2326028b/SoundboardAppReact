import './ContactPage.css';
import { Mail, ExternalLink, Heart, MessageCircle } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';

const links = [
  {
    id: 'youtube',
    label: 'YouTube',
    icon: '🎬',
    url: 'https://youtube.com/@Savun',
    color: '#FF0000',
  },
  {
    id: 'twitter',
    label: 'Twitter / X',
    icon: '𝕏',
    url: 'https://twitter.com/Savun',
    color: '#1DA1F2',
  },
  {
    id: 'discord',
    label: 'Discord',
    icon: '💬',
    url: 'https://discord.gg/savun',
    color: '#5865F2',
  },
  {
    id: 'tiktok',
    label: 'TikTok',
    icon: '🎵',
    url: 'https://tiktok.com/@Savun',
    color: '#00f2ea',
  },
];

export default function ContactPage() {
  return (
    <div className="page contact-page">
      <header className="page-header slide-up">
        <h1 className="page-title text-glow">Contact</h1>
      </header>

      {/* Social links */}
      <section className="contact-section slide-up slide-up-delay-1" aria-label="Réseaux sociaux">
        <h2 className="contact-section__title">
          <MessageCircle size={16} />
          Réseaux sociaux
        </h2>
        <div className="contact-links">
          {links.map((link) => (
            <GlassCard
              key={link.id}
              variant="interactive"
              cornerRadius={16}
              onClick={() => window.open(link.url, '_blank', 'noopener')}
            >
              <div className="contact-link" id={`contact-${link.id}`}>
                <span className="contact-link__icon" style={{ '--link-color': link.color }}>
                  {link.icon}
                </span>
                <span className="contact-link__label">{link.label}</span>
                <ExternalLink size={14} className="contact-link__arrow" />
              </div>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* Email */}
      <section className="contact-section slide-up slide-up-delay-2" aria-label="Email">
        <GlassCard variant="default" cornerRadius={18}>
          <div className="contact-email">
            <Mail size={20} />
            <div>
              <h3 className="contact-email__title">Nous contacter</h3>
              <p className="contact-email__desc">
                Une suggestion ? Un bug ? Écris-nous !
              </p>
            </div>
            <a
              href="mailto:contact@savun.app"
              className="contact-email__btn"
              id="contact-email-btn"
            >
              Envoyer un mail
            </a>
          </div>
        </GlassCard>
      </section>

      {/* Footer */}
      <footer className="contact-footer slide-up slide-up-delay-3">
        <p className="contact-footer__text">
          Application créée par <strong>nvssgoat</strong>
        </p>
        <p className="contact-footer__sub">
          Sons et répliques originales par <strong>Savun</strong>
        </p>
        <p className="contact-footer__copy">
          © {new Date().getFullYear()} SavunApp — Tous droits réservés
        </p>
      </footer>
    </div>
  );
}
