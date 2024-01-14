const axios = require("axios");
const cheerio = require("cheerio");
const mongoose = require("mongoose");
const Manga = require("../schemas/Manga");
const User = require("../schemas/User");
require("dotenv").config();
const GraphApi = require("./graph-api");
module.exports = class MangaDatabase {
  static async connectToDatabase() {
    const databaseURL = process.env.DATABASE_URL;
    mongoose.connect(databaseURL);
    const database = mongoose.connection;
    database.on("error", (error) => {
      console.log(error);
    });

    database.once("connected", () => {
      console.log("Database Connected");
    });
  }
  static async addUser(user) {
    console.log("Adding user");
    console.log(user);
    if (await User.exists({ psid: user.psid })) {
      console.log("User already exists");
      return;
    }
    const newUser = {
      firstName: user.firstName,
      lastName: user.lastName,
      psid: user.psid
    };

    await User.create(newUser);
    console.log("User added");
  }
  static async addUserManga(user, mangaWebsite) {
    console.log("Adding user to manga");
    const userObj = {
      firstName: user.firstName,
      lastName: user.lastName,
      psid: user.psid
    };
    const manga = await Manga.findOne({ website: mangaWebsite });
    if (manga) {
      if (manga.users.find((mangaUser) => mangaUser.psid === user.psid)) {
        console.log("User already added");
      } else {
        manga.users.push(userObj);
        await manga.save();
        console.log("User added to manga");
      }
    } else {
      console.log("Creating new manga");
      const response = await axios.get(mangaWebsite);
      const $ = cheerio.load(response.data);
      console.log(response);
      let mangaName = "";
      let newestChapter = "";
      if (mangaWebsite.includes("bato.to")) {
        console.log("bato.to Manga");
        mangaName = $("h3.item-title").find("a").text();
        newestChapter = $("div.main").find("b").first().text();
      } else if (mangaWebsite.includes("mangadex")) {
        console.log("mangadex Manga");
        const apiURL = `https://api.mangadex.org/manga/${
          mangaWebsite.split("/")[4]
        }/feed?limit=96&includes%5B%5D=scanlation_group&includes%5B%5D=user&order%5Bvolume%5D=desc&order%5Bchapter%5D=desc&offset=0&contentRating%5B%5D=safe&contentRating%5B%5D=suggestive&contentRating%5B%5D=erotica&contentRating%5B%5D=pornographic`;
        console.log(mangaWebsite);
        console.log(apiURL);
        const apiResponse = await axios.get(apiURL);
        console.log(apiResponse.data.data[0].attributes);
        mangaName = $('meta[property="og:title"]').attr("content");
        newestChapter = apiResponse.data.data[0].attributes.chapter;
      }
      console.log(mangaName);
      console.log(newestChapter);
      const newManga = {
        name: mangaName,
        newestChapter: newestChapter,
        website: mangaWebsite,
        dateLastUpdated: new Date(),
        users: [userObj]
      };
      await Manga.create(newManga);
    }
  }
  static async getMangaName(mangaWebsite) {
    const manga = await Manga.findOne({ website: mangaWebsite });
    return manga.name;
  }
  static async getAllMangaNamesForUser(user) {
    console.log("user is", user);
    const mangas = await Manga.find({ "users.psid": user.psid });
    const mangaNames = mangas.map((manga) => {
      return manga.name;
    });
    return mangaNames;
  }
  static async checkAllMangas() {
    console.log("Checking all mangas");
    const allMangas = await Manga.find({});
    if (allMangas.length > 0) {
      await Promise.all(
        allMangas.map(async (manga) => {
          const response = await axios.get(manga.website);
          const $ = cheerio.load(response.data);
          let newestChapter = "";
          if (manga.website.includes("bato.to")) {
            newestChapter = $("div.main").find("b").first().text();
          } else if (manga.website.includes("mangadex")) {
            const apiURL = `https://api.mangadex.org/manga/${
              manga.website.split("/")[4]
            }/feed?limit=96&includes%5B%5D=scanlation_group&includes%5B%5D=user&order%5Bvolume%5D=desc&order%5Bchapter%5D=desc&offset=0&contentRating%5B%5D=safe&contentRating%5B%5D=suggestive&contentRating%5B%5D=erotica&contentRating%5B%5D=pornographic`;
            const apiResponse = await axios.get(apiURL);
            newestChapter = apiResponse.data.data[0].attributes.chapter;
          }
          const lastSavedChapter = manga.newestChapter;
          if (lastSavedChapter !== newestChapter) {
            console.log("New chapter found!");
            await Manga.updateOne(
              { _id: manga._id },
              {
                newestChapter: newestChapter,
                dateLastUpdated: new Date()
              }
            );
            manga.users.forEach((user) => {
              let requestBody = {
                recipient: {
                  id: user.psid
                },
                message: {
                  text: `Yo ${user.firstName}, a new chapter of ${manga.name} is out! Read here: ${manga.website}`
                }
              };
              GraphApi.callSendApi(requestBody);
            });
          }
          return newestChapter;
        })
      );
    }
  }
};
