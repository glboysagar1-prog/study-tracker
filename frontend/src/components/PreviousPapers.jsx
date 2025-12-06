import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';
import Background3D from './Background3D';

const PreviousPapers = () => {
  const { subjectId } = useParams();
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subjectName, setSubjectName] = useState('');
  const [subjectCode, setSubjectCode] = useState('');

  useEffect(() => {
    const fetchPapersData = async () => {
      try {
        // Fetch subject details
        const subjectResponse = await fetch(`${API_BASE_URL}/subjects/${subjectId}`);
        const subjectData = await subjectResponse.json();

        if (subjectData.subject) {
          setSubjectName(subjectData.subject.subject_name);
          setSubjectCode(subjectData.subject.subject_code);
        }

        // Fetch previous papers data
        const response = await fetch(`${API_BASE_URL}/previous-papers/${subjectId}`);
        const data = await response.json();

        if (data.papers) {
          setPapers(data.papers);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching papers:', error);
        setLoading(false);
      }
    };

    if (subjectId) {
      fetchPapersData();
    }
  }, [subjectId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Loading previous papers...</div>
      </div>
    );
  }

  const getSearchUrl = (paper, type) => {
    const query = `GTU paper ${type === 'solution' ? 'solution ' : ''}${subjectCode} ${paper.year} ${paper.exam_type} pdf`;
    return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
  };

  return (
    <div className="relative min-h-screen">
      <Background3D />
      <div className="relative z-10 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">{subjectName}</h1>
        <p className="text-gray-200 mb-6 drop-shadow">Previous Year Papers</p>

        {papers.length === 0 ? (
          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-lg shadow-xl">
            <p className="text-gray-700">No previous papers available for this subject yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {papers.map((paper) => (
              <div key={paper.id} className="bg-white/90 backdrop-blur-sm p-6 rounded-lg shadow-xl hover:transform hover:scale-105 transition-all duration-300">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">{paper.year}</h2>
                    <p className="text-gray-600">{paper.exam_type}</p>
                  </div>
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    {paper.year}
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <h3 className="font-medium text-gray-700">Question Paper</h3>
                    {paper.paper_pdf_url ? (
                      <div className="flex space-x-2">
                        <a
                          href={`${API_BASE_URL.replace('/api', '')}${paper.paper_pdf_url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded text-sm flex items-center transition-colors shadow-md"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View Paper
                        </a>
                        <a
                          href={`${API_BASE_URL.replace('/api', '')}${paper.paper_pdf_url}`}
                          download
                          className="text-gray-600 hover:text-gray-800 px-2 py-1.5 rounded border border-gray-300 hover:bg-gray-50 transition-colors"
                          title="Download PDF"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </a>
                      </div>
                    ) : (
                      <a
                        href={getSearchUrl(paper, 'paper')}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-700 flex items-center"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        Search PDF
                      </a>
                    )}
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-700">Solution</h3>
                    {paper.solution_pdf_url ? (
                      <a
                        href={`${API_BASE_URL.replace('/api', '')}${paper.solution_pdf_url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded text-sm flex items-center transition-colors w-fit shadow-md"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        View Solution
                      </a>
                    ) : (
                      <a
                        href={getSearchUrl(paper, 'solution')}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-700 flex items-center"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        Search Solution
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PreviousPapers;