import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import { API_BASE_URL } from '../config/api';

const Subjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        console.log('Fetching metadata from:', `${API_BASE_URL}/subjects/metadata`);
        const response = await fetch(`${API_BASE_URL}/subjects/metadata`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Metadata received:', data);
        setMetadata(data);
      } catch (error) {
        console.error('Error fetching metadata:', error);
        setError(`Failed to load metadata: ${error.message}`);
      }
    };
    fetchMetadata();
  }, []);

  useEffect(() => {
    const fetchSubjects = async () => {
      setLoading(true);
      setError(null);
      try {
        // Build query string
        const params = new URLSearchParams();
        if (filters.course) params.append('course', filters.course);
        if (filters.branch) params.append('branch', filters.branch);
        if (filters.semester) params.append('semester', filters.semester);

        const url = `${API_BASE_URL}/subjects?${params.toString()}`;
        console.log('Fetching subjects from:', url);

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Subjects data received:', data);

        if (data.subjects) {
          setSubjects(data.subjects);
          console.log('Set subjects:', data.subjects.length, 'subjects');
        } else {
          console.warn('No subjects field in response:', data);
          setSubjects([]);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching subjects:', error);
        setError(`Failed to load subjects: ${error.message}`);
        setLoading(false);
      }
    };

    fetchSubjects();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      course: '',
      branch: '',
      semester: ''
    });
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

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-red-800 font-medium">{error}</p>
            </div>
            <p className="text-red-700 text-sm mt-2">
              Please ensure the backend server is running at {API_BASE_URL}
            </p>
          </div>
        )}

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
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Branch
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subject Code
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subject Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Semester
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Credits
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {subjects.map((subject) => (
                  <tr key={subject.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {subject.course}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {subject.branch}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {subject.subject_code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {subject.subject_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {subject.semester}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {subject.credits}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-3">
                        <Link
                          to={`/syllabus/${subject.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Syllabus
                        </Link>
                        <Link
                          to={`/previous-papers/${subject.id}`}
                          className="text-green-600 hover:text-green-900"
                        >
                          Papers
                        </Link>
                        <Link
                          to={`/mock-tests/${subject.id}`}
                          className="text-purple-600 hover:text-purple-900"
                        >
                          Tests
                        </Link>
                        <Link
                          to={`/important-questions/${subject.id}`}
                          className="text-red-600 hover:text-red-900"
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
        )}
      </div>
    </div>
  );
};

export default Subjects;