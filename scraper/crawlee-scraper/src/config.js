// Configuration for scraping targets

export const GTU_WEBSITES = {
    official: 'https://www.gtu.ac.in',
    studyMaterial: 'https://www.gtustudy.com',
    // Add more GTU-related sites
};

export const EDUCATIONAL_PLATFORMS = {
    geeksforgeeks: 'https://www.geeksforgeeks.org',
    tutorialspoint: 'https://www.tutorialspoint.com',
    javatpoint: 'https://www.javatpoint.com',
    programiz: 'https://www.programiz.com'
};

// Subject-specific URL mappings
export const SUBJECT_URL_MAP = {
    'Database Management Systems': {
        geeksforgeeks: 'https://www.geeksforgeeks.org/dbms/',
        tutorialspoint: 'https://www.tutorialspoint.com/dbms/index.htm',
        javatpoint: 'https://www.javatpoint.com/dbms-tutorial'
    },
    'Operating System': {
        geeksforgeeks: 'https://www.geeksforgeeks.org/operating-systems/',
        tutorialspoint: 'https://www.tutorialspoint.com/operating_system/index.htm',
        javatpoint: 'https://www.javatpoint.com/os-tutorial'
    },
    'Operating Systems': {
        geeksforgeeks: 'https://www.geeksforgeeks.org/operating-systems/',
        tutorialspoint: 'https://www.tutorialspoint.com/operating_system/index.htm',
        javatpoint: 'https://www.javatpoint.com/os-tutorial'
    },
    'Data Structures': {
        geeksforgeeks: 'https://www.geeksforgeeks.org/data-structures/',
        tutorialspoint: 'https://www.tutorialspoint.com/data_structures_algorithms/index.htm',
        programiz: 'https://www.programiz.com/dsa',
        w3schools: 'https://www.w3schools.com/dsa/index.php',
        sanfoundry: 'https://www.sanfoundry.com/data-structures-questions-answers-mcqs/',
        indiabix: 'https://www.indiabix.com/computer-science/data-structures/',
        nptel: 'https://nptel.ac.in/courses/106102064',
        coursera: 'https://www.coursera.org/search?query=data%20structures',
        edx: 'https://www.edx.org/search?q=data+structures',
        swayam: 'https://swayam.gov.in/explorer?searchText=data+structures',
        reddit: 'https://www.reddit.com/search/?q=data%20structures%20gtu',
        stackoverflow: 'https://stackoverflow.com/search?q=data+structures'
    },
    'Object Oriented Programming': {
        geeksforgeeks: 'https://www.geeksforgeeks.org/cpp-tutorial/',
        tutorialspoint: 'https://www.tutorialspoint.com/cplusplus/index.htm',
        javatpoint: 'https://www.javatpoint.com/cpp-tutorial',
        w3schools: 'https://www.w3schools.com/cpp/',
        sanfoundry: 'https://www.sanfoundry.com/c-plus-plus-questions-answers-mcqs/',
        indiabix: 'https://www.indiabix.com/computer-science/cpp-programming/',
        nptel: 'https://nptel.ac.in/courses/106105151',
        coursera: 'https://www.coursera.org/search?query=cpp',
        edx: 'https://www.edx.org/search?q=cpp',
        swayam: 'https://swayam.gov.in/explorer?searchText=cpp',
        reddit: 'https://www.reddit.com/search/?q=cpp%20gtu',
        stackoverflow: 'https://stackoverflow.com/search?q=cpp'
    },
    'Web Technology': {
        geeksforgeeks: 'https://www.geeksforgeeks.org/web-development/',
        tutorialspoint: 'https://www.tutorialspoint.com/web_development_tutorials.htm',
        javatpoint: 'https://www.javatpoint.com/html-tutorial',
        w3schools: 'https://www.w3schools.com/html/',
        sanfoundry: 'https://www.sanfoundry.com/html-questions-answers-mcqs/',
        nptel: 'https://nptel.ac.in/courses/106105084',
        coursera: 'https://www.coursera.org/search?query=web%20development',
        edx: 'https://www.edx.org/search?q=web+development',
        swayam: 'https://swayam.gov.in/explorer?searchText=web+development',
        reddit: 'https://www.reddit.com/search/?q=web%20development%20gtu',
        stackoverflow: 'https://stackoverflow.com/search?q=web+development'
    },
    'Python Programming': {
        geeksforgeeks: 'https://www.geeksforgeeks.org/python-programming-language/',
        tutorialspoint: 'https://www.tutorialspoint.com/python/index.htm',
        programiz: 'https://www.programiz.com/python-programming',
        w3schools: 'https://www.w3schools.com/python/',
        sanfoundry: 'https://www.sanfoundry.com/python-questions-answers-mcqs/',
        nptel: 'https://nptel.ac.in/courses/106106182',
        coursera: 'https://www.coursera.org/search?query=python',
        edx: 'https://www.edx.org/search?q=python',
        swayam: 'https://swayam.gov.in/explorer?searchText=python',
        reddit: 'https://www.reddit.com/search/?q=python%20gtu',
        stackoverflow: 'https://stackoverflow.com/search?q=python'
    },
    'Java Programming': {
        geeksforgeeks: 'https://www.geeksforgeeks.org/java/',
        tutorialspoint: 'https://www.tutorialspoint.com/java/index.htm',
        javatpoint: 'https://www.javatpoint.com/java-tutorial',
        w3schools: 'https://www.w3schools.com/java/',
        sanfoundry: 'https://www.sanfoundry.com/java-questions-answers-mcqs/',
        indiabix: 'https://www.indiabix.com/java-programming/questions-and-answers/',
        nptel: 'https://nptel.ac.in/courses/106105191',
        coursera: 'https://www.coursera.org/search?query=java',
        edx: 'https://www.edx.org/search?q=java',
        swayam: 'https://swayam.gov.in/explorer?searchText=java',
        reddit: 'https://www.reddit.com/search/?q=java%20gtu',
        stackoverflow: 'https://stackoverflow.com/search?q=java'
    },
    'Digital Logic Design': {
        geeksforgeeks: 'https://www.geeksforgeeks.org/digital-electronics-logic-design-tutorials/',
        tutorialspoint: 'https://www.tutorialspoint.com/digital_circuits/index.htm',
        javatpoint: 'https://www.javatpoint.com/digital-electronics',
        sanfoundry: 'https://www.sanfoundry.com/digital-electronics-questions-answers-mcqs/',
        nptel: 'https://nptel.ac.in/courses/108105132',
        coursera: 'https://www.coursera.org/search?query=digital%20logic',
        edx: 'https://www.edx.org/search?q=digital+logic',
        reddit: 'https://www.reddit.com/search/?q=digital%20logic%20design',
        stackoverflow: 'https://stackoverflow.com/search?q=digital+logic'
    },
    'Digital Fundamentals': {
        geeksforgeeks: 'https://www.geeksforgeeks.org/digital-electronics-logic-design-tutorials/',
        tutorialspoint: 'https://www.tutorialspoint.com/digital_circuits/index.htm',
        javatpoint: 'https://www.javatpoint.com/digital-electronics',
        sanfoundry: 'https://www.sanfoundry.com/digital-electronics-questions-answers-mcqs/',
        nptel: 'https://nptel.ac.in/courses/108105132'
    },
    'Probability and Statistics': {
        geeksforgeeks: 'https://www.geeksforgeeks.org/engineering-mathematics-tutorials/',
        tutorialspoint: 'https://www.tutorialspoint.com/statistics/index.htm',
        sanfoundry: 'https://www.sanfoundry.com/probability-statistics-questions-answers-mcqs/',
        nptel: 'https://nptel.ac.in/courses/111105090',
        coursera: 'https://www.coursera.org/search?query=probability%20statistics',
        edx: 'https://www.edx.org/search?q=probability+statistics',
        reddit: 'https://www.reddit.com/search/?q=probability%20statistics',
        stackoverflow: 'https://stackoverflow.com/search?q=probability+statistics'
    }
    // Add more subjects as needed
};

// GTU Official website patterns
export const GTU_PATTERNS = {
    // Syllabus PDF patterns
    syllabusPDFPattern: /syllabus.*\.pdf$/i,
    // Question paper patterns
    questionPaperPattern: /(question|paper|exam).*\.pdf$/i,
    // Subject code pattern (GTU format: XXXXXXX)
    subjectCodePattern: /\b\d{7}\b/
};

export const CRAWLER_CONFIG = {
    maxRequestsPerCrawl: 500,
    maxConcurrency: 10,
    requestHandlerTimeoutSecs: 120,
    navigationTimeoutSecs: 60,
    // Be polite - don't overload servers
    minConcurrency: 2,
    maxRequestRetries: 5
};
