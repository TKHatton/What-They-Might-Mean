# Coach Screen - UX Plan & Implementation Guide

## 🎯 Purpose

The **Coach** is an AI assistant that helps users:
- Practice social situations before they happen
- Get advice on how to respond to messages
- Understand confusing social interactions
- Learn communication strategies for different contexts

**Key Difference from Main Feature:**
- **Main Analysis**: "Someone sent me this message, what does it mean?"
- **Coach**: "I need help figuring out what to say/do in this situation"

---

## 👤 User Journey

### First Time User Arrives at Coach Screen

1. **Sees welcome card** with explanation
2. **Sees example prompts** organized by mode (Work/School/Social)
3. **Taps an example** or types their own question
4. **Receives personalized advice** from the Coach
5. **Continues conversation** for follow-up questions
6. **Can clear chat** to start fresh anytime

### Returning User

1. **Sees previous conversation** (if not cleared)
2. **Can continue existing conversation** or clear to start fresh
3. **Quickly access example prompts** with a button

---

## 🎨 UI/UX Design

### Layout Structure

```
┌─────────────────────────────────┐
│  ← Back    🧠 Coach    🗑️ Clear │  ← Header
├─────────────────────────────────┤
│                                 │
│  [Welcome Card - Shows on      │  ← Welcome (first visit)
│   empty state]                  │
│                                 │
│  📚 Example Questions:          │  ← Example Prompts
│  ┌─────────────────────────┐  │
│  │ 💼 How do I ask my boss │  │
│  │    for time off?        │  │
│  └─────────────────────────┘  │
│  ┌─────────────────────────┐  │
│  │ 💼 I got vague feedback │  │
│  │    at work, what now?   │  │
│  └─────────────────────────┘  │
│  ... more examples ...         │
│                                 │
│  [Chat Messages]               │  ← Conversation
│  ┌─────────────────────────┐  │
│  │ User: How do I...       │  │
│  └─────────────────────────┘  │
│  ┌─────────────────────────┐  │
│  │ Coach: Here's what I    │  │
│  │ recommend...            │  │
│  └─────────────────────────┘  │
│                                 │
├─────────────────────────────────┤
│  Type your question...    [>]  │  ← Input
└─────────────────────────────────┘
```

---

## 📝 Welcome Card Content

**Title:** "Your Social Skills Coach 🧠"

**Description:**
"I'm here to help you navigate social situations with confidence. Ask me about:
- How to respond to messages
- What someone might mean by something they said
- How to handle awkward situations
- Practice for upcoming conversations
- Understanding social expectations"

**Visual:**
- Rounded card with subtle background
- Icon (brain or coach figure)
- Friendly, approachable tone
- Appears when chat is empty
- Dismisses when user sends first message

---

## 💡 Example Prompts by Mode

### 🏢 Work Mode Examples

1. **"How do I ask my boss for time off?"**
   - Category: Request
   - Difficulty: Medium

2. **"My coworker said 'we should grab coffee sometime' - do they mean it?"**
   - Category: Interpretation
   - Difficulty: Easy

3. **"I got vague feedback at work. How do I ask for specifics?"**
   - Category: Clarification
   - Difficulty: Medium

4. **"How do I decline extra work without seeming lazy?"**
   - Category: Boundaries
   - Difficulty: Hard

5. **"My manager said 'no rush' on a task. When is it due?"**
   - Category: Hidden Meaning
   - Difficulty: Medium

6. **"How do I tell a client their idea won't work?"**
   - Category: Difficult Conversation
   - Difficulty: Hard

### 🎓 School Mode Examples

1. **"How do I ask my teacher to explain something again?"**
   - Category: Clarification
   - Difficulty: Easy

2. **"My group partner isn't doing their part. What do I say?"**
   - Category: Conflict
   - Difficulty: Medium

3. **"Someone asked to copy my homework. How do I say no?"**
   - Category: Boundaries
   - Difficulty: Medium

4. **"The other students are talking about plans and didn't invite me. Should I ask?"**
   - Category: Social Anxiety
   - Difficulty: Hard

5. **"My professor said 'see me after class' - am I in trouble?"**
   - Category: Interpretation
   - Difficulty: Easy

6. **"How do I introduce myself in a new class?"**
   - Category: Social Skills
   - Difficulty: Medium

### 👥 Social Mode Examples

1. **"My friend is upset with me but won't say why. What do I do?"**
   - Category: Conflict Resolution
   - Difficulty: Hard

2. **"How do I politely decline an invitation?"**
   - Category: Boundaries
   - Difficulty: Easy

3. **"Someone texted 'K' - are they mad at me?"**
   - Category: Text Interpretation
   - Difficulty: Easy

4. **"My friend group made plans without me. Should I say something?"**
   - Category: Social Anxiety
   - Difficulty: Hard

5. **"How do I tell someone I need space without hurting their feelings?"**
   - Category: Boundaries
   - Difficulty: Hard

6. **"What's the difference between 'let's hang out' and actual plans?"**
   - Category: Hidden Meaning
   - Difficulty: Medium

---

## 🔄 Coach Response Format

The Coach should respond with:

1. **Acknowledgment** - "I understand this is difficult/confusing..."
2. **Analysis** - "Here's what's likely happening..."
3. **Options** - "You have a few ways to approach this..."
4. **Recommended Response** - Specific wording/script
5. **Why It Works** - Brief explanation
6. **Follow-up Support** - "Would you like to practice what to say?"

### Example Coach Response

**User:** "How do I ask my boss for time off?"

**Coach Response:**
"I can help you with that! Asking for time off can feel intimidating, but with the right approach, it's straightforward.

**Here's what I recommend:**

1. **Timing matters**: Ask at least 2-3 weeks in advance if possible, and choose a calm moment (not during a crisis).

2. **Use this script**:
   'Hi [Boss], I'd like to request time off from [date] to [date]. I've checked the team calendar and made sure [project X] will be handled. Would this work for you?'

3. **Why this works**:
   - Shows you're thinking ahead
   - Demonstrates responsibility
   - Makes it easy for them to say yes
   - Gives them time to plan coverage

4. **If they ask for details**: You don't need to explain everything. 'Personal reasons' or 'family commitment' is enough.

5. **If they seem hesitant**: Ask 'What would make this easier for you?' - shows flexibility.

**Would you like to practice the conversation, or do you have questions about the timing?**"

---

## 🎭 Coach Personality

### Tone
- **Supportive** - Never judgmental
- **Educational** - Explains the "why" behind advice
- **Practical** - Gives actionable scripts and examples
- **Empathetic** - Validates user's feelings
- **Context-aware** - Adapts to Work/School/Social mode

### What Coach Does
✅ Provides specific response templates
✅ Explains social expectations
✅ Offers multiple options (not just one answer)
✅ Validates concerns
✅ Suggests follow-up questions

### What Coach Doesn't Do
❌ Judge the user
❌ Make assumptions about relationships
❌ Give one-size-fits-all advice
❌ Use overly clinical language
❌ Overwhelm with information

---

## 🛠️ Implementation Plan

### Phase 1: Welcome State & Examples (Immediate)

**File:** `App.tsx` - Coach screen section (around line 1850)

**Add:**
1. Welcome card component (shows when `coachHistory.length === 0`)
2. Example prompt buttons organized by current mode
3. "Show Examples" button (if chat has started)
4. Clear chat button in header

**Code Structure:**
```typescript
{screen === 'COACH' && (
  <div className="screen-enter">
    {/* Header with Clear button */}
    <div className="flex items-center justify-between mb-6">
      <button onClick={() => setScreen('HOME')}>← Back</button>
      <h2>🧠 Coach</h2>
      <button onClick={() => { setCoachHistory([]); setCoachInput(''); }}>
        🗑️ Clear
      </button>
    </div>

    {/* Welcome Card (empty state) */}
    {coachHistory.length === 0 && (
      <div className="welcome-card">
        <h3>Your Social Skills Coach 🧠</h3>
        <p>I'm here to help you navigate social situations...</p>
      </div>
    )}

    {/* Example Prompts */}
    {(coachHistory.length === 0 || showExamples) && (
      <div className="example-prompts">
        <h4>📚 Try asking me:</h4>
        {getExamplePrompts(settings.defaultMode).map(example => (
          <button
            onClick={() => {
              setCoachInput(example.prompt);
              handleCoachSubmit(example.prompt);
            }}
          >
            {example.icon} {example.prompt}
          </button>
        ))}
      </div>
    )}

    {/* Chat History */}
    {coachHistory.map((msg, i) => (
      <div key={i} className={msg.role}>
        {msg.text}
      </div>
    ))}

    {/* Input */}
    <div className="input-area">
      <input
        value={coachInput}
        onChange={(e) => setCoachInput(e.target.value)}
        placeholder="Ask me anything about communication..."
      />
      <button onClick={handleCoachSubmit}>Send</button>
    </div>
  </div>
)}
```

### Phase 2: Enhanced Coach System Prompt

**File:** `services/coachService.ts` (line 5)

**Update System Prompt:**
```typescript
const COACH_SYSTEM_INSTRUCTION = `
You are a compassionate social skills coach helping neurodivergent individuals understand social situations.

YOUR ROLE:
- Help users navigate work, school, and social situations
- Explain hidden social rules and expectations
- Provide specific response scripts and templates
- Validate their concerns while offering practical solutions
- Adapt advice based on context (work/school/social)

RESPONSE FORMAT:
1. Acknowledge their situation with empathy
2. Provide 2-3 specific options or approaches
3. Give exact wording they can use (scripts)
4. Explain WHY it works (teach the social rule)
5. Offer follow-up support

TONE:
- Supportive, never judgmental
- Practical and actionable
- Patient and understanding
- Clear and specific (avoid vague advice)

AVOID:
- Telling them their feelings are wrong
- Generic advice like "just be yourself"
- Assuming relationship dynamics
- Clinical/medical language
- Overwhelming with too much info at once

Current mode: {mode} - Tailor advice to this context.
`;
```

### Phase 3: Example Prompts Data Structure

**File:** `constants.ts` (add new export)

```typescript
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
    // ... more examples
  ],
  SCHOOL: [
    {
      prompt: "How do I ask my teacher to explain something again?",
      icon: "🎓",
      category: "Clarification"
    },
    // ... more examples
  ],
  SOCIAL: [
    {
      prompt: "My friend is upset with me but won't say why. What do I do?",
      icon: "👥",
      category: "Conflict"
    },
    // ... more examples
  ]
};
```

### Phase 4: Visual Polish

**Improvements:**
- Welcome card with gradient background
- Example prompt buttons with hover effects
- Clear visual distinction between user/coach messages
- Loading animation while coach is thinking
- "Coach is typing..." indicator
- Smooth scroll to new messages
- Empty state illustration/icon

---

## 📱 Mobile Considerations

- **Input always visible**: Fix input to bottom
- **Scroll to latest**: Auto-scroll when new message arrives
- **Example prompts**: Swipeable horizontal scrolling on mobile
- **Text size**: Respect user's text size setting
- **Touch targets**: Large tap areas for example buttons (min 44px)

---

## 🎓 User Education

### First-Time User Tips

Show a one-time tooltip or overlay:
- "💡 Tip: The Coach can help you practice conversations before they happen!"
- "💡 Tip: Try tapping an example to see how I can help"
- "💡 Tip: You can ask follow-up questions to dive deeper"

### Help Button

Add a "?" help icon that explains:
- What the Coach is for
- How it's different from message analysis
- Example use cases
- Privacy (conversations aren't saved if not signed in)

---

## 🔐 Privacy & Data

**Important Notes:**
- Coach conversations are only saved in localStorage (not Supabase) unless explicitly synced
- Users should know: "Your conversations are private and stored locally"
- Option to "Clear conversation" should be prominent
- Consider adding "Save this conversation to library" feature

---

## 🧪 Testing Scenarios

### Test these user flows:

1. **Empty state**: User lands on Coach screen, sees welcome, taps example
2. **Continuing conversation**: User asks follow-up question
3. **Clear chat**: User clears and starts fresh
4. **Mode switching**: Examples update when user changes mode
5. **Offline**: Coach still works (uses cached/local AI)
6. **Long conversation**: Scroll behavior works correctly
7. **Copy response**: User can copy Coach's advice

---

## 🚀 Launch Checklist

Before shipping Coach screen:
- [ ] Welcome card appears on empty state
- [ ] 6 example prompts per mode (18 total)
- [ ] Examples update when mode changes
- [ ] Clear chat button works
- [ ] Coach responses are helpful and specific
- [ ] Loading state shows while Coach is thinking
- [ ] Scroll to bottom on new messages
- [ ] Input is always visible (fixed bottom)
- [ ] Works in dark mode
- [ ] Text size setting is respected
- [ ] TTS reads Coach responses (if enabled)
- [ ] Mobile touch targets are 44px+
- [ ] Help/info button explains feature

---

## 📊 Success Metrics

Track (if analytics added):
- % of users who visit Coach screen
- % who use example prompts vs custom questions
- Average conversation length
- Most popular example prompts
- Clear chat frequency (might indicate confusion)

---

## 🎯 Future Enhancements

**V2 Features:**
- **Voice input**: Ask coach via voice
- **Conversation history**: Save past coaching sessions
- **Scenario practice**: Multi-turn role-play mode
- **Favorite responses**: Save helpful advice to library
- **Context awareness**: "Based on your previous analyses..."
- **Difficulty levels**: "Give me a simple/detailed explanation"
- **Cultural context**: "I'm in [country], how does this work here?"

---

## 💬 Sample User Scenarios

### Scenario 1: Workplace Request
**User context**: Needs to ask for time off but anxious about it
**Example used**: "How do I ask my boss for time off?"
**Coach response**: Provides script, timing advice, and follow-up support
**User action**: Feels confident, uses the script successfully

### Scenario 2: Text Interpretation
**User context**: Friend sent short reply, worried they're mad
**Example used**: "Someone texted 'K' - are they mad at me?"
**Coach response**: Explains text communication norms, offers alternatives
**User action**: Feels reassured, doesn't overthink the message

### Scenario 3: Social Boundary
**User context**: Invited to event they don't want to attend
**Example used**: "How do I politely decline an invitation?"
**Coach response**: Multiple script options, explains social norms
**User action**: Chooses a response that feels authentic to them

---

## 🎨 Visual Design Notes

### Color Scheme
- **User messages**: Light background (same as input cards)
- **Coach messages**: Slightly different shade to distinguish
- **Welcome card**: Gradient or accent color (purple theme)
- **Example buttons**: Outlined with hover effect
- **Icons**: Contextual (💼 work, 🎓 school, 👥 social)

### Typography
- **Welcome title**: Larger, bold
- **Coach messages**: Comfortable reading size
- **Example prompts**: Slightly smaller, clear hierarchy
- **System messages**: Subtle, italic

### Spacing
- Generous padding in chat messages (readability)
- Clear separation between messages
- Welcome card stands out with more space
- Example prompts grouped visually

---

## 📝 Copy Guidelines

### Welcome Card
- Friendly, not clinical
- Explain what Coach does in simple terms
- 2-3 sentences max
- Include reassurance ("I'm here to help")

### Example Prompts
- First person ("I", not "How does someone...")
- Specific situations, not generic
- Conversational tone
- 10 words or less when possible

### Coach Responses
- Start with acknowledgment
- Use "you" language (direct)
- Bullet points for clarity
- Include specific quotes/scripts
- End with next step or follow-up

---

This plan ensures the Coach screen is intuitive, helpful, and provides real value to users navigating social situations!
