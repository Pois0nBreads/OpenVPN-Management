/**
*	package httpserver/userController.js
**/
const express = require('express');

class UserController {
    constructor() {
        let router = express.Router();
        router.get('/hello', (req, res) => {
            res.send('????????');
            console.log(req.__access_level);
        })
        this.controller = router;
    }

    create() {
        return this.controller;
    }
}
module.exports = UserController;