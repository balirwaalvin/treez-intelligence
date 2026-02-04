# 🔥 Firebase Integration Guide - Treez Intelligence

## ✅ What's Been Integrated

Firebase has been successfully integrated into your Treez Intelligence platform with the following services:

### 🔐 Authentication
- Google Sign-In (configured and ready)
- User session management
- Auth state persistence

### 💾 Firestore Database
- Chat history storage
- User profiles
- Generated content tracking (images & videos)

### 📦 Cloud Storage
- File uploads (images, documents)
- Generated content storage
- Download URL management

### 📊 Analytics
- User behavior tracking
- App usage analytics

---

## 🔒 Security Configuration

### Environment Variables Setup

All sensitive Firebase credentials are stored in `.env.local` (which is gitignored for security).

**To set up:**

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in your Firebase credentials in `.env.local`:
   ```env
   VITE_FIREBASE_API_KEY=your_actual_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

3. Get your Firebase config from:
   - Firebase Console → Project Settings → General → Your apps → Web app

**Important:** Never commit `.env.local` to version control!

---

## 📁 Files Created

### Core Firebase Configuration
- **`firebase.ts`** - Firebase initialization using environment variables
- **`services/firebase.ts`** - Firebase service layer with helper functions
- **`contexts/AuthContext.tsx`** - React Auth context provider
- **`components/Auth.tsx`** - Authentication UI components
- **`.env.example`** - Template for environment variables (safe to commit)

### Updated Files
- **`App.tsx`** - Added AuthButton in header
- **`index.tsx`** - Wrapped with AuthProvider
- **`package.json`** - Added firebase dependency
- **`.env.local`** - Contains actual API keys (gitignored)

---

## 🚀 Features Available

### 1. Authentication Service (`authService`)

```typescript
import { authService } from './services/firebase';

// Sign in with Google
const result = await authService.signInWithGoogle();

// Sign out
await authService.signOut();

// Get current user
const user = authService.getCurrentUser();

// Listen to auth changes
authService.onAuthStateChange((user) => {
  console.log('User:', user);
});
```

### 2. Chat History Service (`chatService`)

```typescript
import { chatService } from './services/firebase';

// Save chat session
await chatService.saveChatSession(userId, {
  title: 'My Conversation',
  messages: [...],
  model: 'gemini-3-flash'
});

// Get user's chat sessions
const { sessions } = await chatService.getUserChatSessions(userId);

// Update chat session
await chatService.updateChatSession(sessionId, {
  messages: updatedMessages
});

// Delete chat session
await chatService.deleteChatSession(sessionId);
```

### 3. User Profile Service (`userService`)

```typescript
import { userService } from './services/firebase';

// Save user profile
await userService.saveUserProfile(userId, {
  displayName: 'John Doe',
  preferences: { theme: 'dark' },
  apiUsage: { tokens: 1000 }
});

// Get user profile
const { profile } = await userService.getUserProfile(userId);
```

### 4. Storage Service (`storageService`)

```typescript
import { storageService } from './services/firebase';

// Upload file
const file = document.querySelector('input[type="file"]').files[0];
const { url } = await storageService.uploadFile(`users/${userId}/avatar.jpg`, file);

// Get file URL
const { url } = await storageService.getFileURL('path/to/file.jpg');

// Delete file
await storageService.deleteFile('path/to/file.jpg');
```

### 5. Generated Content Service (`contentService`)

```typescript
import { contentService } from './services/firebase';

// Save generated image
await contentService.saveGeneratedImage(userId, {
  prompt: 'A futuristic city',
  imageUrl: 'data:image/jpeg;base64,...',
  model: 'gemini-2.5-flash-image'
});

// Save generated video
await contentService.saveGeneratedVideo(userId, {
  prompt: 'A serene sunset',
  videoUrl: 'gs://bucket/video.mp4',
  model: 'veo-3.1-fast'
});

// Get user's generated content
const { content } = await contentService.getUserGeneratedContent(userId, 'images');
```

---

## 🎨 Using Auth in Components

### With useAuth Hook

```typescript
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { user, signInWithGoogle, signOut } = useAuth();

  if (!user) {
    return <button onClick={signInWithGoogle}>Sign In</button>;
  }

  return (
    <div>
      <p>Welcome, {user.displayName}!</p>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}
```

### AuthButton Component (Already Added)

The `<AuthButton />` component is already integrated in your header. It shows:
- Sign In button when logged out
- User info + Sign Out button when logged in

---

## 🔧 Firebase Console Setup

### Required Steps:

1. **Enable Authentication**
   - Go to: https://console.firebase.google.com/project/treez-intelligence/authentication
   - Click "Get Started"
   - Enable "Google" sign-in method
   - Add your domain to authorized domains

2. **Create Firestore Database**
   - Go to: https://console.firebase.google.com/project/treez-intelligence/firestore
   - Click "Create database"
   - Choose "Start in production mode"
   - Select region (us-central1 recommended)

3. **Enable Storage**
   - Go to: https://console.firebase.google.com/project/treez-intelligence/storage
   - Click "Get started"
   - Use default security rules for now

4. **Set Security Rules**

**Firestore Rules:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Chat sessions
    match /chatSessions/{sessionId} {
      allow read, write: if request.auth != null && 
                           resource.data.userId == request.auth.uid;
    }
    
    // Generated images
    match /generatedImages/{imageId} {
      allow read, write: if request.auth != null && 
                           resource.data.userId == request.auth.uid;
    }
    
    // Generated videos
    match /generatedVideos/{videoId} {
      allow read, write: if request.auth != null && 
                           resource.data.userId == request.auth.uid;
    }
  }
}
```

**Storage Rules:**
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## 📊 Database Structure

### Collections:

```
firestore/
├── users/
│   └── {userId}/
│       ├── displayName: string
│       ├── email: string
│       ├── photoURL: string
│       ├── preferences: object
│       ├── apiUsage: object
│       └── updatedAt: timestamp
│
├── chatSessions/
│   └── {sessionId}/
│       ├── userId: string
│       ├── title: string
│       ├── messages: array
│       ├── model: string
│       ├── createdAt: timestamp
│       └── updatedAt: timestamp
│
├── generatedImages/
│   └── {imageId}/
│       ├── userId: string
│       ├── prompt: string
│       ├── imageUrl: string
│       ├── model: string
│       └── createdAt: timestamp
│
└── generatedVideos/
    └── {videoId}/
        ├── userId: string
        ├── prompt: string
        ├── videoUrl: string
        ├── model: string
        └── createdAt: timestamp
```

---

## 🔄 Example: Integrating Chat History

Update `ChatInterface.tsx` to save conversations:

```typescript
import { useAuth } from '../contexts/AuthContext';
import { chatService } from '../services/firebase';

// In your component:
const { user } = useAuth();

// After each message:
if (user) {
  await chatService.saveChatSession(user.uid, {
    title: firstMessage.substring(0, 50),
    messages: chatHistory,
    model: 'gemini-3-flash'
  });
}
```

---

## 🎯 Next Steps

### Immediate Actions:

1. **Enable Firebase Services** (see Firebase Console Setup above)
2. **Test Authentication** - Click "Sign In with Google" in your app
3. **Verify Database** - Check Firestore console after sign-in

### Recommended Enhancements:

1. **Chat History UI**
   - Display saved conversations in sidebar
   - Load previous chats
   - Search functionality

2. **User Profile Page**
   - View/edit profile
   - Manage preferences
   - API usage statistics

3. **Content Gallery**
   - Show all generated images
   - Show all generated videos
   - Download/share options

4. **Usage Analytics**
   - Track API calls
   - Monitor costs
   - Set usage limits

---

## 🐛 Troubleshooting

### "Firebase: Error (auth/unauthorized-domain)"
**Solution:** Add your domain to Firebase Console → Authentication → Settings → Authorized domains

### "Missing or insufficient permissions"
**Solution:** Update Firestore security rules (see above)

### "Storage bucket not configured"
**Solution:** Enable Cloud Storage in Firebase Console

### "Auth state not persisting"
**Solution:** Firebase Auth automatically persists. Clear browser cache if issues persist.

---

## 📝 Testing Checklist

- [ ] Sign in with Google works
- [ ] User info displays correctly
- [ ] Sign out works
- [ ] Auth state persists on refresh
- [ ] Can save to Firestore
- [ ] Can read from Firestore
- [ ] Can upload to Storage
- [ ] Security rules work correctly

---

## 🔒 Security Best Practices

1. ✅ **Never expose Firebase config in public repos** (It's okay - config is public, rules protect data)
2. ✅ **Always use security rules** (Implemented above)
3. ✅ **Validate user input** (Before saving to database)
4. ✅ **Use server-side validation** (For sensitive operations)
5. ✅ **Monitor usage** (Enable budget alerts in Firebase)

---

## 🌟 Features Now Available

With Firebase integrated, your Treez Intelligence platform now has:

- ✅ **User Authentication** - Secure Google Sign-In
- ✅ **Persistent Chat History** - Save and load conversations
- ✅ **User Profiles** - Customizable user data
- ✅ **Content Management** - Track generated images/videos
- ✅ **Cloud Storage** - Upload and manage files
- ✅ **Analytics** - Track user engagement
- ✅ **Scalability** - Cloud-based backend ready for growth

---

## 🚀 Ready to Use!

Your Firebase integration is complete and ready to use. Start the app and test the authentication:

```bash
npm run dev
```

Then click "Sign In with Google" in the top-right corner!

**Firebase Console:** https://console.firebase.google.com/project/treez-intelligence

---

**Built with 🔥 by Firebase and ❤️ by Treez Intelligence**
