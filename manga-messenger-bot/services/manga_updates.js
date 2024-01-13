"use strict";

// Imports dependencies
const Response = require("./response"),
  i18n = require("../i18n.config"),
  config = require("./config");

module.exports = class MangaUpdates {
  static handlePayload(payload) {
    let response;

    switch (payload) {
      case "ADD_MANGA":
        response = Response.genText(i18n.__("manga.website"));
        break;
      case "ADDED_MANGA":
        console.log("in added manga");
        response = Response.genText(i18n.__("manga.added"));
        break;
    }
    return response;
  }
};
