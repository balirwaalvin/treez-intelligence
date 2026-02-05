import React from 'react';
import { X, Check, Sparkles, Zap, Crown } from 'lucide-react';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const plans = [
    {
      name: 'TREEZ AI Standard',
      price: 'Free',
      period: 'Forever',
      description: 'Essential tools for casual exploration.',
      features: [
        'Access to standard models',
        'Basic image generation (5/day)',
        'Standard response speed',
        'Community support'
      ],
      icon: Sparkles,
      color: 'from-blue-400 to-blue-600',
      buttonVariant: 'secondary'
    },
    {
      name: 'TREEZ AI Premium',
      price: 'UGX 50,000',
      period: '/ month',
      description: 'Power up your creativity with advanced features.',
      features: [
        'Access to advanced models',
        'Unlimited image generation',
        'Fast response speed',
        'Priority support',
        'Early access to new features'
      ],
      icon: Zap,
      color: 'from-treez-accent to-purple-600',
      popular: true,
      buttonVariant: 'primary'
    },
    {
      name: 'TREEZ AI Premium Plus',
      price: 'UGX 100,000',
      period: '/ month',
      description: 'The ultimate experience for power users.',
      features: [
        'Access to most capable models',
        'High-definition image generation',
        'Ultra-fast response speed',
        '24/7 Priority support',
        'API Access',
        'Custom model fine-tuning'
      ],
      icon: Crown,
      color: 'from-yellow-400 to-orange-500',
      buttonVariant: 'secondary'
    }
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-[#0a0a16] border border-white/10 rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-up">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors z-10"
        >
          <X size={24} />
        </button>

        <div className="p-8 md:p-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-4">
              Unlock the Full Potential of Treez
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Choose the plan that fits your needs and start creating without limits.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan, idx) => (
              <div 
                key={idx}
                className={`relative rounded-2xl p-6 flex flex-col h-full border transition-all duration-300 ${
                  plan.popular 
                    ? 'bg-[#13132b] border-treez-accent/50 shadow-[0_0_30px_rgba(0,242,255,0.1)] scale-105 z-10' 
                    : 'bg-[#0f0f1f] border-white/5 hover:border-white/10 hover:bg-[#151525]'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-treez-accent to-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
                    Most Popular
                  </div>
                )}

                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-6 shadow-lg`}>
                  <plan.icon className="text-white" size={24} />
                </div>

                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-gray-400 text-sm mb-6 min-h-[40px]">{plan.description}</p>

                <div className="mb-8">
                  <span className="text-3xl font-bold text-white">{plan.price}</span>
                  <span className="text-gray-500 text-sm ml-1">{plan.period}</span>
                </div>

                <ul className="space-y-4 mb-8 flex-1">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                      <Check size={16} className={`shrink-0 mt-0.5 ${plan.popular ? 'text-treez-accent' : 'text-gray-500'}`} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button 
                  className={`w-full py-3 px-6 rounded-xl font-semibold transition-all shadow-lg ${
                    plan.buttonVariant === 'primary'
                      ? 'bg-gradient-to-r from-treez-accent to-purple-600 text-white hover:opacity-90 hover:shadow-treez-accent/25'
                      : 'bg-white/10 text-white hover:bg-white/20 hover:text-white border border-white/5'
                  }`}
                >
                  {plan.price === 'Free' ? 'Current Plan' : 'Upgrade Now'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
