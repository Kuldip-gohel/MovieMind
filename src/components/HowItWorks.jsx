import React from 'react';
import { MessageSquareText, Cpu, CheckCircle2 } from 'lucide-react';

/**
 * HowItWorks Component
 * Reusable section from Part 1 Lab Exercise detailing the 3-step decision flow.
 */
export default function HowItWorks() {
  const steps = [
    {
      number: '1',
      icon: MessageSquareText,
      title: 'Tell us what you want',
      description: 'Describe your current situation naturally. Mention your mood, available time, preferred genre, who you are watching with, or any specific theme.'
    },
    {
      number: '2',
      icon: Cpu,
      title: 'MovieMind finds matches',
      description: 'Our AI recommendation engine processes your context, ranks suitable titles, and searches your personal universe for the optimal cinematic fit.'
    },
    {
      number: '3',
      icon: CheckCircle2,
      title: 'Make the right decision',
      description: 'Receive thoughtful suggestions with rationale, save titles to your watchlist with 1-click, or start tracking what you are currently watching.'
    }
  ];

  return (
    <section id="how-it-works" className="how-section">
      <div className="section-heading">
        <p className="section-label">HOW IT WORKS</p>
        <h2>
          From your situation <br />
          <span style={{ color: 'var(--accent-cyan-light)' }}>to your movie.</span>
        </h2>
        <div className="section-description">
          MovieMind understands what you need right now instead of simply relying on static history or basic tags.
        </div>
      </div>

      <div className="steps-grid">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div key={step.number} className="step-card">
              <div className="step-number-badge">
                <span>{step.number}</span>
              </div>
              <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                <Icon size={20} style={{ color: 'var(--accent-cyan)' }} />
                <h3>{step.title}</h3>
              </div>
              <p>{step.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
