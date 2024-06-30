import makeFetchCookie from "fetch-cookie";
import * as tough from "tough-cookie";
import { parse } from "node-html-parser";

const cookieJar = new tough.CookieJar();
const fetchCookie = makeFetchCookie(fetch, cookieJar);

export class Kicktipp {
  static baseUrl;

  static async init(config) {
    this.baseUrl = config.baseUrl;
    await this.login(config.username, config.password);
    cookieJar.setCookieSync(
      "timezone=Europe/Berlin",
      "https://www.kicktipp.com",
    );
  }

  static async login(username, password) {
    if (Kicktipp.isLoggedIn()) return;
    try {
      const response = await fetchCookie(this.baseUrl + "/profil/loginaction", {
        method: "POST",
        headers: {
          "User-Agent": "Mozilla/5.0",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
          "Accept-Language": "de,en-US;q=0.7,en;q=0.3",
          "Accept-Encoding": "gzip, deflate, br, zstd",
          "Content-Type": "application/x-www-form-urlencoded",
          Origin: "https://www.kicktipp.com",
          Connection: "keep-alive",
          Referer: this.baseUrl + "/profile/login",
          // Include other necessary headers here
        },
        body: new URLSearchParams({
          kennung: username,
          passwort: password,
          _charset_: "UTF-8",
          submitbutton: "Log in",
        }),
      });
      console.log();
      if (!response.headers.get("set-cookie").includes("login="))
        throw new Error(`Login not successful.`);

      console.log("Login successful:", response.status);
      // Cookies are now managed by fetch-cookie and stored in the CookieJar
    } catch (error) {
      console.error("Login failed:", error.message);
    }
  }

  static async leaderboard() {
    Kicktipp.throwIfNotLoggedIn();

    const response = await fetchCookie(this.baseUrl + "/leaderboard", {
      method: "GET",
    });

    const html = parse(await response.text());

    const spiele = html.getElementById("spielplanSpiele");

    const spieleResult = parseSpielplanSpieleTable(spiele);

    const table = html.getElementById("ranking");
    const header = table.querySelector(".headerErgebnis");
    const body = table.querySelector("tbody");

    const th = header.querySelectorAll("th");
    for (let i = 3; i < th.length - 4; i++) {
      const headerboxes = th[i].querySelectorAll(".headerbox");
      const playing =
        headerboxes[0].innerHTML + " - " + headerboxes[1].innerHTML;
      spieleResult[i - 3]["shorthand"] = playing;
    }
    const tr = body.querySelectorAll("tr");

    tr.forEach((row) => {
      if (row.classNames == "endOfBlock") return;
      const cols = row.querySelectorAll("td");

      const username = cols[2].innerText;
      const bets = row.querySelectorAll(".ereignis");
      bets.forEach((b, i) => {
        const betAray = spieleResult[i]["bets"];
        if (!betAray) {
          spieleResult[i]["bets"] = [];
        }
        const sub = b.querySelector("sub");

        const bet = b.removeChild(sub);
        spieleResult[i]["bets"].push({
          user: username,
          points: sub ? +sub.innerText : 0,
          bet: extractValues(bet.innerText),
        });
      });
    });

    return spieleResult;
  }

  static async schedule(page) {
    Kicktipp.throwIfNotLoggedIn();

    page = page ?? 0;
    const response = await fetchCookie(
      this.baseUrl + "/schedule?spieltagIndex=" + page,
      { method: "GET" },
    );
    await fetch(
      this.baseUrl + "/leaderboard?spieltagIndex=",
      {
        method: "GET",
        mode: "cors",
      },
    );

    const html = parse(await response.text());
    const table = html.getElementById("spiele");

    return parseSpieleTable(table);
  }

  static isLoggedIn() {
    return !!cookieJar
      .getCookiesSync("https://www.kicktipp.com")
      .find((c) => c.key === "login");
  }

  static throwIfNotLoggedIn() {
    if (!this.isLoggedIn()) throw new Error("Not logged in.");
  }
}

function extractValues(bet) {
  const points = bet.trim().split("-");

  return points.length == 2
    ? {
        home: +points[0],
        away: +points[1],
      }
    : undefined;
}

function parseSpielplanSpieleTable(table) {
  const body = table.querySelector("tbody");

  const result = [];

  const tr = body.querySelectorAll("tr");

  tr.forEach((row, i) => {
    const cols = row.querySelectorAll("td");

    const baseObject = {
      index: i,
      date: new Date(cols[0].innerText),
      home: cols[1].innerText,
      away: cols[2].innerText,
      result: extractValues(cols[cols.length - 1].innerText),
    };
    
    if (cols.length === 5) {
      baseObject.group = cols[3].innerText;
    }

    result.push(baseObject);
  });

  return result;
}

function parseSpieleTable(table) {
  const body = table.querySelector("tbody");

  const result = [];

  const tr = body.querySelectorAll("tr");

  tr.forEach((row, i) => {
    const cols = row.querySelectorAll("td");

    result.push({
      index: i,
      date: cols[0].innerText,
      deadline: cols[1].innerText,
      home: cols[2].innerText,
      away: cols[3].innerText,
      group: cols[4].innerText,
    });
  });

  return result;
}
