const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const mongoose = require("mongoose");
const Manga = require("./Manga");
require("dotenv").config();
const app = express();

const connectToDatabase = async () => {
  const databaseURL = process.env.DATABASE_URL;
  mongoose.connect(databaseURL);
  const database = mongoose.connection;
  database.on("error", (error) => {
    console.log(error);
  });

  database.once("connected", () => {
    console.log("Database Connected");
  });
};

const getAllMangas = async () => {
  const mangas = await Manga.find({});
  return mangas;
};
const checkAllMangas = async () => {
  const allMangas = await getAllMangas();
  if (allMangas.length > 0) {
    await Promise.all(
      allMangas.map(async (manga) => {
        const response = await axios.get(manga?.url);
        const $ = cheerio.load(response.data);
        const newestChapter = $("div.main").find("b").first().text();
        console.log(newestChapter);
        const lastSavedChapter = manga?.newestChapter;
        if (lastSavedChapter !== newestChapter) {
          console.log("New chapter found!");
          await Manga.updateOne(
            { _id: manga?._id },
            {
              newestChapter: newestChapter,
              dateLastUpdated: new Date(),
            }
          );
        }
        return newestChapter;
      })
    );
  }
};

connectToDatabase().then(() => {
  setInterval(checkAllMangas, 10000); // Check every minute
});

app.listen(3001, () => {
  console.log("Server running on port 3001");
});
