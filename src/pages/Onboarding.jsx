import { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  GraduationCap,
  Leaf,
  Sparkles,
} from 'lucide-react';

import { saveProfile } from '../services/profileStorage';
import '../styles/onboarding.css';

const initialProfile = {
  name: '',
  university: '',
  major: 'Artificial Intelligence',
  level: '3rd Year',
  language: 'bilingual',
  dailyStudyTime: '1 hour',
  examDate: '',
};

const steps = [
  'Welcome',
  'About You',
  'Preferences',
  'Exam',
  'Ready',
];

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState(initialProfile);
  const [error, setError] = useState('');

  function updateProfile(field, value) {
    setProfile((current) => ({
      ...current,
      [field]: value,
    }));

    setError('');
  }

  function goNext() {
    if (step === 1 && !profile.name.trim()) {
      setError('Please enter your name.');
      return;
    }

    if (step < steps.length - 1) {
      setStep((current) => current + 1);
    }
  }

  function goBack() {
    if (step > 0) {
      setStep((current) => current - 1);
      setError('');
    }
  }

  function finishOnboarding() {
    const completedProfile = {
      ...profile,
      name: profile.name.trim() || 'Student',
      university: profile.university.trim(),
      createdAt: new Date().toISOString(),
      garden: {
        level: 1,
        water: 0,
        plants: 1,
        flowers: 0,
        streak: 0,
      },
    };

    saveProfile(completedProfile);
    onComplete(completedProfile);
  }

  return (
    <main className="onboarding-page">
      <section className="onboarding-shell">
        <div className="onboarding-progress">
          {steps.map((label, index) => (
            <div
              className={`onboarding-progress-item ${
                index <= step ? 'completed' : ''
              }`}
              key={label}
            >
              <span />
            </div>
          ))}
        </div>

        <article className="onboarding-card">
          {step === 0 && (
            <section className="onboarding-welcome">
              <div className="onboarding-logo">
                <GraduationCap />
              </div>

              <span className="onboarding-eyebrow">
                Multi-Agent Learning Platform
              </span>

              <h1>StudyPilot AI</h1>

              <p>
                Turn your lecture PDFs into explanations, quizzes,
                flashcards, study plans, and a growing learning garden.
              </p>

              <div className="onboarding-slogan">
                <Leaf />
                Study Smarter. Grow Every Day.
              </div>
            </section>
          )}

          {step === 1 && (
            <section>
              <span className="onboarding-eyebrow">Step 1</span>
              <h2>Tell us about yourself</h2>
              <p className="onboarding-description">
                We will personalize your dashboard and learning plan.
              </p>

              <div className="onboarding-fields">
                <label>
                  Your name
                  <input
                    autoFocus
                    placeholder="e.g. Reman"
                    value={profile.name}
                    onChange={(event) =>
                      updateProfile('name', event.target.value)
                    }
                  />
                </label>

                <label>
                  University
                  <input
                    placeholder="e.g. Taibah University"
                    value={profile.university}
                    onChange={(event) =>
                      updateProfile('university', event.target.value)
                    }
                  />
                </label>

                <label>
                  Major
                  <input
                    placeholder="e.g. Artificial Intelligence"
                    value={profile.major}
                    onChange={(event) =>
                      updateProfile('major', event.target.value)
                    }
                  />
                </label>

                <label>
                  Academic level
                  <select
                    value={profile.level}
                    onChange={(event) =>
                      updateProfile('level', event.target.value)
                    }
                  >
                    <option>1st Year</option>
                    <option>2nd Year</option>
                    <option>3rd Year</option>
                    <option>4th Year</option>
                    <option>5th Year</option>
                    <option>Graduate Student</option>
                  </select>
                </label>
              </div>
            </section>
          )}

          {step === 2 && (
            <section>
              <span className="onboarding-eyebrow">Step 2</span>
              <h2>Choose your learning preferences</h2>
              <p className="onboarding-description">
                Nova will use these preferences when explaining your
                courses.
              </p>

              <div className="onboarding-option-group">
                <h3>Explanation language</h3>

                <div className="onboarding-options">
                  {[
                    ['ar', 'العربية', 'Arabic explanations'],
                    ['en', 'English', 'English explanations'],
                    [
                      'bilingual',
                      'Bilingual',
                      'Arabic with English technical terms',
                    ],
                  ].map(([value, title, description]) => (
                    <button
                      className={
                        profile.language === value ? 'selected' : ''
                      }
                      key={value}
                      onClick={() =>
                        updateProfile('language', value)
                      }
                      type="button"
                    >
                      <span>
                        <strong>{title}</strong>
                        <small>{description}</small>
                      </span>

                      {profile.language === value && <Check />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="onboarding-option-group">
                <h3>Daily study time</h3>

                <div className="onboarding-time-options">
                  {[
                    '30 minutes',
                    '1 hour',
                    '1.5 hours',
                    '2 hours',
                    '3+ hours',
                  ].map((time) => (
                    <button
                      className={
                        profile.dailyStudyTime === time
                          ? 'selected'
                          : ''
                      }
                      key={time}
                      onClick={() =>
                        updateProfile('dailyStudyTime', time)
                      }
                      type="button"
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            </section>
          )}

          {step === 3 && (
            <section>
              <span className="onboarding-eyebrow">Step 3</span>
              <h2>When is your next exam?</h2>
              <p className="onboarding-description">
                Orbit Agent will use the date to build a realistic
                revision plan.
              </p>

              <div className="onboarding-exam">
                <BookOpen />

                <label>
                  Exam date
                  <input
                    type="date"
                    value={profile.examDate}
                    onChange={(event) =>
                      updateProfile('examDate', event.target.value)
                    }
                  />
                </label>

                <small>
                  You can skip this step and add an exam date later.
                </small>
              </div>
            </section>
          )}

          {step === 4 && (
            <section className="onboarding-ready">
              <div className="onboarding-ready-icon">
                <Sparkles />
              </div>

              <span className="onboarding-eyebrow">
                Your workspace is ready
              </span>

              <h2>Welcome, {profile.name || 'Student'}!</h2>

              <p>
                Nova and the specialized learning agents are ready to
                help you understand your first course.
              </p>

              <div className="onboarding-agent-list">
                {[
                  ['Nova', 'Orchestrator ready'],
                  ['Atlas', 'PDF analysis ready'],
                  ['Clarity', 'Explanations ready'],
                  ['Quanta', 'Quiz generation ready'],
                  ['Memory', 'Flashcards ready'],
                  ['Orbit', 'Study planning ready'],
                  ['Sentinel', 'Quality checks ready'],
                ].map(([agent, status]) => (
                  <div key={agent}>
                    <Check />
                    <span>
                      <strong>{agent}</strong>
                      <small>{status}</small>
                    </span>
                  </div>
                ))}
              </div>

              <div className="onboarding-garden-preview">
                <span>🌱</span>
                <div>
                  <strong>Your learning garden is ready</strong>
                  <small>
                    Every concept you master will help it grow.
                  </small>
                </div>
              </div>
            </section>
          )}

          {error && <p className="onboarding-error">{error}</p>}

          <footer className="onboarding-footer">
            {step > 0 && step < steps.length - 1 ? (
              <button
                className="onboarding-secondary-button"
                onClick={goBack}
                type="button"
              >
                <ArrowLeft />
                Back
              </button>
            ) : (
              <span />
            )}

            {step < steps.length - 1 ? (
              <button
                className="onboarding-primary-button"
                onClick={goNext}
                type="button"
              >
                {step === 0 ? 'Get Started' : 'Continue'}
                <ArrowRight />
              </button>
            ) : (
              <button
                className="onboarding-primary-button"
                onClick={finishOnboarding}
                type="button"
              >
                Start Learning
                <ArrowRight />
              </button>
            )}
          </footer>
        </article>
      </section>
    </main>
  );
}