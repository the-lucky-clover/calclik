#!/usr/bin/env node

const { exec } = require('child_process');

// Read messages from stdin
process.stdin.on('data', (data) => {
  try {
    const message = JSON.parse(data.toString().trim());
    if (message.action === 'createReminder') {
      createReminder(message.event);
    }
  } catch (err) {
    console.error('Error parsing message:', err);
  }
});

function createReminder(event) {
  // AppleScript to create a reminder
  const script = `
tell application "Reminders"
    set mylist to list "Reminders"
    tell mylist
        make new reminder with properties {name:"${event.title}", body:"${event.description} at ${event.location}", due date:date "${event.date} ${event.time}"}
    end tell
end tell
`;

  exec(`osascript -e '${script}'`, (error, stdout, stderr) => {
    if (error) {
      console.error('Error creating reminder:', error);
      return;
    }
    // Send response back
    const response = { success: true };
    process.stdout.write(JSON.stringify(response) + '\n');
  });
}
