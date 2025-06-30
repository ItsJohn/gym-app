# AI Workout Generator Setup

This app includes an AI-powered workout generator using Google's Gemini AI. Follow these steps to set it up:

## 1. Get a Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

## 2. Configure the API Key

Create a `.env` file in your project root and add:

```env
EXPO_PUBLIC_GEMINI_API_KEY=your_api_key_here
```

Replace `your_api_key_here` with your actual API key.

## 3. Features

The AI workout generator can:

- Create personalized workouts based on user goals
- Consider physical limitations and injuries
- Adjust difficulty based on experience level
- Provide safety warnings and recommendations
- Generate 6-10 exercises with proper sets, reps, and rest periods

## 4. Usage

1. In the app, go to "Workouts" tab
2. Tap "Create Workout"
3. Choose "🤖 AI Generated" mode
4. Fill in your goals and any physical issues
5. Select your experience level
6. Tap "Generate Workout"
7. Review the generated workout and save it

## 5. Safety Features

- The AI considers mentioned physical limitations
- Provides warnings for exercises that might aggravate issues
- Suggests modifications and alternatives
- Includes proper rest periods and difficulty scaling

## 6. Fallback

If no API key is configured, the app will still work with manual workout creation. The AI features will simply be disabled with a warning message.

## Example Prompts

**Goals:** "Build muscle and strength in my upper body"
**Issues:** "Lower back pain from sitting at desk all day"
**Result:** AI will generate upper body focused exercises while avoiding movements that stress the lower back.

**Goals:** "Lose weight and improve cardiovascular health"
**Issues:** "Knee problems, can't do high impact"
**Result:** AI will focus on low-impact cardio and strength exercises that don't stress the knees.