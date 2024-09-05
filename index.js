#!/usr/bin/env node
import { exec } from 'child_process';
async function getLoggedIssuesByDate(dateInput = null) {
    const jiraUrl = process.env.JIRA_URL + '/rest/api/3/search';
    const username = process.env.JIRA_USERNAME;
    const apiToken = process.env.JIRA_API_TOKEN;

    const currentYear = new Date().getFullYear();

    let dateToQuery;
    if (dateInput) {
        const [day, month] = dateInput.split('-');
        dateToQuery = `${currentYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    } else {
        dateToQuery = new Date().toISOString().split('T')[0];
    }

    const jqlQuery = `worklogAuthor = currentUser() AND worklogDate >= "${dateToQuery}" AND worklogDate < "${new Date(new Date(dateToQuery).getTime() + 86400000).toISOString().split('T')[0]}"`;

    const headers = {
        'Accept': 'application/json',
        'Authorization': 'Basic ' + Buffer.from(`${username}:${apiToken}`).toString('base64')
    };

    try {
        const response = await fetch(`${jiraUrl}?jql=${encodeURIComponent(jqlQuery)}&maxResults=100`, {
            method: 'GET',
            headers: headers
        });

        if (!response.ok) {
            throw new Error(`Error fetching data from Jira: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        const taskDescriptions = data.issues.map(issue => `${issue.key} ${issue.fields.summary}`);

        const resultString = taskDescriptions.join('; ');

        if (!taskDescriptions.length) {
            console.log(`No tasks logged for the date: ${dateToQuery}.`);
        } else {
            console.log(resultString);

            exec(`echo "${resultString}" | pbcopy`, (err) => {
                if (err) {
                    console.error('Error copying to clipboard:', err);
                } else {
                    console.log('The result has been copied to the clipboard.');
                }
            });
        }
    } catch (error) {
        console.error('An error occurred:', error);
    }
}

const userInputDate = process.argv[2];
getLoggedIssuesByDate(userInputDate);
