var fs = require("fs"),
    Steam = require("steam"),
    SteamID = require("steamid"),
    IntervalInt = null,
    readlineSync = require("readline-sync"),
    Protos = require("./protos/protos.js"),
    CountReports = 0,
    Long = require("long"),
    process = require("process"),
    steamID = readlineSync.question("SteamID64 which will be reported: ");

var ClientHello = 4006,
    ClientWelcome = 4004;

var accounts = [];

var arrayAccountsTxt = fs.readFileSync("accounts.txt").toString().split("\n");
for (i in arrayAccountsTxt) {
    var accInfo = arrayAccountsTxt[i].toString().trim().split(":");
    var username = accInfo[0];
    var password = accInfo[1];
    accounts[i] = [];
    accounts[i].push({
        username: username,
        password: password
    });
}

function loginAndReport(steamID) {
    if ((steamID == "") || !(steamID.indexOf("765") > -1) || (steamID.length < 17)) {
        console.log("That's not a valid SteamID!");
        process.exit();
    }
    if (accounts[0]) {
        var account = accounts[0][0];
        var account_name = account.username;
        var password = account.password;
        Client = new Steam.SteamClient();
        User = new Steam.SteamUser(Client);
        GC = new Steam.SteamGameCoordinator(Client, 730);
        Friends = new Steam.SteamFriends(Client);

        Client.connect();

        Client.on("connected", function() {
            User.logOn({
                account_name: account_name,
                password: password
            });
        });

        Client.on("logOnResponse", function(res) {
            if (res.eresult !== Steam.EResult.OK) {
                if (res.eresult == Steam.EResult.ServiceUnavailable) {
                    console.log("\n[STEAM CLIENT - " + account_name + "] Login failed - STEAM IS DOWN!");
                    console.log(res);
                    Client.disconnect();
                    process.exit();
                } else {
                    console.log("\n[STEAM CLIENT - " + account_name + "] Login failed!");
                    console.log(res);
                    Client.disconnect();
                    accounts.splice(0, 1);
                    loginAndReport(steamID);
                }
            } else {
                console.log("\n[STEAM CLIENT - " + account_name + "] Logged in!");

                Friends.setPersonaState(Steam.EPersonaState.Offline);

                User.gamesPlayed({
                    games_played: [{
                        game_id: 730
                    }]
                });

                if (GC) {
                    IntervalInt = setInterval(function() {
                        GC.send({
                            msg: ClientHello,
                            proto: {}
                        }, new Protos.CMsgClientHello({}).toBuffer());
                    }, 2000);
                    console.log("[GC - " + account_name + "] Client Hello sent!");
                } else {
                    console.log("[GC - " + account_name + "] Not initialized!");
                    Client.disconnect();
                    accounts.splice(0, 1);
                    loginAndReport(steamID);
                }
            }
        });

        Client.on("error", function(err) {
            console.log("[STEAM CLIENT - " + account_name + "] " + err);
            console.log("[STEAM CLIENT - " + account_name + "] Account is probably ingame!");
            Client.disconnect();
            accounts.splice(0, 1);
            loginAndReport(steamID);
        });

        GC.on("message", function(header, buffer, callback) {
            switch (header.msg) {
                case ClientWelcome:
                    clearInterval(IntervalInt);
                    console.log("[GC - " + account_name + "] Client Welcome received!");
                    console.log("[GC - " + account_name + "] Report request sent!");
                    sendReport(GC, Client, account_name, steamID);
                    break;
                case Protos.ECsgoGCMsg.k_EMsgGCCStrike15_v2_MatchmakingGC2ClientHello:
                    console.log("[GC - " + account_name + "] MM Client Hello sent!");
                    break;
                case Protos.ECsgoGCMsg.k_EMsgGCCStrike15_v2_ClientReportResponse:
                    console.log("[GC - " + account_name + "] Report with confirmation ID: " + Protos.CMsgGCCStrike15_v2_ClientReportResponse.decode(buffer).confirmationId.toString() + " sent!");
                    Client.disconnect();
                    accounts.splice(0, 1);
                    CountReports++;
                    loginAndReport(steamID);
                    break;
                default:
                    console.log(header);
                    break;
            }
        });
    } else {
        console.log("\n\n" + CountReports + " report(s) successfully sent!");
        Client.disconnect();
    }
}

function sendReport(GC, Client, account_name) {
    console.log("[GC - " + account_name + "] Report request received!");
    console.log("[GC - " + account_name + "] Trying to report the user!");
    var account_id = new SteamID(steamID).accountid;
    GC.send({
        msg: Protos.ECsgoGCMsg.k_EMsgGCCStrike15_v2_ClientReportPlayer,
        proto: {}
    }, new Protos.CMsgGCCStrike15_v2_ClientReportPlayer({
        accountId: account_id,
        matchId: 8,
        rptAimbot: 2,
        rptWallhack: 3,
        rptSpeedhack: 4,
        rptTeamharm: 5,
        rptTextabuse: 6,
        rptVoiceabuse: 7
    }).toBuffer());
}

process.on('uncaughtException', function (err) {
});

loginAndReport(steamID);
console.log("Initializing ReportBot by askwrite...\nCredits: Trololo - Idea");
