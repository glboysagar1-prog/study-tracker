// Test script to verify frontend routing
console.log("Testing frontend routing...");

// Test the current URL to see what subjectId is being passed
console.log("Current URL:", window.location.href);
console.log("Pathname:", window.location.pathname);

// Extract subjectId from URL
const pathParts = window.location.pathname.split('/');
const subjectId = pathParts[pathParts.length - 1];
console.log("Extracted subjectId:", subjectId);

// Test API call
if (subjectId) {
    fetch(`http://localhost:5004/api/subjects/${subjectId}`)
        .then(response => {
            console.log("Response status:", response.status);
            return response.json();
        })
        .then(data => {
            console.log("Subject data:", data);
        })
        .catch(error => {
            console.error("Error:", error);
        });
}