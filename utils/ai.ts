// AI utilities for Seventh Sense AI Coach
// Provides on-device motivation templates and a pluggable provider interface

export interface MotivationContext {
  name: string;
  habitName: string;
  streak: number;
  last3Outcomes: boolean[];
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  aiTone: 'coach' | 'friend' | 'zen';
}

export interface AIMessage {
  text: string;
  timestamp: number;
  context: MotivationContext;
}

/**
 * Build motivation prompt based on context
 */
export function buildMotivationPrompt(context: MotivationContext): string {
  const { name, habitName, streak, last3Outcomes, timeOfDay, aiTone } = context;
  
  let basePrompt = `Generate a short, motivational message for ${name} about their habit "${habitName}". `;
  
  if (streak > 0) {
    basePrompt += `They're on a ${streak}-day streak. `;
  }
  
  if (last3Outcomes.length > 0) {
    const recentSuccess = last3Outcomes.filter(Boolean).length;
    if (recentSuccess === last3Outcomes.length) {
      basePrompt += `They've been consistent recently. `;
    } else if (recentSuccess === 0) {
      basePrompt += `They've been struggling recently. `;
    } else {
      basePrompt += `They've had mixed results recently. `;
    }
  }
  
  basePrompt += `It's ${timeOfDay}. Tone: ${aiTone}. Keep it under 2 sentences.`;
  
  return basePrompt;
}

/**
 * Get motivation message using on-device templates
 */
export async function getMotivation(context: MotivationContext): Promise<string> {
  // Simulate async behavior for future API integration
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const { name, habitName, streak, last3Outcomes, timeOfDay, aiTone } = context;
  
  // On-device templates based on context
  const templates = {
    coach: {
      highStreak: [
        `${streak} days strong! You're building momentum. Keep this habit as your anchor.`,
        `Impressive ${streak}-day streak! You're proving consistency beats perfection.`,
        `${streak} consecutive days! You're creating a new normal. Stay the course.`
      ],
      lowStreak: [
        `Every streak starts with day one. Let's make today count.`,
        `Small steps, big changes. Today is your fresh start.`,
        `You've got this. Focus on today, not yesterday's missed opportunities.`
      ],
      struggling: [
        `Progress isn't linear. What's one small thing you can do right now?`,
        `Setbacks happen. The key is getting back up. You're stronger than you think.`,
        `Remember why you started. Every attempt builds resilience.`
      ]
    },
    friend: {
      highStreak: [
        `Wow, ${streak} days! You're absolutely crushing it! 🎉`,
        `${streak} days in a row? You're on fire! Keep it up!`,
        `Look at you go! ${streak} days strong - you're unstoppable!`
      ],
      lowStreak: [
        `Hey, we all start somewhere! Today's a new day.`,
        `Don't worry about the past - let's focus on today together!`,
        `You've got this! I believe in you. 💪`
      ],
      struggling: [
        `It's okay to have off days. Tomorrow's a fresh start!`,
        `You're doing great, even if it doesn't feel like it right now.`,
        `Remember, progress isn't always visible. You're growing stronger!`
      ]
    },
    zen: {
      highStreak: [
        `${streak} days of mindful practice. You're cultivating presence.`,
        `Your consistency reflects inner discipline. Peace comes from small, daily choices.`,
        `${streak} days of gentle commitment. You're finding your rhythm.`
      ],
      lowStreak: [
        `Each moment is a new beginning. Breathe and start fresh.`,
        `Peace comes from accepting where you are and moving forward gently.`,
        `Mindfulness is a practice, not perfection. Begin again.`
      ],
      struggling: [
        `In stillness, find your strength. Every breath is a new opportunity.`,
        `Embrace the journey, including its challenges. Growth happens in the valleys too.`,
        `Be gentle with yourself. Progress is measured in awareness, not just actions.`
      ]
    }
  };
  
  // Determine template category
  let category = 'lowStreak';
  if (streak >= 7) {
    category = 'highStreak';
  } else if (streak >= 3) {
    category = 'lowStreak';
  }
  
  // Check if struggling recently
  if (last3Outcomes.length > 0 && last3Outcomes.filter(Boolean).length === 0) {
    category = 'struggling';
  }
  
  // Get appropriate template array
  const templateArray = templates[aiTone][category];
  
  // Select random template
  const randomIndex = Math.floor(Math.random() * templateArray.length);
  let message = templateArray[randomIndex];
  
  // Personalize with habit-specific tips
  const habitTips = {
    'Water': [
      'Keep a bottle visible - out of sight, out of mind.',
      'Set phone reminders or use a habit tracker app.',
      'Drink before each meal or activity transition.'
    ],
    'Walk': [
      'Start with just 5 minutes - it adds up.',
      'Walk during phone calls or while listening to podcasts.',
      'Make it social - invite a friend or family member.'
    ],
    'Breathe': [
      'Use the 4-7-8 technique: inhale 4, hold 7, exhale 8.',
      'Practice during transitions between activities.',
      'Set a gentle reminder on your phone.'
    ]
  };
  
  // Add habit-specific tip if available
  const habitTip = habitTips[habitName];
  if (habitTip && Math.random() > 0.7) { // 30% chance to add tip
    const tip = habitTip[Math.floor(Math.random() * habitTip.length)];
    message += ` ${tip}`;
  }
  
  return message;
}

/**
 * Pluggable AI provider interface for future integration
 */
export interface AIProvider {
  generateMotivation(prompt: string, context: MotivationContext): Promise<string>;
}

/**
 * Default provider that uses on-device templates
 */
export const defaultProvider: AIProvider = {
  async generateMotivation(prompt: string, context: MotivationContext): Promise<string> {
    return getMotivation(context);
  }
};

/**
 * OpenAI provider stub (disabled for MVP)
 */
export const openAIProvider: AIProvider = {
  async generateMotivation(prompt: string, context: MotivationContext): Promise<string> {
    // This would integrate with OpenAI API in production
    // For now, fall back to on-device templates
    console.log('OpenAI provider not configured, using on-device templates');
    return getMotivation(context);
  }
};

/**
 * Claude provider stub (disabled for MVP)
 */
export const claudeProvider: AIProvider = {
  async generateMotivation(prompt: string, context: MotivationContext): Promise<string> {
    // This would integrate with Claude API in production
    // For now, fall back to on-device templates
    console.log('Claude provider not configured, using on-device templates');
    return getMotivation(context);
  }
};

/**
 * Get current AI provider (configurable)
 */
export let currentProvider: AIProvider = defaultProvider;

/**
 * Set AI provider
 */
export function setAIProvider(provider: AIProvider): void {
  currentProvider = provider;
}

/**
 * Generate motivation using current provider
 */
export async function generateMotivation(context: MotivationContext): Promise<string> {
  const prompt = buildMotivationPrompt(context);
  return currentProvider.generateMotivation(prompt, context);
}

/**
 * Get time of day based on current hour
 */
export function getTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 22) return 'evening';
  return 'night';
}
