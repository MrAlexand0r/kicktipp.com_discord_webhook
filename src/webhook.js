import { Kicktipp } from "../api/kicktipp.js";
import userIdMap from "./userIdMap.json" assert { type: "json" };

export class Webhook {
  static timeouts = [];

  static async triggerManually(index) {
  	const leaderboard = await Kicktipp.leaderboard();
  	const webhookMsg = this.generateWebhookMessageFromGame(leaderboard[index]);
    await this.sendWebhookMessage(webhookMsg);
  }

  static async subscribeToLeaderboard() {
    const leaderboard = await Kicktipp.leaderboard();

    const now = new Date();
    const today = leaderboard.filter((l) => l.date > now);
    console.log("listening for " + today.length + " games");
    today.forEach((game) => {
      const timeLeft = game.date - now + 10_000; // wait 10 seconds before refreshing

      const timeout = setTimeout(async () => {
        const updatedLeaderboard = await Kicktipp.leaderboard();
        const updatedGame = updatedLeaderboard[game.index];

        console.log(JSON.stringify(updatedGame));
        // console.log(updatedLeaderboard);

        const webhookMsg = this.generateWebhookMessageFromGame(updatedGame);
        await this.sendWebhookMessage(webhookMsg);
      }, timeLeft);

      Webhook.timeouts.push(timeout);
    });
  }

  static generateWebhookMessageFromGame(updatedGame) {
    const webhookMsg = {
      content: `⚽ **${updatedGame.home}** - **${updatedGame.away}** Predictions ⚽`,
      embeds: [
        {
          "description": `[Leaderboard](${process.env.KICKTIPP_BASEURL}/leaderboard) | [Prediction Center](${process.env.KICKTIPP_BASEURL}/leaderboard)`,
          "fields": [],
          "title": "🔗"
        }
      ]
    };
    const embed = {
      title: "Home - Away (●'◡'●)",
      description: "",
      color: "14177041",
    };
    updatedGame.bets.forEach(
      (bet) => {
        if (!!bet.bet) {
          embed.description += `\`${bet.bet.home.toString()}   -   ${bet.bet.away.toString()}\`  ${getDiscordId(bet.user)} \n`;
        }
      }
    );
    webhookMsg.embeds.unshift(embed);
    console.log(JSON.stringify(embed));
    return webhookMsg;
  }

  static async sendWebhookMessage(message) {
    const response = await fetch(process.env.WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(message),
    });

    console.log(`Webhook Result: ${response.status}`);
    if (response.status !== 200) {
    	console.log(await response.json());
    }
  }

  static clearTimeouts() {
    Webhook.timeouts.forEach((timeout) => clearTimeout(timeout));
  }
}

function getDiscordId(user) {
  return userIdMap[user] || user;
}
