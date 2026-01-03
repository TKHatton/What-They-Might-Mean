
export const COLORS = {
  PRIMARY_PURPLE: '#5B4A8F',
  SAGE_GREEN: '#8FAD9C',
  ACCENT_COLOR: '#D4A5A5', 
  LIGHT_PURPLE: '#C4B5D9',
  WHITE: '#FFFFFF',
  BLACK: '#000000',
  DARK_PURPLE: '#4A3A7A',
};

export const STRIPE_CONFIG = {
  PUBLISHABLE_KEY: 'pk_test_wtm_simulated_key',
  MODE: 'test',
};

export const SUBSCRIPTION_PRODUCTS = {
  PLUS_MONTHLY: { id: 'com.wtm.plus.monthly', price: '$4.99', period: 'month', label: 'Plus Monthly' },
  PLUS_YEARLY: { id: 'com.wtm.plus.yearly', price: '$49.99', period: 'year', label: 'Plus Yearly', savings: '17%' },
  PRO_MONTHLY: { id: 'com.wtm.pro.monthly', price: '$12.99', period: 'month', label: 'Pro Monthly' },
  PRO_YEARLY: { id: 'com.wtm.pro.yearly', price: '$129.99', period: 'year', label: 'Pro Yearly', savings: '17%' },
};

export const FREE_TIER_LIMIT = 5;

export const PRIVACY_POLICY = `
# Privacy Policy
Last Updated: October 2023

## 1. Data Collection
What They Meant (WTM) is designed with privacy in mind. We do not sell your data.
- **Local Storage**: Your analysis history is stored locally on your device.
- **AI Processing**: When you submit a message, image, or audio for analysis, it is processed via Google Gemini API. Please do not submit highly sensitive personal identification.
- **Usage Data**: We collect minimal, anonymized usage data to improve the app.

## 2. Third-Party Services
- **Google Cloud**: Used for AI decoding.
- **Stripe**: Handles payment processing. We do not store your credit card details.

## 3. Your Rights
You can clear your history and data at any time via the Settings menu.
`;

export const TERMS_OF_SERVICE = `
# Terms of Service
Last Updated: October 2023

## 1. Acceptance of Terms
By using WTM, you agree to these terms.

## 2. No Medical Advice
WTM is a social communication aid. It is NOT a substitute for professional mental health, medical, or legal advice. Decisions made based on WTM output are your own responsibility.

## 3. Subscriptions
- Payments are handled through your respective App Store (Apple/Google).
- Subscriptions auto-renew unless canceled 24 hours before the period ends.

## 4. Limitation of Liability
We provide WTM "as is" and are not liable for social, professional, or personal outcomes resulting from the use of our communication translations.
`;

export const LIBRARY_RESOURCES = [
  {
    title: "Understanding Indirect Communication",
    description: "Why people don't always say what they mean and how to decode subtext in messages.",
    link: "https://en.wikipedia.org/wiki/Indirect_speech",
    icon: "Brain"
  },
  {
    title: "Workplace Communication Styles",
    description: "Professional email etiquette, feedback language, and office politics decoded.",
    link: "https://www.themuse.com/advice/communication-styles-at-work",
    icon: "Briefcase"
  },
  {
    title: "Social Scripts & Responses",
    description: "Common social situations with example responses for different contexts and relationships.",
    link: "https://www.understood.org/en/articles/social-skills-helping-your-child-understand-social-cues",
    icon: "MessageCircle"
  },
  {
    title: "Tone Indicators Guide",
    description: "Understanding tone in text: sarcasm, sincerity, urgency markers, and digital communication.",
    link: "https://toneindicators.carrd.co/",
    icon: "Book"
  },
  {
    title: "Double Empathy Problem",
    description: "Research on communication gaps between neurodivergent and neurotypical people.",
    link: "https://www.frontiersin.org/articles/10.3389/fpsyg.2022.882177/full",
    icon: "Brain"
  },
  {
    title: "Autism & Communication",
    description: "Comprehensive guide to autistic communication styles and needs.",
    link: "https://www.autism.org.uk/advice-and-guidance/topics/communication",
    icon: "MessageCircle"
  },
  {
    title: "ADHD Social Skills",
    description: "How ADHD affects social interactions and strategies for improvement.",
    link: "https://chadd.org/for-adults/social-skills/",
    icon: "Brain"
  },
  {
    title: "Nonverbal Communication Guide",
    description: "Body language, facial expressions, and unspoken social cues explained.",
    link: "https://www.verywellmind.com/types-of-nonverbal-communication-2795397",
    icon: "Book"
  }
];

export const COACH_EXAMPLES = {
  WORK: [
    {
      prompt: "How do I ask my boss for time off?",
      icon: "💼",
      category: "Request"
    },
    {
      prompt: "My coworker said 'we should grab coffee sometime' - do they mean it?",
      icon: "💼",
      category: "Interpretation"
    },
    {
      prompt: "I got vague feedback at work. How do I ask for specifics?",
      icon: "💼",
      category: "Clarification"
    },
    {
      prompt: "How do I decline extra work without seeming lazy?",
      icon: "💼",
      category: "Boundaries"
    },
    {
      prompt: "My manager said 'no rush' on a task. When is it due?",
      icon: "💼",
      category: "Hidden Meaning"
    },
    {
      prompt: "How do I tell a client their idea won't work?",
      icon: "💼",
      category: "Difficult Conversation"
    }
  ],
  SCHOOL: [
    {
      prompt: "How do I ask my teacher to explain something again?",
      icon: "🎓",
      category: "Clarification"
    },
    {
      prompt: "My group partner isn't doing their part. What do I say?",
      icon: "🎓",
      category: "Conflict"
    },
    {
      prompt: "Someone asked to copy my homework. How do I say no?",
      icon: "🎓",
      category: "Boundaries"
    },
    {
      prompt: "The other students are talking about plans and didn't invite me. Should I ask?",
      icon: "🎓",
      category: "Social Anxiety"
    },
    {
      prompt: "My professor said 'see me after class' - am I in trouble?",
      icon: "🎓",
      category: "Interpretation"
    },
    {
      prompt: "How do I introduce myself in a new class?",
      icon: "🎓",
      category: "Social Skills"
    }
  ],
  SOCIAL: [
    {
      prompt: "My friend is upset with me but won't say why. What do I do?",
      icon: "👥",
      category: "Conflict Resolution"
    },
    {
      prompt: "How do I politely decline an invitation?",
      icon: "👥",
      category: "Boundaries"
    },
    {
      prompt: "Someone texted 'K' - are they mad at me?",
      icon: "👥",
      category: "Text Interpretation"
    },
    {
      prompt: "My friend group made plans without me. Should I say something?",
      icon: "👥",
      category: "Social Anxiety"
    },
    {
      prompt: "How do I tell someone I need space without hurting their feelings?",
      icon: "👥",
      category: "Boundaries"
    },
    {
      prompt: "What's the difference between 'let's hang out' and actual plans?",
      icon: "👥",
      category: "Hidden Meaning"
    }
  ]
};

export const SYSTEM_INSTRUCTION = `
You are the "Expectation Translator," a clarity and autonomy tool for neurodivergent individuals.

GOAL: Break down confusing messages into literal meanings, hidden expectations, risks, and social rules.

TERMINOLOGY GUIDELINES (STRICT ENFORCEMENT):
- SCHOOL Mode: Use "Assignment", "Rubric", "Task", "Instructor". NEVER use "Prompt" unless referring to a literal essay prompt.
- WORK Mode: Use "Request", "SOP", "Deadline", "Objective". 
- SOCIAL Mode: Use "Invitation", "Text", "Vibe", "Dynamic".

CLARITY SCORING (1-5 SCALE):
You must use the full range of the scale. Avoid always picking "3" (Medium).
- 1 (Crystal Clear): Rare. Only for explicit lists or direct "Yes/No" answers.
- 2 (Mostly Clear): For standard requests with slight politeness padding. (FAVOR THIS over 3).
- 3 (Moderate): For messages where literal words and intent match but timing or priority is vague.
- 4 (High Ambiguity): For "Corporate speak", passive-aggression, or heavily coded social hints. (FAVOR THIS over 3).
- 5 (Very Confusing): For total contradictions, complete silence/ghosting, or "Read between the lines" demands where failure is likely without help.

OUTPUT STRUCTURE (JSON format strictly):
{
  "whatWasSaid": "A brief literal summary.",
  "whatIsExpected": ["Concrete actions the sender likely expects."],
  "whatIsOptional": ["Things mentioned that aren't strictly required."],
  "whatCarriesRisk": ["Potential negative outcomes if specific actions aren't taken."],
  "whatIsNotAskingFor": ["Obligations the recipient might imagine but aren't there."],
  "hiddenRules": ["Social etiquette or professional norms involved."],
  "clarityScore": {
    "score": 1-5,
    "explanation": "Why this specific score was chosen."
  },
  "confidenceLevel": "High", "Medium", or "Low",
  "responses": [
    {
      "type": "Direct / Formal / Casual",
      "wording": "A proposed response text.",
      "toneDescription": "Tone profile.",
      "socialImpact": "What this response signals. (e.g., 'Confirms you are prioritizing the assignment'). AVOID the word 'prompt'.",
      "riskLevel": 1-5
    }
  ]
}

Always maintain a helpful, encouraging, and patient tone.
`;
