/**
*	package httpserver/networkController.js
**/
const express = require('express');
const bodyParser = require('body-parser');

class NetworkController {
    constructor(tokenManager) {
        this.tokenManager = tokenManager;
        let router = express.Router();
        router.use(bodyParser.json());
        /**
         * 权限管理 @Administrator
         */
        router.use(function (req, res, next) {
            let level = req.__access_level;
            let user = req.__access_user;
            console.debug(`NetworkController: path - ${req.path}, user - ${user}, level - ${level}`);
            switch (req.path) {
                //管理员接口
                case '/add':
                case '/delete':
                case '/info':
                    if (level > 1) {
                        next();
                        break;
                    }
                    res.type('application/json');
                    res.send({ code: 401, msg: "权限不足" });
                    break;
                default:
                    res.type('application/json');
                    res.send({ code: 404, msg: "未注册的接口" });
                    break;
            }
        });
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

    setNetworkDAO(dao) {
        this.networkDAO = dao;
        return this;
    }

    create() {
        return this.controller;
    }
}
module.exports = NetworkController;