import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import { API_BASE_URL } from '../config/api';

const Dashboard = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    course: '',
    branch: '',
    semester: ''
  });
  const [metadata, setMetadata] = useState({
    courses: [],
    branches: [],
    semesters: []
  });
  const [stats, setStats] = useState({
    topicsCompleted: 42,
    totalXP: 2850,
    testsCompleted: 12,
    streak: 7
  });

  useEffect(() => {
    fetchMetadata();
  }, []);

  useEffect(() => {
    fetchSubjects();
  }, [filters]);

  const fetchMetadata = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/subjects/metadata`);
      const data = await response.json();
      setMetadata(data);
    } catch (error) {
      console.error('Error fetching metadata:', error);
    }
  };

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      // Build query string
      const params = new URLSearchParams();
      if (filters.course) params.append('course', filters.course);
      if (filters.branch) params.append('branch', filters.branch);
      if (filters.semester) params.append('semester', filters.semester);

      const response = await fetch(`${API_BASE_URL}/subjects?${params.toString()}`);
      const data = await response.json();

      if (data.subjects) {
        setSubjects(data.subjects);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      course: '',
      branch: '',
      semester: ''
    });
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

      {/* Continue Learning Section - Full Subjects Browser */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Browse Subjects</h2>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Course</label>
              <select
                value={filters.course}
                onChange={(e) => setFilters({ ...filters, course: e.target.value })}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">All Courses</option>
                {metadata.courses.map(course => (
                  <option key={course} value={course}>{course}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Branch</label>
              <select
                value={filters.branch}
                onChange={(e) => setFilters({ ...filters, branch: e.target.value })}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">All Branches</option>
                {metadata.branches.map(branch => (
                  <option key={branch} value={branch}>{branch}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Semester</label>
              <select
                value={filters.semester}
                onChange={(e) => setFilters({ ...filters, semester: e.target.value })}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">All Semesters</option>
                {metadata.semesters.map(sem => (
                  <option key={sem} value={sem}>Semester {sem}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full px-4 py-3 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors font-medium"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Subjects Table */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="text-xl text-gray-600 dark:text-gray-400">Loading subjects...</div>
          </div>
        ) : subjects.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm text-center border border-gray-100 dark:border-gray-700">
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">No subjects found matching your filters.</p>
            <button
              onClick={clearFilters}
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Course
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Branch
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Subject Code
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Subject Name
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Semester
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Credits
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {subjects.map((subject) => (
                    <tr key={subject.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {subject.course}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {subject.branch}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-semibold text-gray-900 dark:text-white">
                        {subject.subject_code}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 max-w-xs">
                        {subject.subject_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {subject.semester}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {subject.credits}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex space-x-3">
                          <Link
                            to={`/syllabus/${subject.id}`}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 font-medium"
                          >
                            Syllabus
                          </Link>
                          <Link
                            to={`/previous-papers/${subject.id}`}
                            className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 font-medium"
                          >
                            Papers
                          </Link>
                          <Link
                            to={`/mock-tests/${subject.id}`}
                            className="text-purple-600 dark:text-purple-400 hover:text-purple-900 dark:hover:text-purple-300 font-medium"
                          >
                            Tests
                          </Link>
                          <Link
                            to={`/important-questions/${subject.id}`}
                            className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 font-medium"
                          >
                            IMP
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
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