import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

const Subjects = () => {
  const [filters, setFilters] = useState({
    course: '',
    branch: '',
    semester: ''
  });

  const metadata = useQuery(api.subjects.getMetadata) ?? { courses: [], branches: [], semesters: [] };
  const subjects = useQuery(api.subjects.list, {
    course: filters.course || undefined,
    branch: filters.branch || undefined,
    semester: filters.semester || undefined,
  });

  const loading = subjects === undefined;

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const clearFilters = () => {
    setFilters({ course: '', branch: '', semester: '' });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Subjects</h1>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="w-full md:w-auto">
              <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
              <select
                name="course"
                value={filters.course}
                onChange={handleFilterChange}
                className="w-full md:w-48 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Courses</option>
                {metadata.courses.map(course => (
                  <option key={course} value={course}>{course}</option>
                ))}
              </select>
            </div>

            <div className="w-full md:w-auto">
              <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
              <select
                name="branch"
                value={filters.branch}
                onChange={handleFilterChange}
                className="w-full md:w-48 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Branches</option>
                {metadata.branches.map(branch => (
                  <option key={branch} value={branch}>{branch}</option>
                ))}
              </select>
            </div>

            <div className="w-full md:w-auto">
              <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
              <select
                name="semester"
                value={filters.semester}
                onChange={handleFilterChange}
                className="w-full md:w-48 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Semesters</option>
                {metadata.semesters.map(sem => (
                  <option key={sem} value={sem}>Semester {sem}</option>
                ))}
              </select>
            </div>

            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="text-xl text-gray-600">Loading subjects...</div>
          </div>
        ) : subjects.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <p className="text-gray-600 text-lg">No subjects found matching your filters.</p>
            <button
              onClick={clearFilters}
              className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Branch</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject Code</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Semester</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Credits</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {subjects.map((subject) => (
                  <tr key={subject._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{subject.course}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{subject.branch}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{subject.subjectCode}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{subject.subjectName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{subject.semester}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{subject.credits}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-3">
                        <Link to={`/syllabus/${subject._id}`} className="text-blue-600 hover:text-blue-900">Syllabus</Link>
                        <Link to={`/previous-papers/${subject._id}`} className="text-green-600 hover:text-green-900">Papers</Link>
                        <Link to={`/mock-tests/${subject._id}`} className="text-purple-600 hover:text-purple-900">Tests</Link>
                        <Link to={`/important-questions/${subject._id}`} className="text-red-600 hover:text-red-900">IMP</Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Subjects;