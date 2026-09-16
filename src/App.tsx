/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ExamProvider, useExam } from './context/ExamContext';
import { Header } from './components/Header';
import { StudentPortal } from './components/student/StudentPortal';
import { ExamTakingView } from './components/student/ExamTakingView';
import { ProctorDashboard } from './components/proctor/ProctorDashboard';
import { DetailedReportView } from './components/reports/DetailedReportView';

const MainContent: React.FC = () => {
  const { activeRole, studentSessionStatus } = useExam();

  return (
    <main className="flex-1">
      {activeRole === 'student' && (
        studentSessionStatus === 'taking' ? <ExamTakingView /> : <StudentPortal />
      )}
      {activeRole === 'proctor' && <ProctorDashboard />}
      {activeRole === 'report' && <DetailedReportView />}
    </main>
  );
};

export default function App() {
  return (
    <ExamProvider>
      <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 font-sans selection:bg-indigo-500 selection:text-white">
        <Header />
        <MainContent />
      </div>
    </ExamProvider>
  );
}

