"use strict";

// Imports dependencies
const MangaDatabase = require("./manga-database");
const Response = require("./response"),
  i18n = require("../i18n.config"),
  config = require("./config");

module.exports = class MangaUpdates {
  constructor(user, mangaWebsite) {
    console.log("in manga updates");
    console.log(mangaWebsite);
    this.user = user;
    this.mangaWebsite = mangaWebsite;
  }
  handlePayload(payload) {
    let response;

    switch (payload) {
      case "ADD_MANGA":
        response = Response.genText(i18n.__("manga.website"));
        break;
      case "ADDED_MANGA":
        console.log("in added manga");
        console.log("passing in", this.mangaWebsite);
        MangaDatabase.addUserManga(this.user, this.mangaWebsite);
        response = Response.genText(i18n.__("manga.added"));
        break;
      case "REMOVE_MANGA":
        console.log("in remove manga");
        response = Response.genText(i18n.__("manga.remove"));
        break;
      case "LIST_MANGA":
        console.log("in list manga");

        (async () => {
          const names = (
            await MangaDatabase.getAllMangaNamesForUser(this.user)
          ).join(", ");
          console.log("names are", names);
          response = Response.genText(i18n.__("manga.list", { mangas: names }));
        })();
    }
    return response;
  }
};
