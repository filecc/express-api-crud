const express = require("express");
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");

/**
 * @param {express.Request} req 
 * @param {express.Response} res 
 */

function index (req, res) {
    res.send('Homepage')
}

module.exports = {
    index
  }