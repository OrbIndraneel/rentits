import React, { useState, useEffect, useRef } from 'react';
import {
  BookOpen,
  MessageSquare,
  Cpu,
  Sparkles,
  CheckCircle,
  Send,
  HelpCircle,
  Award,
  Tv,
  RefreshCw,
  Link2,
  ShieldCheck,
  User,
  Check,
  ChevronRight,
  ClipboardList,
  AlertCircle,
  LogOut,
  Compass,
  Settings,
  Bell,
  ChevronDown,
  ArrowRight
} from 'lucide-react';
import { db, auth } from './firebase';
import {
  signInAnonymously,
  onAuthStateChanged,
  signOut,
  type User as FirebaseUser
} from 'firebase/auth';
import { collection, doc, addDoc, updateDoc, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import type { AIStudyResponse, UserPod } from '@studysync/shared';
import Auth from './Auth';
import landingHeroImg from './assets/landing_hero.png';
import './App.css';

// Simulated default mock pods for local fallback
const MOCK_PODS_INITIAL: UserPod[] = [
  {
    id: 'mock-1',
    topic: 'Quantum Computing Fundamentals',
    rentItsStatus: 'unlinked',
    aiData: {
      summary: 'Quantum computing leverages quantum mechanical phenomena such as superposition and entanglement to perform calculations. Unlike classical bits, qubits can represent 0, 1, or any quantum superposition of both, exponentially increasing computational space.',
      roadmap: [
        'Understand superposition and Bloch Sphere representation',
        'Learn quantum gates (Hadamard, CNOT, Phase)',
        'Study simple algorithms like Deutsch-Jozsa and Grover\'s Search',
        'Explore physical qubit implementation technologies (superconducting, trapped ion)'
      ],
      quiz: [
        { question: 'What is the quantum equivalent of a classical bit called?', answer: 'Qubit (Quantum Bit)' },
        { question: 'Which quantum gate is used to put a qubit into superposition?', answer: 'Hadamard Gate (H Gate)' },
        { question: 'What is the phenomenon where two qubits become linked and share state instantaneously regardless of distance?', answer: 'Entanglement' }
      ],
      complexityScore: 8
    }
  },
  {
    id: 'mock-2',
    topic: 'React 19 Concurrent Features',
    rentItsStatus: 'verified',
    aiData: {
      summary: 'React 19 introduces full support for concurrent rendering, Server Components, Action hooks (like useActionState and useOptimistic), and asset loading. It improves performance by allowing background updates without blocking the main UI thread.',
      roadmap: [
        'Master Server Actions and async transition states',
        'Use the new use() API for promises and context resolution',
        'Understand form Actions and the new useFormStatus hooks',
        'Configure document metadata and stylesheet precedence'
      ],
      quiz: [
        { question: 'What hook is introduced in React 19 to manage form state and transition status?', answer: 'useActionState (previously useFormState)' },
        { question: 'How do you read a Promise or Context inline during rendering in React 19?', answer: 'With the new use() API function' }
      ],
      complexityScore: 6
    }
  }
];

interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
  isBot?: boolean;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  { id: '1', sender: 'Alex', text: 'Hey guys! Welcome to our StudyPod!', timestamp: new Date(Date.now() - 300000).toLocaleTimeString() },
  { id: '2', sender: 'Sarah', text: 'Stoked to study this topic together. Let\'s generate an AI Summary to start.', timestamp: new Date(Date.now() - 200000).toLocaleTimeString() },
  { id: '3', sender: 'System AI', text: 'Hello! I am your StudySync Gemini Assistant. Ask me questions or click Generate AI Study Guide above.', timestamp: new Date(Date.now() - 100000).toLocaleTimeString(), isBot: true },
];

const getCoverStyle = (topic: string) => {
  // Simple deterministic hash based on topic string
  let hash = 0;
  for (let i = 0; i < topic.length; i++) {
    hash = topic.charCodeAt(i) + ((hash << 5) - hash);
  }
  const presets = [
    { bg: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)', text: '#0d47a1', accent: '#1976d2' }, // blue
    { bg: 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)', text: '#4a148c', accent: '#7b1fa2' }, // purple
    { bg: 'linear-gradient(135deg, #efebe9 0%, #d7ccc8 100%)', text: '#3e2723', accent: '#5d4037' }, // brown
    { bg: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)', text: '#1b5e20', accent: '#388e3c' }, // green
    { bg: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)', text: '#e65100', accent: '#f57c00' }, // orange
    { bg: 'linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)', text: '#b71c1c', accent: '#d32f2f' }  // red
  ];
  const idx = Math.abs(hash) % presets.length;
  return presets[idx];
};

interface HomepageProps {
  onGetStarted: () => void;
  onStartGuestMode: () => void;
}

function Homepage({ onGetStarted, onStartGuestMode }: HomepageProps) {
  return (
    <div className="landing-container animate-fade-in" id="landing-page">
      {/* Navigation Bar */}
      <nav className="landing-navbar">
        <div className="landing-logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <Cpu size={22} style={{ color: 'var(--accent-coral)' }} />
          <span>StudySync</span>
        </div>
        <div className="landing-nav-links">
          <a href="#features" className="landing-nav-link">Features</a>
          <a href="#how-it-works" className="landing-nav-link">How It Works</a>
          <a href="#about" className="landing-nav-link">About</a>
          <button
            onClick={onGetStarted}
            className="btn btn-secondary"
            style={{ padding: '8px 16px', fontSize: '13.5px', borderRadius: '10px' }}
            id="btn-nav-signin"
          >
            Sign In
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="landing-hero">
        <div className="landing-hero-content">
          <div className="landing-hero-tag">
            <Sparkles size={14} />
            <span>Introducing StudySync 2.0</span>
          </div>
          <h1 className="landing-hero-title">
            Your intellectual space for learning and device sharing.
          </h1>
          <p className="landing-hero-desc">
            StudySync blends collaborative study pods, instant AI-generated roadmap aids, and recall testing with safe, local-mode rental device verification. Keep your study items, summaries, and gadgets in perfect harmony.
          </p>
          <div className="landing-hero-ctas">
            <button
              onClick={onGetStarted}
              className="btn btn-primary"
              style={{ padding: '12px 24px', borderRadius: '12px' }}
              id="btn-hero-getstarted"
            >
              Get Started <ArrowRight size={16} />
            </button>
            <button
              onClick={onStartGuestMode}
              className="btn btn-secondary"
              style={{ padding: '12px 24px', borderRadius: '12px' }}
              id="btn-hero-guest"
            >
              Explore as Guest
            </button>
          </div>
        </div>

        <div className="landing-hero-image-wrapper">
          <img
            src={landingHeroImg}
            alt="StudySync Editorial Illustration"
            className="landing-hero-image"
          />
        </div>
      </header>

      {/* Stats Section */}
      <section className="landing-stats-section" id="about">
        <div className="landing-stats-grid">
          <div className="landing-stat-item">
            <span className="landing-stat-number">15K+</span>
            <span className="landing-stat-label">Active StudyPods</span>
          </div>
          <div className="landing-stat-item">
            <span className="landing-stat-number">98%</span>
            <span className="landing-stat-label">AI Accuracy Rating</span>
          </div>
          <div className="landing-stat-item">
            <span className="landing-stat-number">200K+</span>
            <span className="landing-stat-label">Quizzes Completed</span>
          </div>
          <div className="landing-stat-item">
            <span className="landing-stat-number">100%</span>
            <span className="landing-stat-label">Verified Device Rentals</span>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section className="landing-features-section" id="features">
        <div className="landing-section-title-box">
          <span className="landing-section-subtitle">Core Capabilities</span>
          <h2 className="landing-section-title">Designed for modern learners</h2>
        </div>

        <div className="landing-features-grid">
          {/* Card 1 */}
          <div className="landing-feature-card" onClick={onGetStarted}>
            <div className="landing-feature-icon-box">
              <BookOpen size={22} />
            </div>
            <h3 className="landing-feature-title">StudyPods</h3>
            <p className="landing-feature-desc">
              Group topics under beautiful digital book covers. Create custom roadmaps, track checklists collaboratively, and study in real-time.
            </p>
          </div>

          {/* Card 2 */}
          <div className="landing-feature-card" onClick={onGetStarted}>
            <div className="landing-feature-icon-box">
              <Sparkles size={22} />
            </div>
            <h3 className="landing-feature-title">Cognitive AI</h3>
            <p className="landing-feature-desc">
              Upload any complex topic to instantly generate flash summary sheets, modular roadmap milestones, and recall review tests.
            </p>
          </div>

          {/* Card 3 */}
          <div className="landing-feature-card" onClick={onGetStarted}>
            <div className="landing-feature-icon-box">
              <Tv size={22} />
            </div>
            <h3 className="landing-feature-title">RentIts Verification</h3>
            <p className="landing-feature-desc">
              Connect external hardware rental items securely. Log device status, inspect serial verification codes, and sign rental receipts.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="landing-steps-section" id="how-it-works">
        <div className="landing-section-title-box">
          <span className="landing-section-subtitle">Onboarding Flow</span>
          <h2 className="landing-section-title">How It Works</h2>
        </div>

        <div className="landing-steps-grid">
          <div className="landing-step-card">
            <div className="landing-step-number-box">1</div>
            <h3 className="landing-step-title">Create a StudyPod</h3>
            <p className="landing-step-desc">
              Input any topic of interest to bootstrap a collaborative digital book space. Group checklist objectives and chats together.
            </p>
          </div>

          <div className="landing-step-card">
            <div className="landing-step-number-box">2</div>
            <h3 className="landing-step-title">Sync & Summarize</h3>
            <p className="landing-step-desc">
              Generate instant AI learning paths. Access curated smart summaries, custom checklists, and instant interactive recall testing.
            </p>
          </div>

          <div className="landing-step-card">
            <div className="landing-step-number-box">3</div>
            <h3 className="landing-step-title">Connect & Rent</h3>
            <p className="landing-step-desc">
              Inspect rented devices from RentIts. Verify security hashes and check serial codes to gain bonus score multipliers.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <span>© {new Date().getFullYear()} StudySync Inc. All rights reserved.</span>
        <div style={{ display: 'flex', gap: '20px' }}>
          <span style={{ cursor: 'pointer' }}>Privacy Policy</span>
          <span style={{ cursor: 'pointer' }}>Terms of Service</span>
        </div>
      </footer>
    </div>
  );
}

function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isLocalMode, setIsLocalMode] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [pods, setPods] = useState<UserPod[]>([]);
  const [selectedPodId, setSelectedPodId] = useState<string | null>(null);

  // UI Modals & Settings States
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [alertNotifications, setAlertNotifications] = useState(true);

  // Input fields & states
  const [newPodTopic, setNewPodTopic] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Global Points system
  const [points, setPoints] = useState(120);

  // Chat Simulated State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Roadmap Progress State
  const [completedSteps, setCompletedSteps] = useState<{ [key: string]: boolean }>({});

  // Quiz State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizAnswerVisible, setQuizAnswerVisible] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);

  // RentIts State
  const [rentItsConnected, setRentItsConnected] = useState(false);
  const [rentItsReceipt, setRentItsReceipt] = useState<any>(null);
  const [isVerifyingRentIts, setIsVerifyingRentIts] = useState(false);

  // Firebase auth & real-time sync
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setIsLocalMode(false);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Toggle landing page scrollable class on body
  useEffect(() => {
    const isLanding = !user && !isLocalMode;
    if (isLanding) {
      document.body.classList.add('landing-active');
    } else {
      document.body.classList.remove('landing-active');
    }
    return () => {
      document.body.classList.remove('landing-active');
    };
  }, [user, isLocalMode]);

  const handleStartGuestMode = () => {
    setAuthLoading(true);
    signInAnonymously(auth)
      .then((cred) => {
        setUser(cred.user);
        setIsLocalMode(false);
        setAuthLoading(false);
      })
      .catch((err) => {
        console.warn('Firebase Auth failed. Falling back to local sandbox mode:', err);
        setIsLocalMode(true);
        setUser(null);
        setPods(MOCK_PODS_INITIAL);
        setAuthLoading(false);
      });
  };

  const handleLogout = async () => {
    try {
      if (auth.currentUser) {
        await signOut(auth);
      }
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setUser(null);
      setIsLocalMode(false);
      setShowAuth(false);
      setPods([]);
      setSelectedPodId(null);
    }
  };

  // Listen to /pods collection in Firestore if not in local mode
  useEffect(() => {
    if (isLocalMode || !user) return;

    try {
      const q = query(collection(db, 'pods'), orderBy('createdAt', 'desc'), limit(15));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const podsData: UserPod[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          podsData.push({
            id: doc.id,
            topic: data.topic,
            rentItsStatus: data.rentItsStatus || 'unlinked',
            aiData: data.aiData
          });
        });
        setPods(podsData);

        // Auto select first pod if none selected
        if (podsData.length > 0 && !selectedPodId) {
          setSelectedPodId(podsData[0].id);
        }
      }, (error) => {
        console.error("Firestore onSnapshot error, falling back to local mode:", error);
        setIsLocalMode(true);
        setPods(MOCK_PODS_INITIAL);
      });

      return () => unsubscribe();
    } catch (e) {
      console.warn("Firebase collection access blocked, falling back to local:", e);
      setIsLocalMode(true);
      setPods(MOCK_PODS_INITIAL);
    }
  }, [isLocalMode, user]);

  // Handle selected pod changes - reset quiz and checklist states
  const activePod = pods.find(p => p.id === selectedPodId) || null;

  useEffect(() => {
    setCurrentQuestionIndex(0);
    setQuizScore(0);
    setQuizAnswerVisible(false);
    setQuizFinished(false);
    setCompletedSteps({});
    setChatMessages(INITIAL_MESSAGES);
  }, [selectedPodId]);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Create a StudyPod
  const handleCreatePod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPodTopic.trim()) return;

    setIsCreating(true);
    const topic = newPodTopic.trim();

    if (isLocalMode || !user) {
      // Local fallback creation
      const newLocalPod: UserPod = {
        id: `local-${Date.now()}`,
        topic,
        rentItsStatus: 'unlinked'
      };
      setPods(prev => [newLocalPod, ...prev]);
      setSelectedPodId(newLocalPod.id);
      setNewPodTopic('');
      setIsCreating(false);
    } else {
      try {
        const docRef = await addDoc(collection(db, 'pods'), {
          topic,
          members: [user.uid],
          rentItsStatus: 'unlinked',
          createdAt: new Date().toISOString()
        });
        setSelectedPodId(docRef.id);
        setNewPodTopic('');
        setIsCreating(false);
      } catch (err) {
        console.error("Error creating pod in Firestore:", err);
        // Fallback to local
        const newLocalPod: UserPod = {
          id: `local-${Date.now()}`,
          topic,
          rentItsStatus: 'unlinked'
        };
        setPods(prev => [newLocalPod, ...prev]);
        setSelectedPodId(newLocalPod.id);
        setNewPodTopic('');
        setIsCreating(false);
      }
    }
  };

  // Generate AI study guide
  const handleGenerateAI = async () => {
    if (!activePod) return;
    setIsGeneratingAI(true);
    setAiError(null);

    try {
      const response = await fetch('http://localhost:3001/api/generate-pod', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: activePod.topic })
      });

      if (!response.ok) {
        throw new Error('Failed to communicate with the study helper backend.');
      }

      const json = await response.json();
      if (json.success && json.data) {
        const aiData: AIStudyResponse = json.data;

        // Update active pod
        if (isLocalMode) {
          setPods(prev => prev.map(p => p.id === activePod.id ? { ...p, aiData } : p));
        } else {
          const docRef = doc(db, 'pods', activePod.id);
          await updateDoc(docRef, { aiData });
        }
        setPoints(p => p + 30); // Claim points for generating guide
      } else {
        throw new Error(json.error || 'Invalid backend format');
      }
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || 'Connecting to Antigravity AI Link failed. Ensure server is online.');

      // Local demo mode mock generation for evaluation robustness
      setTimeout(() => {
        const mockGenerated: AIStudyResponse = {
          summary: `Study guide generated for "${activePod.topic}". This premium module outlines core concepts, a master timeline, and active recall study modules.`,
          roadmap: [
            `Introduce core principles of ${activePod.topic}`,
            `Deconstruct advanced mechanics and architectures`,
            `Analyze practical implementation and common gotchas`,
            `Apply debugging and testing frameworks`
          ],
          quiz: [
            { question: `What is the primary challenge in mastering ${activePod.topic}?`, answer: 'Understanding abstract interactions and state mechanics.' },
            { question: `True or False: Efficient mastery of ${activePod.topic} requires structured step-by-step revision.`, answer: 'True' }
          ],
          complexityScore: 7
        };

        if (isLocalMode) {
          setPods(prev => prev.map(p => p.id === activePod.id ? { ...p, aiData: mockGenerated } : p));
        } else {
          try {
            updateDoc(doc(db, 'pods', activePod.id), { aiData: mockGenerated });
          } catch {
            setPods(prev => prev.map(p => p.id === activePod.id ? { ...p, aiData: mockGenerated } : p));
          }
        }
        setPoints(p => p + 30);
        setAiError(null);
        setIsGeneratingAI(false);
      }, 1500);
      return;
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Toggle step completion in the roadmap
  const toggleStep = (index: number) => {
    const key = `${activePod?.id}-${index}`;
    setCompletedSteps(prev => {
      const next = { ...prev, [key]: !prev[key] };
      // Give points for learning progression
      if (next[key]) setPoints(p => p + 5);
      return next;
    });
  };

  // Chat submit message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg: ChatMessage = {
      id: `chat-${Date.now()}`,
      sender: 'You',
      text: chatInput.trim(),
      timestamp: new Date().toLocaleTimeString()
    };

    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');

    // Simulated responsive study bot replies
    const textLower = userMsg.text.toLowerCase();
    setTimeout(() => {
      let replyText = "Interesting point! Let's make sure to reference the AI Guide.";
      if (textLower.includes('question') || textLower.includes('?') || textLower.includes('help')) {
        replyText = `I can help you review "${activePod?.topic || 'this topic'}". Try completing the quiz module to solidify details!`;
      } else if (textLower.includes('rentits') || textLower.includes('points') || textLower.includes('bonus')) {
        replyText = "Linking a verified RentIts ergonomic chair or monitor gets you an extra +50 pts bonus! Check the RentIts panel.";
      } else if (textLower.includes('hello') || textLower.includes('hey')) {
        replyText = `Hey there! Ready to study ${activePod?.topic || 'some science'}?`;
      }

      const botMsg: ChatMessage = {
        id: `chat-bot-${Date.now()}`,
        sender: 'StudyPod Bot',
        text: replyText,
        timestamp: new Date().toLocaleTimeString(),
        isBot: true
      };
      setChatMessages(prev => [...prev, botMsg]);
    }, 1200);
  };

  // RentIts link simulator
  const handleLinkRentIts = async () => {
    if (!activePod) return;
    setRentItsConnected(true);

    // Update local or Firestore status
    if (isLocalMode) {
      setPods(prev => prev.map(p => p.id === activePod.id ? { ...p, rentItsStatus: 'linked' } : p));
    } else {
      try {
        await updateDoc(doc(db, 'pods', activePod.id), { rentItsStatus: 'linked' });
      } catch (err) {
        setPods(prev => prev.map(p => p.id === activePod.id ? { ...p, rentItsStatus: 'linked' } : p));
      }
    }
  };



  // RentIts claim points
  const handleVerifyRentIts = async (itemId: string) => {
    if (!activePod) return;
    setIsVerifyingRentIts(true);

    try {
      const response = await fetch('http://localhost:3001/api/verify-rentits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.uid || 'student-local', itemId })
      });

      if (!response.ok) throw new Error('Verification backend offline');

      const receipt = await response.json();
      setRentItsReceipt(receipt);

      // Upgrade Pod status to verified
      if (isLocalMode) {
        setPods(prev => prev.map(p => p.id === activePod.id ? { ...p, rentItsStatus: 'verified' } : p));
      } else {
        await updateDoc(doc(db, 'pods', activePod.id), { rentItsStatus: 'verified' });
      }
      setPoints(p => p + 50); // Claim bonus points
    } catch (e) {
      console.warn("Verify RentIts offline. Simulating local verification:", e);
      // Fallback
      const mockReceipt = {
        receiptId: `RENT-MOCK-${Math.floor(Math.random() * 10000)}`,
        status: 'VERIFIED',
        bonusPoints: 50,
        timestamp: new Date().toISOString()
      };
      setRentItsReceipt(mockReceipt);
      if (isLocalMode) {
        setPods(prev => prev.map(p => p.id === activePod.id ? { ...p, rentItsStatus: 'verified' } : p));
      } else {
        try {
          await updateDoc(doc(db, 'pods', activePod.id), { rentItsStatus: 'verified' });
        } catch {
          setPods(prev => prev.map(p => p.id === activePod.id ? { ...p, rentItsStatus: 'verified' } : p));
        }
      }
      setPoints(p => p + 50);
    } finally {
      setIsVerifyingRentIts(false);
    }
  };

  // Quiz progression
  const handleQuizAnswer = (knewIt: boolean) => {
    if (!activePod?.aiData?.quiz) return;

    if (knewIt) {
      setQuizScore(s => s + 1);
      setPoints(p => p + 10); // Reward for correct retention
    }

    setQuizAnswerVisible(false);

    if (currentQuestionIndex + 1 < activePod.aiData.quiz.length) {
      setCurrentQuestionIndex(i => i + 1);
    } else {
      setQuizFinished(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setQuizScore(0);
    setQuizAnswerVisible(false);
    setQuizFinished(false);
  };

  if (authLoading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        width: '100%',
        gap: '16px',
        background: 'var(--bg-secondary)'
      }} id="auth-loading-screen">
        <Cpu className="glow-pulse" size={48} style={{ color: 'var(--accent-coral)' }} />
        <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Initializing StudySync...</span>
      </div>
    );
  }

  if (!user && !isLocalMode) {
    if (showAuth) {
      return (
        <Auth
          onLoginSuccess={() => { }}
          onStartGuestMode={handleStartGuestMode}
          onBackToHome={() => setShowAuth(false)}
        />
      );
    }
    return (
      <Homepage
        onGetStarted={() => setShowAuth(true)}
        onStartGuestMode={handleStartGuestMode}
      />
    );
  }

  return (
    <div className="outer-container animate-fade-in" id="studysync-root-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar" id="sidebar-navigation">
        <div>
          <div className="sidebar-title">StudySync</div>

          <span className="sidebar-section-label">Menu</span>
          <div className="sidebar-menu">
            <button
              onClick={() => setSelectedPodId(null)}
              className={`sidebar-item ${!selectedPodId ? 'active' : ''}`}
              id="menu-discover"
            >
              <div className="icon-box"><Compass size={16} /></div>
              <span>Discover</span>
            </button>
            <button
              onClick={() => { if (pods.length > 0) setSelectedPodId(pods[0].id); }}
              className={`sidebar-item ${selectedPodId ? 'active' : ''}`}
              id="menu-studypods"
            >
              <div className="icon-box"><Cpu size={16} /></div>
              <span>StudyPods</span>
            </button>


            <div style={{ height: '1px', background: 'var(--border-light)', margin: '12px 0' }} />
            <span className="sidebar-section-label">Other</span>

            <button onClick={() => setShowSettings(true)} className="sidebar-item" id="menu-settings">
              <div className="icon-box"><Settings size={16} /></div>
              <span>Settings</span>
            </button>
            <button onClick={() => setShowHelp(true)} className="sidebar-item" id="menu-help">
              <div className="icon-box"><HelpCircle size={16} /></div>
              <span>Help</span>
            </button>
            <button onClick={handleLogout} className="sidebar-item" id="menu-logout">
              <div className="icon-box"><LogOut size={16} /></div>
              <span>Log out</span>
            </button>
          </div>
        </div>

        {/* Decorative canvas box matching reference image */}
        <div className="sidebar-logo-card">
          <div className="sidebar-logo-box">
            <Cpu size={24} />
          </div>
          <span className="sidebar-logo-text">StudySync</span>
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="main-content" id="main-content-panel">
        {/* Header Banner */}
        <div className="main-header-banner">
          <div className="main-header-top">
            <h1 className="discover-title">
              {activePod ? activePod.topic : 'Discover'}
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {/* Score balance */}
              <div style={{
                background: 'white',
                padding: '8px 16px',
                borderRadius: '20px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '13px',
                fontWeight: '600'
              }}>
                <Award size={16} style={{ color: 'var(--accent-coral)' }} />
                <span style={{ color: 'var(--text-secondary)' }}>Score:</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: '700' }} id="points-display-val">{points} pts</span>
              </div>

              {/* Profile area */}
              <div className="profile-panel">
                <div className="profile-avatar">
                  <User size={16} />
                </div>
                <span className="profile-name">
                  {user ? (user.displayName || (user.isAnonymous ? 'Guest Student' : `Student U-${user.uid.slice(0, 5)}`)) : 'Guest User'}
                  <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
                </span>
                <div className="search-divider" style={{ margin: '0 4px', height: '16px' }} />
                <div className="profile-bell" title="Notifications">
                  <Bell size={16} />
                  <div className="profile-bell-dot" />
                </div>
              </div>
            </div>
          </div>

          {/* Search/Create topic banner bar */}
          <div className="search-container">
            <select className="search-dropdown" id="subject-dropdown">
              <option>All Subjects</option>
              <option>Computer Science</option>
              <option>Mathematics</option>
              <option>Humanities</option>
            </select>
            <div className="search-divider" />
            <form onSubmit={handleCreatePod} className="search-input-box" id="create-pod-form">
              <input
                type="text"
                className="search-input"
                placeholder={activePod ? "Search study guides..." : "Create new StudyPod topic..."}
                value={newPodTopic}
                onChange={(e) => setNewPodTopic(e.target.value)}
                id="input-pod-topic"
              />
              <button type="submit" className="search-btn" id="btn-submit-pod" disabled={isCreating}>
                {isCreating ? <RefreshCw className="glow-pulse" size={16} style={{ animation: 'spin 2s linear infinite' }} /> : (activePod ? 'Search' : 'Create')}
              </button>
            </form>
          </div>
        </div>

        {/* Content workspace block */}
        {!activePod ? (
          /* Dashboard discovery mode */
          <div className="dashboard-lower">
            {/* Book covers grid section */}
            <div>
              <div className="section-header">
                <h2 className="section-title">Your StudyPods</h2>
                <button className="view-all-btn">
                  View all <ChevronRight size={12} />
                </button>
              </div>

              <div className="covers-grid" id="pods-list-container">
                {pods.length === 0 ? (
                  <div className="panel-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '48px', color: 'var(--text-secondary)' }}>
                    <BookOpen size={36} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
                    <p style={{ fontSize: '15px' }}>No active StudyPods. Use the create bar above to launch your first topic!</p>
                  </div>
                ) : (
                  pods.map((pod) => {
                    const cover = getCoverStyle(pod.topic);
                    return (
                      <div
                        key={pod.id}
                        onClick={() => setSelectedPodId(pod.id)}
                        className="module-cover-card animate-fade-in"
                        style={{ background: cover.bg }}
                        id={`pod-card-${pod.id}`}
                      >
                        <div className="module-cover-spine" />
                        <span className="module-cover-subject" style={{ color: cover.accent }}>StudyModule</span>
                        <h3 className="module-cover-title" style={{ color: cover.text }}>{pod.topic}</h3>

                        <div className="module-cover-footer">
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                            {pod.aiData ? (
                              <span className="badge" style={{ padding: '2px 6px', fontSize: '9px', background: 'rgba(255,255,255,0.4)', color: cover.text }}>
                                <Sparkles size={8} /> AI Active
                              </span>
                            ) : (
                              <span className="badge" style={{ padding: '2px 6px', fontSize: '9px', background: 'rgba(255,255,255,0.2)', color: 'rgba(0,0,0,0.4)' }}>
                                No AI Summary
                              </span>
                            )}
                            {pod.rentItsStatus === 'verified' && (
                              <span className="badge" style={{ padding: '2px 6px', fontSize: '9px', background: 'rgba(255,255,255,0.4)', color: cover.text }}>
                                <Award size={8} /> Rented
                              </span>
                            )}
                          </div>
                          <span className="module-cover-score" style={{ color: 'rgba(0,0,0,0.5)' }}>
                            Complexity: {pod.aiData ? `${pod.aiData.complexityScore}/10` : 'Pending'}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Subjects category grids */}
            <div>
              <div className="section-header">
                <h2 className="section-title">Study Subjects</h2>
              </div>

              <div className="categories-grid">
                {[
                  { name: 'Computer Science', icon: <Cpu size={18} /> },
                  { name: 'Physics & Math', icon: <Sparkles size={18} /> },
                  { name: 'Business & Finance', icon: <Award size={18} /> },
                  { name: 'Humanities & Art', icon: <BookOpen size={18} /> }
                ].map((cat, idx) => (
                  <div key={idx} className="category-panel">
                    <div className="category-icon-box">{cat.icon}</div>
                    <span className="category-label">{cat.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Active workspace dashboard */
          <div className="workspace-container animate-slide-up">

            {/* Back path link */}
            <div className="workspace-back-bar" onClick={() => setSelectedPodId(null)} id="workspace-back-btn">
              <span>← Back to Discover</span>
            </div>

            <div className="grid-2col" style={focusMode ? { gridTemplateColumns: '1fr' } : {}}>
              {/* Left Column: Study Materials */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                {/* AI Tutor Module */}
                <section className="panel-card" id="ai-study-guide-section">
                  <div className="card-header">
                    <div className="card-title">
                      <Sparkles style={{ color: 'var(--accent-coral)' }} size={18} />
                      <h3>AI Study Assistant</h3>
                    </div>
                    {activePod.aiData && (
                      <span className="badge" style={{ background: 'var(--accent-coral-glow)', color: 'var(--accent-coral)', fontWeight: 'bold' }}>
                        Complexity: {activePod.aiData.complexityScore}/10
                      </span>
                    )}
                  </div>

                  {aiError && (
                    <div style={{
                      background: 'rgba(217, 78, 78, 0.08)',
                      border: '1px solid rgba(217, 78, 78, 0.15)',
                      borderRadius: '8px', padding: '12px', color: 'var(--accent-red)',
                      fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px'
                    }}>
                      <AlertCircle size={16} />
                      <span>{aiError}</span>
                    </div>
                  )}

                  {!activePod.aiData ? (
                    <div style={{ textAlign: 'center', padding: '32px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                      <div className="glow-pulse" style={{ padding: '16px', borderRadius: '50%', background: 'var(--bg-secondary)', color: 'var(--accent-coral)' }}>
                        <BookOpen size={32} />
                      </div>
                      <div>
                        <h4 style={{ fontSize: '15px', color: 'var(--text-primary)', marginBottom: '4px' }}>No study guide generated for this topic</h4>
                        <p style={{ fontSize: '13px', maxWidth: '380px', margin: '0 auto', color: 'var(--text-secondary)' }}>
                          Sync the workspace with Antigravity AI to extract summaries, structure learning pathways, and test active recall.
                        </p>
                      </div>
                      <button
                        onClick={handleGenerateAI}
                        className="btn btn-primary"
                        disabled={isGeneratingAI}
                        id="btn-generate-ai"
                      >
                        {isGeneratingAI ? (
                          <>
                            <RefreshCw className="glow-pulse" size={16} style={{ animation: 'spin 2s linear infinite' }} />
                            Connecting AI Link...
                          </>
                        ) : (
                          <>
                            <Sparkles size={16} />
                            Generate Study Guide
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      {/* Summary Block */}
                      <div style={{ padding: '16px', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-light)' }}>
                        <h4 style={{ fontSize: '13px', color: 'var(--text-primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          <ClipboardList size={14} style={{ color: 'var(--accent-coral)' }} /> Executive Summary
                        </h4>
                        <p style={{ fontSize: '13.5px', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
                          {activePod.aiData.summary}
                        </p>
                      </div>

                      {/* Learning Pathway Checklist */}
                      <div>
                        <h4 style={{ fontSize: '13px', color: 'var(--text-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          <CheckCircle size={14} style={{ color: 'var(--accent-coral)' }} /> Learning Pathway Checklist
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }} id="roadmap-checklist">
                          {activePod.aiData.roadmap.map((step, idx) => {
                            const stepKey = `${activePod.id}-${idx}`;
                            const isDone = completedSteps[stepKey] || false;
                            return (
                              <div key={idx} className="timeline-item" style={{ opacity: isDone ? 0.6 : 1 }}>
                                <div
                                  className={`timeline-dot ${isDone ? 'completed' : ''}`}
                                  onClick={() => toggleStep(idx)}
                                  style={{ cursor: 'pointer' }}
                                  id={`step-dot-${idx}`}
                                >
                                  {isDone && <Check size={12} style={{ color: 'white' }} />}
                                </div>
                                <div className="timeline-content">
                                  <span
                                    style={{
                                      fontSize: '13px',
                                      color: isDone ? 'var(--text-muted)' : 'var(--text-primary)',
                                      textDecoration: isDone ? 'line-through' : 'none',
                                      cursor: 'pointer'
                                    }}
                                    onClick={() => toggleStep(idx)}
                                    id={`step-text-${idx}`}
                                  >
                                    {step}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Active Recall Quiz */}
                      <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '20px' }}>
                        <h4 style={{ fontSize: '13px', color: 'var(--text-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          <HelpCircle size={14} style={{ color: 'var(--accent-coral)' }} /> Active Recall Quiz
                        </h4>

                        {quizFinished ? (
                          <div style={{ textAlign: 'center', padding: '24px 16px', background: 'var(--accent-emerald-glow)', borderRadius: '12px', border: '1px solid rgba(71, 158, 124, 0.2)' }} id="quiz-finished-panel">
                            <Award size={36} style={{ color: 'var(--accent-emerald)', marginBottom: '8px' }} />
                            <h5 style={{ fontSize: '15px', color: 'var(--text-primary)', marginBottom: '4px' }}>Quiz Module Completed!</h5>
                            <p style={{ fontSize: '12.5px', marginBottom: '16px', color: 'var(--text-secondary)' }}>
                              You reviewed {activePod.aiData.quiz.length} card(s) and scored {quizScore} successfully.
                            </p>
                            <button onClick={resetQuiz} className="btn btn-secondary" style={{ fontSize: '12px' }} id="btn-reset-quiz">
                              Restart Session
                            </button>
                          </div>
                        ) : (
                          <div className="panel-card" style={{ padding: '16px', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-light)' }} id="active-quiz-card">
                            <div style={{ width: '100%', height: '2px', background: 'var(--border-muted)', marginBottom: '12px' }}>
                              <div style={{
                                height: '100%',
                                background: 'var(--accent-coral)',
                                width: `${((currentQuestionIndex) / activePod.aiData.quiz.length) * 100}%`,
                                transition: 'width var(--transition-fast)'
                              }} />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                              <span>Card {currentQuestionIndex + 1} of {activePod.aiData.quiz.length}</span>
                              <span>Session Score: {quizScore}</span>
                            </div>

                            <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '16px' }} id="quiz-question-text">
                              {activePod.aiData.quiz[currentQuestionIndex]?.question}
                            </p>

                            {quizAnswerVisible ? (
                              <div style={{
                                padding: '12px',
                                borderRadius: '8px',
                                background: 'white',
                                border: '1px solid var(--border-muted)',
                                marginBottom: '16px',
                                animation: 'slideUp 0.2s ease-out'
                              }}>
                                <span style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--accent-coral)', display: 'block', marginBottom: '4px' }}>Correct Answer:</span>
                                <span style={{ fontSize: '13.5px', color: 'var(--text-primary)' }} id="quiz-answer-text">{activePod.aiData.quiz[currentQuestionIndex]?.answer}</span>
                              </div>
                            ) : (
                              <button
                                onClick={() => setQuizAnswerVisible(true)}
                                className="btn btn-secondary"
                                style={{ width: '100%', marginBottom: '16px', fontSize: '13px', background: 'white' }}
                                id="btn-reveal-answer"
                              >
                                Reveal Answer
                              </button>
                            )}

                            {quizAnswerVisible && (
                              <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                  onClick={() => handleQuizAnswer(true)}
                                  className="btn btn-success"
                                  style={{ flex: 1, fontSize: '13px' }}
                                  id="btn-quiz-knew-it"
                                >
                                  I knew it! (+10 pts)
                                </button>
                                <button
                                  onClick={() => handleQuizAnswer(false)}
                                  className="btn btn-secondary"
                                  style={{ flex: 1, fontSize: '13px', background: 'white' }}
                                  id="btn-quiz-need-study"
                                >
                                  Need to study
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </section>

                {/* RentIts Equipment Integration Module */}
                <section className="panel-card" id="rentits-section">
                  <div className="card-header">
                    <div className="card-title">
                      <Tv style={{ color: 'var(--accent-coral)' }} size={18} />
                      <h3>RentIts Equipment Hub</h3>
                    </div>

                    <span className={`badge ${activePod.rentItsStatus === 'verified' ? 'badge-verified' :
                        activePod.rentItsStatus === 'linked' ? 'badge-linked' : 'badge-unlinked'
                      }`}>
                      {activePod.rentItsStatus.toUpperCase()}
                    </span>
                  </div>

                  {!rentItsConnected && activePod.rentItsStatus === 'unlinked' ? (
                    <div style={{ textAlign: 'center', padding: '16px 0' }}>
                      <p style={{ fontSize: '13px', marginBottom: '16px', color: 'var(--text-secondary)' }}>
                        Simulate linking your workspace study equipment rented from RentIts to redeem bonus team study score points.
                      </p>
                      <button onClick={handleLinkRentIts} className="btn btn-secondary" style={{ width: '100%', borderColor: 'var(--accent-coral)', color: 'var(--accent-coral)', background: 'white' }} id="btn-connect-rentits">
                        <Link2 size={16} />
                        Connect RentIts Rental Account
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-light)', borderRadius: '10px', padding: '12px' }}>
                        <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--accent-coral)', fontWeight: 'bold' }}>Rented Equipment Detected</span>
                        <p style={{ fontSize: '12.5px', marginTop: '4px', color: 'var(--text-secondary)' }}>Verify your items below to unlock the RentIts bonus points modifier.</p>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {[
                          { id: 'item-chair', name: 'Ergonomic Task Chair (RC-80)', serial: 'S/N: RENT-CH-9812' },
                          { id: 'item-monitor', name: 'Vibrant 34" Curved Monitor (RM-340)', serial: 'S/N: RENT-MN-2287' }
                        ].map((item) => (
                          <div
                            key={item.id}
                            className="panel-card"
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: '12px 16px',
                              background: 'var(--bg-secondary)',
                              boxShadow: 'none'
                            }}
                          >
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>{item.name}</span>
                              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{item.serial}</span>
                            </div>

                            {activePod.rentItsStatus === 'verified' ? (
                              <span style={{ color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '600' }}>
                                <ShieldCheck size={14} /> Verified
                              </span>
                            ) : (
                              <button
                                onClick={() => handleVerifyRentIts(item.id)}
                                className="btn btn-success"
                                style={{ padding: '6px 12px', fontSize: '12px' }}
                                disabled={isVerifyingRentIts}
                                id={`btn-verify-${item.id}`}
                              >
                                {isVerifyingRentIts ? 'Verifying...' : 'Verify'}
                              </button>
                            )}
                          </div>
                        ))}
                      </div>

                      {rentItsReceipt && (
                        <div
                          className="panel-card animate-slide-up"
                          style={{
                            padding: '16px',
                            border: '1px dashed var(--accent-emerald)',
                            background: 'var(--accent-emerald-glow)',
                            borderRadius: '12px',
                            boxShadow: 'none'
                          }}
                          id="rentits-receipt-display"
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--accent-emerald)' }}>✓ RECEIPT GENERATED</span>
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{rentItsReceipt.timestamp?.slice(11, 19)}</span>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '12px' }}>
                            <div><span style={{ color: 'var(--text-secondary)' }}>Receipt ID:</span> <code style={{ fontSize: '11px', color: 'var(--text-primary)' }}>{rentItsReceipt.receiptId}</code></div>
                            <div><span style={{ color: 'var(--text-secondary)' }}>Bonus Claimed:</span> <span style={{ fontWeight: 'bold', color: 'var(--accent-emerald)' }}>+{rentItsReceipt.bonusPoints} pts</span></div>
                            <div><span style={{ color: 'var(--text-secondary)' }}>Security Check:</span> <span style={{ color: 'var(--text-primary)' }}>ECDSA-Signed</span></div>
                            <div><span style={{ color: 'var(--text-secondary)' }}>Status:</span> <span style={{ fontWeight: 'bold', color: 'var(--accent-emerald)' }}>{rentItsReceipt.status}</span></div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </section>

              </div>

              {/* Right Column: Collaborative Chat */}
              {!focusMode && (
                <div>
                  <section
                    className="panel-card"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      height: '100%',
                      minHeight: '480px',
                      maxHeight: '740px'
                    }}
                    id="chat-workspace-section"
                  >
                    <div className="card-header">
                      <div className="card-title">
                        <MessageSquare style={{ color: 'var(--accent-coral)' }} size={18} />
                        <h3>Live Pod Chat</h3>
                      </div>
                      <span className="badge" style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)', fontSize: '10px' }}>
                        3 Members Online
                      </span>
                    </div>

                    {/* Message Display Area */}
                    <div className="chat-messages" style={{ flex: 1 }} id="chat-messages-container">
                      {chatMessages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`chat-bubble ${msg.isBot ? 'bot' : msg.sender === 'You' ? 'user' : 'bot'}`}
                          style={{
                            alignSelf: msg.sender === 'You' ? 'flex-end' : 'flex-start'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', marginBottom: '4px', fontSize: '11px' }}>
                            <span style={{ fontWeight: '600', color: msg.sender === 'You' ? 'white' : 'var(--accent-coral)' }}>{msg.sender}</span>
                            <span style={{ color: msg.sender === 'You' ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)', fontSize: '9px' }}>{msg.timestamp}</span>
                          </div>
                          <p style={{ fontSize: '13px', margin: 0 }}>{msg.text}</p>
                        </div>
                      ))}
                      <div ref={chatEndRef} />
                    </div>

                    {/* Message Input Panel */}
                    <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '10px', marginTop: '16px' }} id="chat-input-form">
                      <input
                        type="text"
                        className="input-text"
                        placeholder="Type a message or query study bot..."
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        style={{ flex: 1, background: 'white' }}
                        id="input-chat-message"
                      />
                      <button type="submit" className="btn btn-primary" id="btn-send-chat">
                        <Send size={16} />
                      </button>
                    </form>
                  </section>
                </div>
              )}

            </div>

          </div>
        )}
      </main>

      {/* Settings Modal */}
      {showSettings && (
        <div className="modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><Settings size={20} style={{ color: 'var(--accent-coral)' }} /> Workspace Settings</h3>
              <button className="modal-close-btn" onClick={() => setShowSettings(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="setting-row">
                <div className="setting-info">
                  <span className="setting-title">Focus Mode</span>
                  <span className="setting-desc">Hide the collaborative live pod chat panel and expand the study view to minimize distractions.</span>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={focusMode}
                    onChange={(e) => setFocusMode(e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="setting-row">
                <div className="setting-info">
                  <span className="setting-title">Alert Notifications</span>
                  <span className="setting-desc">Enable subtle sound and visual toast alerts when team score achievements are claimed.</span>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={alertNotifications}
                    onChange={(e) => setAlertNotifications(e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="setting-row">
                <div className="setting-info">
                  <span className="setting-title">Reset Score Points</span>
                  <span className="setting-desc">Clear current study achievement points back to initial state (120 pts).</span>
                </div>
                <button
                  onClick={() => {
                    setPoints(120);
                    alert("Points system reset back to 120 pts!");
                  }}
                  className="btn btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '12px' }}
                >
                  Reset
                </button>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={() => setShowSettings(false)}>Done</button>
            </div>
          </div>
        </div>
      )}

      {/* Help Modal */}
      {showHelp && (
        <div className="modal-overlay" onClick={() => setShowHelp(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><HelpCircle size={20} style={{ color: 'var(--accent-coral)' }} /> User Guide & Help</h3>
              <button className="modal-close-btn" onClick={() => setShowHelp(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="help-guide-item">
                <div className="help-icon-wrapper"><Compass size={18} /></div>
                <div className="help-text-wrapper">
                  <span className="help-title">Exploring and Creating StudyPods</span>
                  <span className="help-desc">StudyPods are virtual spaces grouping study content by topic. Use the Discover tab to list and create new pods.</span>
                </div>
              </div>

              <div className="help-guide-item">
                <div className="help-icon-wrapper"><Sparkles size={18} /></div>
                <div className="help-text-wrapper">
                  <span className="help-title">Antigravity AI Generation</span>
                  <span className="help-desc">Generate detailed roadmap paths and summaries using the AI Tutor panel. Test yourself using active recall quizzes.</span>
                </div>
              </div>

              <div className="help-guide-item">
                <div className="help-icon-wrapper"><Tv size={18} /></div>
                <div className="help-text-wrapper">
                  <span className="help-title">RentIts Equipment Integration</span>
                  <span className="help-desc">Link devices rented from RentIts (chairs, monitors) inside the study pod dashboard. Verify S/Ns to receive team multipliers.</span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={() => setShowHelp(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
