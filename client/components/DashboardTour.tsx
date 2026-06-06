import React, { useState, useEffect } from 'react';
import Joyride, { CallBackProps, STATUS, Step, ACTIONS, EVENTS } from 'react-joyride';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

interface DashboardTourProps {
  userType?: 'student' | 'teacher';
}

export const DashboardTour: React.FC<DashboardTourProps> = ({ userType = 'student' }) => {
  const [runTour, setRunTour] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  // Check if user has seen the tour before
  useEffect(() => {
    const hasSeenTour = localStorage.getItem(`Campus Ops_tour_${userType}_completed`);
    if (!hasSeenTour) {
      // Optionally auto-start tour for first-time users after a delay
      // setTimeout(() => setRunTour(true), 1000);
    }
  }, [userType]);

  // Define tour steps based on user type
  const studentSteps: Step[] = [
    {
      target: 'body',
      title: '👋 Welcome to Campus Ops!',
      content: 'Let me show you around your dashboard! This quick tour will help you discover all the amazing features available to enhance your learning journey.',
      disableBeacon: true,
      placement: 'center',
    },
    {
      target: 'h1',
      title: '🎓 Your Dashboard Home',
      content: 'This is your command center! From here, you can access all your classes, assignments, tests, and learning resources. Everything you need is just a click away.',
      placement: 'bottom',
    },
    {
      target: '.min-h-screen > div:first-child',
      title: '🧭 Navigation Sidebar',
      content: 'Use the sidebar on the left to quickly navigate between My Classes, Tests, Calendar, AI Tutor, and more. Click any section to explore different features!',
      placement: 'right',
    },
    {
      target: '.grid.grid-cols-1.md\\:grid-cols-2.gap-6.mb-8',
      title: '🎯 Quick Action Cards',
      content: 'These interactive cards give you quick access to important features like assignments, lessons, quizzes, and career assessments. Click on any card to dive in!',
      placement: 'bottom',
    },
    {
      target: '.row-span-2.rounded-3xl.shadow-sm.border.border-gray-100.p-5.flex.flex-col.relative.overflow-hidden',
      title: '📄 Total Courses Enrolled',
      content: 'Upload any PDF and get instant AI-generated summaries, custom video lectures, mind maps, visuals, and curated resources. Transform any document into an interactive learning experience!',
      placement: 'left',
    },
    {
      target: '.row-span-2.col-start-2.row-start-1',
      title: '📚 Continue Learning',
      content: 'Pick up right where you left off! Track your lesson progress with the visual indicator and continue your learning journey with one click.',
      placement: 'left',
    },
    {
      target: '.row-span-2.col-start-1.row-start-3',
      title: '🎮 Quiz Time!',
      content: 'Test your knowledge with interactive quizzes! Level up your skills and earn badges as you master new concepts. Learning made fun!',
      placement: 'right',
    },
    {
      target: '.row-span-2.col-start-2.row-start-3',
      title: '📚 Study Resources',
      content: 'Access curated study materials, notes, and learning resources! Find everything you need to excel in your subjects — from textbooks to practice materials, all in one place.',
      placement: 'left',
    },
    {
      target: '.col-span-2.row-span-3.col-start-3.row-start-1.bg-white.rounded-3xl.shadow-sm.border-2',
      title: '🤖 AI Chatbot - Your Personal Tutor',
      content: 'Get personalized answers from our multilingual AI chatbot! Ask questions in your preferred language and receive instant, intelligent responses to help you learn better. Available 24/7 to support your learning journey!',
      placement: 'left',
    },
    {
      target: '.bg-white.rounded-3xl.shadow-sm.border.border-gray-200.p-6.flex.items-center.justify-between.overflow-hidden.relative',
      title: '🎯 My Courses Section',
      content: 'Identify your true potential through a personalized, data-driven evaluation of your skills, interests, and personality traits. Get detailed insights into suitable career paths that align your academic choices and personal strengths with future opportunities!',
      placement: 'top',
    },
    {
      target: '.col-span-2.col-start-3.row-start-4.bg-white.rounded-3xl.shadow-sm.border.border-gray-100.p-4',
      title: '🎓 Join Your Classroom',
      content: 'Want to join a new class? Click the "Join Class" button to get started!',
      placement: 'top',
      spotlightClicks: true,
    },
    {
      target: '#classCode',
      title: '📝 Enter Your Class Code',
      content: 'Now enter the class code provided by your teacher in this input field. Once you enter the code, click "Join Class" to instantly access all class materials, assignments, and resources!',
      placement: 'bottom',
      spotlightClicks: true,
    },
    {
      target: '.stats-cards',
      title: '📊 Your Progress Statistics',
      content: 'Track your learning journey with real-time stats — total classes, pending work, completed assignments, and classmates. Stay motivated by watching your progress grow!',
      placement: 'bottom',
    },
    {
      target: '.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3.xl\\:grid-cols-4.gap-6',
      title: '📚 Your Classes',
      content: 'All your enrolled classes in one place! Each card shows class details, upcoming assignments, and quick actions. Click on any class to view more details.',
      placement: 'top',
    },
  ];

  const teacherSteps: Step[] = [
    {
      target: 'body',
      title: '👋 Welcome Teacher!',
      content: 'Let me show you around your teaching dashboard! Discover powerful tools to manage classes, track student progress, and create engaging content.',
      disableBeacon: true,
      placement: 'center',
    },
    {
      target: 'h1',
      title: '🎓 Teacher Dashboard',
      content: 'Your central hub for all teaching activities. Access classrooms, analytics, test management, and AI-powered tools from here.',
      placement: 'bottom',
    },
    {
      target: '.min-h-screen > div:first-child',
      title: '🧭 Navigation Panel',
      content: 'Use the sidebar to navigate between Dashboard, Classrooms, Analytics, Tests, Calendar, and AI Lesson Studio. All your teaching tools in one place!',
      placement: 'right',
    },
  ];

  const steps = userType === 'teacher' ? teacherSteps : studentSteps;

  // Handle tour callbacks
  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, action, index, type } = data;

    if (([STATUS.FINISHED, STATUS.SKIPPED] as string[]).includes(status)) {
      // Tour completed or skipped
      setRunTour(false);
      setStepIndex(0);
      localStorage.setItem(`Campus Ops_tour_${userType}_completed`, 'true');

      // Show completion toast (optional)
      console.log("Tour completed! 🚀");
    } else if (([EVENTS.STEP_AFTER, EVENTS.TARGET_NOT_FOUND] as string[]).includes(type)) {
      // Update step index
      const nextStepIndex = index + (action === ACTIONS.PREV ? -1 : 1);
      setStepIndex(nextStepIndex);
    }
  };

  // Start tour handler
  const startTour = () => {
    setStepIndex(0);
    setRunTour(true);
  };

  // Reset tour (for testing or "show again")
  const resetTour = () => {
    localStorage.removeItem(`Campus Ops_tour_${userType}_completed`);
    startTour();
  };

  return (
    <>
      {/* Tour Trigger Button */}
      <Button
        onClick={startTour}
        className="hidden fixed top-4 md:top-24 right-2 md:right-6 z-40 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg text-xs md:text-sm px-2 md:px-3 h-8 md:h-9"
        size="sm"
      >
        <Sparkles className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
        <span className="hidden sm:inline">Let me show you around 👋</span>
        <span className="sm:hidden">Tour 👋</span>
      </Button>

      {/* Joyride Tour Component */}
      <Joyride
        steps={steps}
        run={runTour}
        stepIndex={stepIndex}
        continuous
        showProgress
        showSkipButton
        disableCloseOnEsc={false}
        hideCloseButton={false}
        callback={handleJoyrideCallback}
        debug={false}
        spotlightClicks={false}
        styles={{
          options: {
            arrowColor: '#fff',
            backgroundColor: '#fff',
            overlayColor: 'rgba(0, 0, 0, 0.6)',
            primaryColor: '#7c3aed',
            textColor: '#1f2937',
            width: 380,
            zIndex: 10000,
            beaconSize: 36,
          },
          tooltip: {
            borderRadius: 16,
            padding: 20,
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          },
          tooltipContainer: {
            textAlign: 'left',
          },
          tooltipTitle: {
            fontSize: '1.25rem',
            fontWeight: 700,
            marginBottom: 12,
            color: '#111827',
          },
          tooltipContent: {
            fontSize: '0.95rem',
            lineHeight: 1.6,
            color: '#4b5563',
            padding: '8px 0',
          },
          buttonNext: {
            backgroundColor: '#7c3aed',
            borderRadius: 8,
            fontSize: '0.9rem',
            fontWeight: 600,
            padding: '10px 20px',
            outline: 'none',
          },
          buttonBack: {
            color: '#6b7280',
            fontSize: '0.9rem',
            fontWeight: 600,
            marginRight: 12,
          },
          buttonSkip: {
            color: '#9ca3af',
            fontSize: '0.85rem',
          },
          spotlight: {
            borderRadius: 12,
          },
        }}
        locale={{
          back: '← Previous',
          close: 'Close',
          last: 'Got it! 🚀',
          next: 'Next →',
          skip: 'Skip tour',
        }}
        floaterProps={{
          disableAnimation: false,
          styles: {
            arrow: {
              length: 8,
              spread: 16,
            },
          },
        }}
        scrollToFirstStep
        scrollOffset={100}
        disableScrolling={false}
        disableOverlayClose
      />
    </>
  );
};

export default DashboardTour;
