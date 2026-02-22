import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

const PreviousPapers = ({ subjectId: propSubjectId }) => {
  const { subjectId: paramSubjectId } = useParams();
  const subjectId = propSubjectId || paramSubjectId;

  const subject = useQuery(api.subjects.getById, subjectId ? { id: subjectId } : "skip");
  const papers = useQuery(api.previousPapers.getBySubject, subjectId ? { subjectId } : "skip") ?? [];

  const loading = subject === undefined;
  const subjectCode = subject?.subjectCode || '';

  if (loading) {
    return (
      <div className="bg-white p-8 flex items-center justify-center">
        <div className="text-blue-600">Loading previous papers...</div>
      </div>
    );
  }

  const getSearchUrl = (paper, type) => {
    const query = `GTU paper ${type === 'solution' ? 'solution ' : ''}${subjectCode} ${paper.year} ${paper.examType} pdf`;
    return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
  };

  return (
    <div className="bg-white rounded-lg p-2">
      {papers.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 text-center">
          <p className="text-gray-500">No previous papers available for this subject yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {papers.map((paper) => (
            <div key={paper._id} className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">{paper.year}</h2>
                  <p className="text-gray-500 text-sm">{paper.examType}</p>
                </div>
                <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full border border-blue-100">
                  {paper.year}
                </span>
              </div>

              <div className="space-y-3 pt-2 border-t border-gray-50">
                <div>
                  <h3 className="font-medium text-gray-700 text-sm mb-1">Question Paper</h3>
                  {paper.paperPdfUrl ? (
                    <a
                      href={paper.paperPdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded text-sm flex items-center justify-center transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download PDF
                    </a>
                  ) : (
                    <a
                      href={getSearchUrl(paper, 'paper')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded text-sm flex items-center justify-center border border-gray-200"
                    >
                      Search (Missing)
                    </a>
                  )}
                </div>

                <div>
                  <h3 className="font-medium text-gray-700 text-sm mb-1">Solution</h3>
                  {paper.solutionPdfUrl ? (
                    <a
                      href={paper.solutionPdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 px-3 py-1.5 rounded text-sm flex items-center justify-center transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      View Solution
                    </a>
                  ) : (
                    <span className="text-gray-400 px-3 py-1.5 rounded text-sm flex items-center justify-center border border-gray-100 bg-gray-50 cursor-not-allowed">
                      No Solution
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PreviousPapers;