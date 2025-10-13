/**
*	package httpserver/userController.js
**/
const express = require('express');

function isAdmin(req) {

}

class UserController {
    constructor(tokenManager) {
        this.tokenManager = tokenManager;
        let router = express.Router();
        /**
         * 测试接口
         */
        router.get('/hello', (req, res) => {
            res.send('????????');
            console.log(req.__access_level);
        });
        /**
         * 登录接口
         */
        router.post('/login', (req, res) => {

            this.userDAO.authLogin(user, pass)
                .then(result => {

                })
                .error(error => {
                    res.send(error); 
                    console.error(error);
                });
        });
        /**
         * 退出接口
         */
        router.post('/logout', (req, res) => {
            res.send('????????');
        });
        /**
         * 增加用户接口
         */
        router.post('/add', (req, res) => {
            res.send('????????');
        });
        /**
         * 删除用户接口
         */
        router.post('/delete', (req, res) => {
            res.send('????????');
        });
        /**
         * 修改用户接口
         */
        router.post('/update', (req, res) => {
            res.send('????????');
        });
        /**
         * 查询用户接口
         */
        router.post('/info', (req, res) => {
            res.send('????????');
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

    create() {
        return this.controller;
    }
}
module.exports = UserController;