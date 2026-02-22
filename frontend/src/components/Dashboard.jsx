import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useAuth } from '../context/AuthContext';
import { HoverBorderGradient } from './ui/HoverBorderGradient';
import { BorderBeam } from './ui/BorderBeam';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Dashboard = () => {
  const { user, profile } = useAuth();
  const [filters, setFilters] = useState({
    course: '',
    branch: '',
    semester: ''
  });
  const [stats] = useState({
    topicsCompleted: 0,
    totalXP: 0,
    testsCompleted: 0,
    streak: 0
  });

  const metadata = useQuery(api.subjects.getMetadata) ?? { courses: [], branches: [], semesters: [] };
  const subjects = useQuery(api.subjects.list, {
    course: filters.course || undefined,
    branch: filters.branch || undefined,
    semester: filters.semester || undefined,
  });

  const loading = subjects === undefined;

  const clearFilters = () => {
    setFilters({ course: '', branch: '', semester: '' });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 glass-panel p-8 rounded-3xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 pointer-events-none" />
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2">
            Welcome back, <span className="text-gradient">{profile?.username || user?.email?.split('@')[0] || 'Student'}</span>! <span className="animate-wave inline-block origin-bottom-right">👋</span>
          </h1>
          <p className="text-gray-400 mt-2 text-lg font-medium">
            {profile ? `${profile.ai_credits} AI credits remaining` : "You've completed 0 topics today. Time to get started!"}
          </p>
        </div>
        <div className="flex gap-4 relative z-10 items-center">
          <Button variant="outline" size="icon" className="h-14 w-14 rounded-2xl bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all shadow-sm">
            <span className="material-icons text-xl">search</span>
          </Button>
          <Button variant="outline" size="icon" className="h-14 w-14 rounded-2xl bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all shadow-sm">
            <span className="material-icons text-xl">notifications</span>
          </Button>
          <Link to="/mock-tests/1">
            <HoverBorderGradient
              containerClassName="rounded-2xl"
              as="button"
              className="flex items-center gap-2 bg-indigo-600/20 hover:bg-indigo-600/40 text-white px-6 py-3 h-14"
            >
              <span className="material-icons text-xl">rocket_launch</span>
              <span className="font-bold tracking-wide">Start Mock Test</span>
            </HoverBorderGradient>
          </Link>
        </div>
        <BorderBeam size={200} duration={8} delay={1} />
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass-panel border-0 rounded-3xl transition-all duration-300 group hover:-translate-y-1 relative overflow-hidden bg-transparent shadow-none">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div>
                <div className="text-3xl font-extrabold text-white mb-1 group-hover:text-indigo-400 transition-colors">{stats.topicsCompleted}</div>
                <div className="text-sm font-medium text-gray-400">Topics Mastered</div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                <span className="material-icons text-2xl">school</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-gray-400 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl w-fit relative z-10">
              <span className="material-icons text-sm">trending_flat</span>
              <span>No topics yet</span>
            </div>
            <BorderBeam size={100} duration={12} delay={0} />
          </CardContent>
        </Card>

        <Card className="glass-panel border-0 rounded-3xl transition-all duration-300 group hover:-translate-y-1 relative overflow-hidden bg-transparent shadow-none">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div>
                <div className="text-3xl font-extrabold text-white mb-1 group-hover:text-amber-400 transition-colors">{stats.totalXP.toLocaleString()}</div>
                <div className="text-sm font-medium text-gray-400">Total XP Earned</div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                <span className="material-icons text-2xl">emoji_events</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-gray-400 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl w-fit relative z-10">
              <span className="material-icons text-sm">trending_flat</span>
              <span>+0 XP today</span>
            </div>
            <BorderBeam size={100} duration={12} delay={2} />
          </CardContent>
        </Card>

        <Card className="glass-panel border-0 rounded-3xl transition-all duration-300 group hover:-translate-y-1 relative overflow-hidden bg-transparent shadow-none">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div>
                <div className="text-3xl font-extrabold text-white mb-1 group-hover:text-blue-400 transition-colors">{stats.testsCompleted}<span className="text-lg text-gray-500 font-normal">/0</span></div>
                <div className="text-sm font-medium text-gray-400">Tests Completed</div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                <span className="material-icons text-2xl">assignment_turned_in</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-gray-400 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl w-fit relative z-10">
              <span className="material-icons text-sm">trending_flat</span>
              <span>Avg: 0%</span>
            </div>
            <BorderBeam size={100} duration={12} delay={4} />
          </CardContent>
        </Card>

        <Card className="glass-panel border-0 rounded-3xl transition-all duration-300 group hover:-translate-y-1 relative overflow-hidden bg-transparent shadow-none">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div>
                <div className="text-3xl font-extrabold text-white mb-1 group-hover:text-rose-400 transition-colors">{stats.streak} <span className="text-lg text-gray-500 font-normal">Days</span></div>
                <div className="text-sm font-medium text-gray-400">Study Streak</div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform">
                <span className="material-icons text-2xl">local_fire_department</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-gray-400 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl w-fit relative z-10">
              <span className="material-icons text-sm">trending_flat</span>
              <span>Start your streak!</span>
            </div>
            <BorderBeam size={100} duration={12} delay={6} />
          </CardContent>
        </Card>
      </div>

      {/* Continue Learning Section - Full Subjects Browser */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Browse Subjects</h2>
        </div>

        {/* Filters */}
        <Card className="glass-panel border-0 rounded-3xl mb-8 relative z-10 bg-transparent shadow-none">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wide">Course</label>
                <Select
                  value={filters.course || "all"}
                  onValueChange={(val) => setFilters({ ...filters, course: val === "all" ? "" : val })}
                >
                  <SelectTrigger className="w-full p-3.5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-black/40 text-white backdrop-blur-xl h-14">
                    <SelectValue placeholder="All Courses" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a2e] border-white/10 text-white">
                    <SelectItem value="all">All Courses</SelectItem>
                    {metadata.courses.map(course => (
                      <SelectItem key={course} value={course}>{course}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wide">Branch</label>
                <Select
                  value={filters.branch || "all"}
                  onValueChange={(val) => setFilters({ ...filters, branch: val === "all" ? "" : val })}
                >
                  <SelectTrigger className="w-full p-3.5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-black/40 text-white backdrop-blur-xl h-14">
                    <SelectValue placeholder="All Branches" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a2e] border-white/10 text-white">
                    <SelectItem value="all">All Branches</SelectItem>
                    {metadata.branches.map(branch => (
                      <SelectItem key={branch} value={branch}>{branch}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wide">Semester</label>
                <Select
                  value={filters.semester || "all"}
                  onValueChange={(val) => setFilters({ ...filters, semester: val === "all" ? "" : val })}
                >
                  <SelectTrigger className="w-full p-3.5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-black/40 text-white backdrop-blur-xl h-14">
                    <SelectValue placeholder="All Semesters" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a2e] border-white/10 text-white">
                    <SelectItem value="all">All Semesters</SelectItem>
                    {metadata.semesters.map(sem => (
                      <SelectItem key={sem} value={sem}>Semester {sem}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button
                  onClick={clearFilters}
                  variant="outline"
                  className="w-full h-14 bg-white/5 border-white/10 text-white hover:text-white rounded-2xl hover:bg-white/10 transition-colors font-semibold text-base"
                >
                  Reset Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subjects Table */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="text-xl text-indigo-400 font-medium animate-pulse">Loading subjects...</div>
          </div>
        ) : subjects.length === 0 ? (
          <Card className="glass-panel border-0 p-12 rounded-3xl text-center shadow-none bg-transparent backdrop-blur-md">
            <CardContent>
              <p className="text-gray-300 text-xl font-medium mb-4">No subjects found matching your filters.</p>
              <Button
                variant="link"
                onClick={clearFilters}
                className="text-indigo-400 hover:text-indigo-300 font-bold p-0 text-lg"
              >
                Clear all filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="glass-panel rounded-3xl overflow-hidden border-0 shadow-2xl relative z-10 bg-transparent">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/10">
                <thead className="bg-black/40">
                  <tr>
                    <th scope="col" className="px-8 py-5 text-left text-xs font-bold text-gray-300 uppercase tracking-widest">Course</th>
                    <th scope="col" className="px-8 py-5 text-left text-xs font-bold text-gray-300 uppercase tracking-widest">Branch</th>
                    <th scope="col" className="px-8 py-5 text-left text-xs font-bold text-gray-300 uppercase tracking-widest">Code</th>
                    <th scope="col" className="px-8 py-5 text-left text-xs font-bold text-gray-300 uppercase tracking-widest">Subject Name</th>
                    <th scope="col" className="px-8 py-5 text-left text-xs font-bold text-gray-300 uppercase tracking-widest">Sem</th>
                    <th scope="col" className="px-8 py-5 text-left text-xs font-bold text-gray-300 uppercase tracking-widest">Credits</th>
                    <th scope="col" className="px-8 py-5 text-left text-xs font-bold text-gray-300 uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 bg-transparent backdrop-blur-sm">
                  {subjects.map((subject) => (
                    <tr key={subject._id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-8 py-5 whitespace-nowrap text-sm font-medium text-gray-400">{subject.course}</td>
                      <td className="px-8 py-5 whitespace-nowrap text-sm font-medium text-gray-400">{subject.branch}</td>
                      <td className="px-8 py-5 whitespace-nowrap text-sm font-mono font-bold text-white bg-white/5 group-hover:bg-white/10 rounded-lg mx-2 my-2 inline-block transition-colors">{subject.subjectCode}</td>
                      <td className="px-8 py-5 text-base font-semibold text-gray-200 max-w-xs">{subject.subjectName}</td>
                      <td className="px-8 py-5 whitespace-nowrap text-sm font-medium text-gray-400">{subject.semester}</td>
                      <td className="px-8 py-5 whitespace-nowrap text-sm font-medium text-gray-400">{subject.credits}</td>
                      <td className="px-8 py-5 whitespace-nowrap text-sm">
                        <div className="flex space-x-4">
                          <Link to={`/syllabus/${subject._id}`} className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors hover:scale-105">Syllabus</Link>
                          <Link to={`/materials/${subject.subjectCode}`} className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors hover:scale-105">Materials</Link>
                          <Link to={`/mock-tests/${subject._id}`} className="text-fuchsia-400 hover:text-fuchsia-300 font-bold transition-colors hover:scale-105">Tests</Link>
                          <Link to={`/important-questions/${subject._id}`} className="text-rose-400 hover:text-rose-300 font-bold transition-colors hover:scale-105">IMP</Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </section>

      {/* Quick Tools */}
      <section>
        <h2 className="text-3xl font-extrabold text-white mb-8 tracking-tight">Quick Tools</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <Link to="/ai-assistant">
            <Card className="glass-panel border-0 rounded-3xl hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all duration-300 text-center relative overflow-hidden group bg-transparent h-full shadow-none">
              <CardContent className="p-8 flex flex-col items-center justify-center">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300 relative z-10">🃏</div>
                <h3 className="font-bold text-white mb-1 relative z-10">Flashcards</h3>
                <p className="text-sm text-gray-400 relative z-10">Practice with 120+ cards</p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/subjects">
            <Card className="glass-panel border-0 rounded-3xl hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all duration-300 text-center relative overflow-hidden group bg-transparent h-full shadow-none">
              <CardContent className="p-8 flex flex-col items-center justify-center">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300 relative z-10">📝</div>
                <h3 className="font-bold text-white mb-1 relative z-10">Mock Tests</h3>
                <p className="text-sm text-gray-400 relative z-10">GTU pattern tests</p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/subjects">
            <Card className="glass-panel border-0 rounded-3xl hover:border-amber-500/50 hover:bg-amber-500/5 transition-all duration-300 text-center relative overflow-hidden group bg-transparent h-full shadow-none">
              <CardContent className="p-8 flex flex-col items-center justify-center">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300 relative z-10">⭐</div>
                <h3 className="font-bold text-white mb-1 relative z-10">Important Qs</h3>
                <p className="text-sm text-gray-400 relative z-10">200+ curated questions</p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/subjects">
            <Card className="glass-panel border-0 rounded-3xl hover:border-rose-500/50 hover:bg-rose-500/5 transition-all duration-300 text-center relative overflow-hidden group bg-transparent h-full shadow-none">
              <CardContent className="p-8 flex flex-col items-center justify-center">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300 relative z-10">🎥</div>
                <h3 className="font-bold text-white mb-1 relative z-10">Video Lessons</h3>
                <p className="text-sm text-gray-400 relative z-10">50+ hours of content</p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/prepare-exam" className="col-span-2 md:col-span-4 group relative overflow-hidden rounded-3xl block">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-fuchsia-600 to-rose-600 opacity-90 transition-opacity group-hover:opacity-100" />
            <div className="relative p-8 flex items-center justify-between z-10">
              <div className="text-left">
                <h3 className="text-2xl font-extrabold text-white mb-1 tracking-tight">🚀 Prepare Exam with AI</h3>
                <p className="text-indigo-100 text-base font-medium">Generate predicted papers, AI answers, and personalized smart study plans.</p>
              </div>
              <div className="text-5xl group-hover:rotate-12 group-hover:scale-110 transition-all duration-500 drop-shadow-2xl">✨</div>
            </div>
            <BorderBeam size={400} duration={10} colorFrom="#fff" colorTo="transparent" />
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