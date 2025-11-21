import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

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
        const subjectResponse = await fetch(`http://localhost:5004/api/subjects/${subjectId}`);
        const subjectData = await subjectResponse.json();

        if (subjectData.subject) {
          setSubjectName(subjectData.subject.subject_name);
          setSubjectCode(subjectData.subject.subject_code);
        }

        // Fetch previous papers data
        const response = await fetch(`http://localhost:5004/api/previous-papers/${subjectId}`);
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
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">{subjectName}</h1>
        <p className="text-gray-600 mb-6">Previous Year Papers</p>

        {papers.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <p className="text-gray-700">No previous papers available for this subject yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {papers.map((paper) => (
              <div key={paper.id} className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-semibold">{paper.year}</h2>
                    <p className="text-gray-600">{paper.exam_type}</p>
                  </div>
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    {paper.year}
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <h3 className="font-medium text-gray-700">Question Paper</h3>
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
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-700">Solution</h3>
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