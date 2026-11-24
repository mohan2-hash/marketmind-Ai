import React, { useState, useEffect } from 'react';
import { learningApi } from '../services/api';
import { LearningModule } from '../types';
import { GraduationCap, BookOpen, CheckCircle2, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

export const LearningPage: React.FC = () => {
  const [modules, setModules] = useState<LearningModule[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedModule, setSelectedModule] = useState<string>('module-1');

  // Quiz state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [submittedQuiz, setSubmittedQuiz] = useState<boolean>(false);

  useEffect(() => {
    const loadModules = async () => {
      setLoading(true);
      try {
        const data = await learningApi.getModules();
        setModules(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadModules();
  }, []);

  const activeMod = modules.find((m) => m.id === selectedModule) || modules[0];

  const handleSelectOption = (qIdx: number, optIdx: number) => {
    if (!submittedQuiz) {
      setSelectedAnswers({ ...selectedAnswers, [qIdx]: optIdx });
    }
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setSubmittedQuiz(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-brand-cyan" />
          <span>Financial Learning &amp; Quantitative Academy</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Structured courses, interactive conceptual breakdowns, and quizzes for beginners and experienced investors
        </p>
      </div>

      {loading ? (
        <div className="py-24 text-center">
          <div className="w-8 h-8 border-2 border-brand-cyan border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <span className="text-xs text-slate-400 font-mono">Loading Course Curriculum...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Module Selector Sidebar */}
          <div className="bg-navy-900 border border-navy-800 rounded-2xl p-4 space-y-2 shadow-xl">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block px-2 mb-2">
              CURRICULUM MODULES
            </span>
            {modules.map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  setSelectedModule(m.id);
                  handleResetQuiz();
                }}
                className={`w-full text-left p-3 rounded-xl text-xs font-semibold transition-all ${
                  selectedModule === m.id
                    ? 'bg-brand-blue text-white shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-navy-850'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono text-slate-400">{m.category}</span>
                  <span className="text-[10px] font-mono text-slate-300">{m.duration}</span>
                </div>
                <span className="block text-sm">{m.title}</span>
              </button>
            ))}
          </div>

          {/* Module Content */}
          {activeMod && (
            <div className="lg:col-span-3 space-y-6">
              {/* Module Header */}
              <div className="bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between gap-4 mb-2">
                  <span className="text-xs font-mono text-brand-cyan font-bold">{activeMod.category} • {activeMod.level}</span>
                  <span className="text-xs font-mono text-slate-400">{activeMod.duration}</span>
                </div>
                <h2 className="text-xl font-bold text-white mb-2">{activeMod.title}</h2>
                <p className="text-xs text-slate-400 leading-relaxed">{activeMod.description}</p>
              </div>

              {/* Lessons */}
              <div className="space-y-4">
                {activeMod.lessons.map((lesson, idx) => (
                  <div key={lesson.id} className="bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-lg">
                    <span className="text-xs font-mono text-brand-blue font-bold block mb-1">
                      LESSON {idx + 1}
                    </span>
                    <h3 className="text-base font-bold text-white mb-3">{lesson.title}</h3>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">{lesson.content}</p>
                  </div>
                ))}
              </div>

              {/* Interactive Quiz */}
              {activeMod.quiz && activeMod.quiz.length > 0 && (
                <div className="bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-xl space-y-6">
                  <div className="flex items-center justify-between pb-3 border-b border-navy-800">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-brand-cyan" />
                      <span>Interactive Knowledge Check</span>
                    </h3>
                    {submittedQuiz && (
                      <button
                        onClick={handleResetQuiz}
                        className="text-xs text-brand-cyan hover:underline font-mono"
                      >
                        Retake Quiz
                      </button>
                    )}
                  </div>

                  {activeMod.quiz.map((q, qIdx) => {
                    const chosen = selectedAnswers[qIdx];
                    const isCorrect = chosen === q.answer_index;
                    return (
                      <div key={qIdx} className="space-y-3">
                        <span className="text-xs font-bold text-white block">
                          Question {qIdx + 1}: {q.question}
                        </span>

                        <div className="space-y-2">
                          {q.options.map((opt, optIdx) => {
                            let optClass = 'bg-navy-950 border-navy-800 text-slate-300 hover:border-brand-blue';
                            if (submittedQuiz) {
                              if (optIdx === q.answer_index) {
                                optClass = 'bg-gain/20 border-gain text-gain font-bold';
                              } else if (chosen === optIdx) {
                                optClass = 'bg-loss/20 border-loss text-loss';
                              }
                            } else if (chosen === optIdx) {
                              optClass = 'bg-brand-blue/20 border-brand-blue text-brand-cyan font-semibold';
                            }

                            return (
                              <div
                                key={optIdx}
                                onClick={() => handleSelectOption(qIdx, optIdx)}
                                className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${optClass}`}
                              >
                                <span>{opt}</span>
                                {submittedQuiz && optIdx === q.answer_index && (
                                  <CheckCircle2 className="w-4 h-4 text-gain" />
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {submittedQuiz && (
                          <div className={`p-3 rounded-xl text-xs ${isCorrect ? 'bg-gain/10 text-gain' : 'bg-amber-500/10 text-amber-400'}`}>
                            <span className="font-bold block mb-1">{isCorrect ? 'Correct!' : 'Explanation:'}</span>
                            <span>{q.explanation}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {!submittedQuiz && (
                    <button
                      onClick={() => setSubmittedQuiz(true)}
                      className="w-full py-2.5 rounded-xl bg-brand-blue hover:bg-blue-600 text-white font-bold text-xs shadow-md shadow-brand-blue/20 transition-all"
                    >
                      Submit Answers
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
