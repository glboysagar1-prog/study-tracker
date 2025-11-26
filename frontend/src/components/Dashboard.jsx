import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import { API_BASE_URL } from '../config/api';

const Dashboard = () => {
  const [subjects, setSubjects] = useState([]);
  const [stats, setStats] = useState({
    topicsCompleted: 42,
    totalXP: 2850,
    testsCompleted: 12,
    streak: 7
  });

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/subjects?semester=4`);
      const data = await response.json();
      if (data.subjects) {
        setSubjects(data.subjects.slice(0, 3)); // Show top 3 subjects
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Welcome back, Sagar! <span className="animate-wave inline-block">👋</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">
            You've completed 3 topics today. Keep up the great work!
          </p>
        </div>
        <div className="flex gap-3">
          <button className="p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm hover:shadow-md">
            <span className="material-icons text-xl">search</span>
          </button>
          <button className="p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm hover:shadow-md">
            <span className="material-icons text-xl">notifications</span>
          </button>
          <Link to="/mock-tests/1">
            <button className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all transform hover:-translate-y-0.5">
              <span className="material-icons text-xl">add</span>
              <span>Start Test</span>
            </button>
          </Link>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Stat Card 1 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all duration-300 group">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1 group-hover:text-indigo-600 transition-colors">
                {stats.topicsCompleted}
              </div>
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Topics Mastered</div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
              <span className="material-icons text-2xl">school</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-lg w-fit">
            <span className="material-icons text-sm">trending_up</span>
            <span>+12% this week</span>
          </div>
        </div>

        {/* Stat Card 2 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all duration-300 group">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1 group-hover:text-amber-500 transition-colors">
                {stats.totalXP.toLocaleString()}
              </div>
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Total XP Earned</div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center text-amber-500 dark:text-amber-400 group-hover:scale-110 transition-transform">
              <span className="material-icons text-2xl">emoji_events</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-lg w-fit">
            <span className="material-icons text-sm">trending_up</span>
            <span>+350 XP today</span>
          </div>
        </div>

        {/* Stat Card 3 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all duration-300 group">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1 group-hover:text-blue-500 transition-colors">
                {stats.testsCompleted}<span className="text-lg text-gray-400 font-normal">/15</span>
              </div>
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Tests Completed</div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-500 dark:text-blue-400 group-hover:scale-110 transition-transform">
              <span className="material-icons text-2xl">assignment_turned_in</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-lg w-fit">
            <span className="material-icons text-sm">trending_up</span>
            <span>Avg: 85%</span>
          </div>
        </div>

        {/* Stat Card 4 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all duration-300 group">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1 group-hover:text-rose-500 transition-colors">
                {stats.streak} <span className="text-lg text-gray-400 font-normal">Days</span>
              </div>
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Study Streak</div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center text-rose-500 dark:text-rose-400 group-hover:scale-110 transition-transform">
              <span className="material-icons text-2xl">local_fire_department</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-lg w-fit">
            <span className="material-icons text-sm">trending_up</span>
            <span>Personal best!</span>
          </div>
        </div>
      </div>

      {/* Continue Learning Section */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Continue Learning</h2>
          <Link to="/subjects" className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700 font-semibold text-sm hover:underline">
            <span>View All</span>
            <span className="material-icons text-sm">arrow_forward</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.length > 0 ? subjects.map((subject, index) => {
            const gradients = [
              'from-indigo-500 to-purple-600',
              'from-emerald-400 to-teal-600',
              'from-amber-400 to-orange-600'
            ];
            const icons = ['💻', '🗄️', '🌳'];
            const progress = [70, 55, 85];

            return (
              <div key={subject.id} className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                <div className={`h-32 bg-gradient-to-br ${gradients[index % 3]} relative p-6`}>
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-800 shadow-sm">
                    Semester {subject.semester}
                  </div>
                  <div className="absolute -bottom-6 left-6 w-14 h-14 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                    {icons[index % 3]}
                  </div>
                </div>
                <div className="pt-10 pb-6 px-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                    {subject.subject_name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 font-mono">
                    {subject.subject_code}
                  </p>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-gray-500">Progress</span>
                      <span className="text-indigo-600">{progress[index]}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${gradients[index % 3]} rounded-full transition-all duration-1000 ease-out`}
                        style={{ width: `${progress[index]}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between text-xs text-gray-500 font-medium">
                    <div className="flex items-center gap-1.5">
                      <span className="material-icons text-sm">description</span>
                      <span>28/40 Topics</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="material-icons text-sm">quiz</span>
                      <span>5 Tests</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          }) : (
            <div className="col-span-full py-12 text-center text-gray-400">
              <span className="material-icons text-4xl mb-2 animate-spin">refresh</span>
              <p>Loading subjects...</p>
            </div>
          )}
        </div>
      </section>

      {/* Quick Tools */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Quick Tools</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/ai-assistant" className="group bg-white dark:bg-gray-800 p-6 rounded-2xl border-2 border-transparent hover:border-indigo-100 dark:hover:border-indigo-900 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 transition-all duration-300 text-center shadow-sm hover:shadow-lg">
            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">🃏</div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-1">Flashcards</h3>
            <p className="text-xs text-gray-500">Practice with 120+ cards</p>
          </Link>

          <Link to="/subjects" className="group bg-white dark:bg-gray-800 p-6 rounded-2xl border-2 border-transparent hover:border-emerald-100 dark:hover:border-emerald-900 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 transition-all duration-300 text-center shadow-sm hover:shadow-lg">
            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">📝</div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-1">Mock Tests</h3>
            <p className="text-xs text-gray-500">GTU pattern tests</p>
          </Link>

          <Link to="/subjects" className="group bg-white dark:bg-gray-800 p-6 rounded-2xl border-2 border-transparent hover:border-amber-100 dark:hover:border-amber-900 hover:bg-amber-50/50 dark:hover:bg-amber-900/20 transition-all duration-300 text-center shadow-sm hover:shadow-lg">
            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">⭐</div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-1">Important Qs</h3>
            <p className="text-xs text-gray-500">200+ curated questions</p>
          </Link>

          <Link to="/subjects" className="group bg-white dark:bg-gray-800 p-6 rounded-2xl border-2 border-transparent hover:border-rose-100 dark:hover:border-rose-900 hover:bg-rose-50/50 dark:hover:bg-rose-900/20 transition-all duration-300 text-center shadow-sm hover:shadow-lg">
            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">🎥</div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-1">Video Lessons</h3>
            <p className="text-xs text-gray-500">50+ hours of content</p>
          </Link>
        </div>
      </section>

      {/* AI Assistant FAB */}
      <Link to="/ai-assistant" className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full shadow-lg shadow-indigo-500/40 flex items-center justify-center hover:scale-110 hover:shadow-indigo-500/60 transition-all duration-300 z-50 group">
        <span className="material-icons text-3xl group-hover:rotate-12 transition-transform">smart_toy</span>
      </Link>
    </div>
  );
};

export default Dashboard;