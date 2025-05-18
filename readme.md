# Kicktipp Webhook Integration

This project implements a Kicktipp API that fetches leaderboard data and sends updates to a discord webhook. It is designed to periodically refresh subscriptions and notify users about game predictions as soon as the game starts.


## Table of Contents

- [Kicktipp Webhook Integration](#kicktipp-webhook-integration)
  - [Table of Contents](#table-of-contents)
  - [⚠️ Important Notice](#️-important-notice)
  - [Installation](#installation)
  - [Configuration](#configuration)
  - [Usage](#usage)
    - [What does the application do](#what-does-the-application-do)
  - [Missing features:](#missing-features)
  - [Project Structure](#project-structure)
  - [Contributing](#contributing)
  - [Testing](#testing)
  - [License](#license)

## ⚠️ Important Notice

This project was specifically developed for the **UEFA Euro 2024**. Future updates are not planned.

## Webhook Message Example
![image](https://github.com/user-attachments/assets/e6ff28a0-ccb2-454a-9b71-8e2487fb5957)


## Installation

1. Clone the repository:

`git clone https://github.com/MrAlexand0r/kicktipp.com_discord_webhook`

2. Install dependencies:

`npm install`


Alternatively use nixpacks. 

## Configuration

Create a `.env` file in the root directory and add the following environment variables:

```conf
KICKTIPP_BASEURL=https://www.kicktipp.com/your-game
KICKTIPP_USERNAME=your_username 
KICKTIPP_PASSWORD=your_password 
WEBHOOK_URL=your_discord_webhook_url
```

Create a `userIdMap.json` in the src/ folder for personalized Discord Pings. Just add an empty Json Object `{}`  if you wish to display the kicktipp_username instead

```json
{
    "kicktipp_username": "<@discord_id>",
    ...
}
```

## Usage

Start the application:

`node index.js`


### What does the application do
- Initialize the Kicktipp API with your credentials.
- Set up jobs that subscribe to the leaderboard and listen for game updates.
- Send discord webhook messages with game predictions.


## Missing features:
 - [ ] Real time score tracking
 - [ ] Support for other kicktipp languages, currently only `.com` is supported

## Project Structure

- `index.js`: Main entry point of the application. Initializes the Kicktipp API and sets up daily refreshes.
- `src/webhook.js`: Contains the `Webhook` class responsible for subscribing to the leaderboard, generating webhook messages, and sending them.
- `api/kicktipp.js`: Contains the `Kicktipp` class responsible for scraping and parsing kicktipp.com, currently implemented and working are login and fetching leaderboard data.
- `src/userIdMap.json`: Maps user IDs to Discord IDs for personalized messages.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## Testing

For testing if the _Configuration_ was successful, you can start the application with `node index.js test <index>`, index being which game of the current leaderboard to select. 
It will start the application normally, but will also immediately try to send a webhook to discord with the selected game info.

## License

This project is licensed under the GPL License.
