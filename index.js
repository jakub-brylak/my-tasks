import fetch from 'node-fetch';

async function getTodayLoggedIssues() {
    const jiraUrl = `https://your-jira.atlassian.net/rest/api/3/search`;

    const username = 'your-email@example.com';
    const apiToken = 'your-api-token';

    const headers = {
        'Authorization': 'Basic ' + Buffer.from(`${username}:${apiToken}`).toString('base64'),
        'Accept': 'application/json'
    };

    const today = new Date().toISOString().split('T')[0];

    try {
        const response = await fetch(`${jiraUrl}?jql=worklogAuthor=currentUser() AND worklogDate >= "${today}"`, {
            method: 'GET',
            headers: headers,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        const taskIds = data.issues.map(issue => issue.key);

        if (taskIds.length === 0) {
            console.log('No logged time for today.');
        } else {
            console.log('You logged time today on tasks:', taskIds);
        }
    } catch (error) {
        console.error('Error occured:', error);
    }
}

getTodayLoggedIssues();
