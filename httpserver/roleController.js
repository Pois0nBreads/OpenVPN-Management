/**
*	package httpserver/roleController.js
**/
const express = require('express');

class RoleController {
    constructor(tokenManager) {
        this.tokenManager = tokenManager;
        let router = express.Router();
        router.get('/hello', (req, res) => {
            res.send('????????');
            console.log(req.__access_level);
        })
        this.controller = router;
    }

    setUserDAO(dao) {
        this.userDAO = dao;
        return this;
    }

    setRoleDAO(dao) {
        this.roleDAO = dao;
        return this;
    }

    create() {
        return this.controller;
    }
}
module.exports = RoleController;