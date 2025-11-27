// Test script to verify frontend routing and data fetching
console.log("Testing frontend routing and data fetching...");

// Test 1: Fetch subjects list
fetch('http://localhost:5004/api/subjects')
  .then(response => response.json())
  .then(data => {
    console.log('Subjects list:', data.subjects.length, 'subjects found');
    if (data.subjects.length > 0) {
      console.log('First subject:', data.subjects[0]);
      
      // Test 2: Fetch specific subject
      const firstSubjectId = data.subjects[0].id;
      return fetch(`http://localhost:5004/api/subjects/${firstSubjectId}`)
        .then(response => response.json())
        .then(subjectData => {
          console.log('Specific subject:', subjectData);
          
          // Test 3: Fetch syllabus for this subject
          return fetch(`http://localhost:5004/api/syllabus/${firstSubjectId}`)
            .then(response => response.json())
            .then(syllabusData => {
              console.log('Syllabus data:', syllabusData);
            });
        });
    }
  })
  .catch(error => {
    console.error('Error in testing:', error);
  });