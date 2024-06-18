import { Kicktipp } from "../api/kicktipp.js";
import userIdMap from "./userIdMap.json" assert { type: "json" };

export class Webhook {
  static timeouts = [];

  static async subscribeToLeaderboard() {
    const leaderboard = await Kicktipp.leaderboard();

    const now = new Date();
    const today = leaderboard.filter((l) => l.date > now);

    today.forEach((game) => {
      const timeLeft = game.date - now + 10000; // wait 10 seconds before refreshing

      const timeout = setTimeout(async () => {
        const updatedLeaderboard = await Kicktipp.leaderboard();
        const updatedGame = updatedLeaderboard[game.index];

        console.log(JSON.stringify(updatedGame));
        // console.log(updatedLeaderboard);

        const webhookMsg = this.generateWebhookMessageFromGame(updatedGame);
        await sendWebhookMessage(webhookMsg);
      }, timeLeft);

      Webhook.timeouts.push(timeout);
    });
  }

  static generateWebhookMessageFromGame(updatedGame) {
    const webhookMsg = {
      content: `⚽ **${updatedGame.home}** - **${updatedGame.away}** Predictions ⚽`,
      embeds: [],
    };
    const embed = {
      title: "Home  Away (●'◡'●)",
      description: "",
      color: "14177041",
    };
    updatedGame.bets.forEach(
      (bet) =>
        (embed.description += `\`${bet.bet.home.toString()}   -   ${bet.bet.away.toString()}\`  ${getDiscordId(bet.user)} \n`),
    );
    webhookMsg.embeds.push(embed);
    return webhookMsg;
  }

  static async sendWebhookMessage(message) {
    const response = await fetch(process.env.WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message),
    });

    console.log(`Webhook Result: ${response.status}`);
  }

  static clearTimeouts() {
    Webhook.timeouts.forEach((timeout) => clearTimeout(timeout));
  }
}

function getDiscordId(user) {
  return userIdMap[user] || user;
}
