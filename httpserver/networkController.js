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
                case '/update/name':
                case '/update/networks':
                case '/get':
                case '/getAll':
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
        /**
         * 增加网络组接口 @Admin
         */
        router.post('/add', async (req, res) => {
            try {
                let network_name = req.body.network_name;
                if (network_name == null || network_name == '')
                    throw new Error('network_name 不能为空');
                if (network_name.length < 5)
                    throw new Error('network_name 不能小于4位');

                let networks = req.body.networks;
                if (networks == null || networks == '')
                    throw new Error('networks 不能为空');
                if (!Array.isArray(networks))
                    throw new Error('networks 必须是数组');
                for (let cidr of networks) {
                    this.networkDAO.isValidCIDR(cidr);
                }
                let code = await this.networkDAO.addNetwork(network_name, networks);
                res.send({
                    code: 0,
                    msg: '创建网络组成功'
                });
            } catch (e) {
                res.send({
                    code: -1,
                    msg: '创建网络组失败' + e
                });
            }
        });
        /**
         * 删除网络组接口 @Admin
         */
        router.post('/delete', async (req, res) => {
            try {
                let uid = req.body.uid;
                if (uid == null || uid == '')
                    throw new Error('uid 不能为空');
                let roles = await this.roleDAO.getAllRoles();
                let usingRole = [];
                for (let role of roles) {
                    for (let networkID of role.networks) {
                        if (networkID == uid) {
                            usingRole.push(role.role_name);
                            continue;
                        }
                    }
                }
                if (usingRole.length > 0)
                    throw new Error(`不能删除正在使用的网络组, 占用对象Roles: ${usingRole}`);

                let code = await this.networkDAO.delNetworkByUId(uid);
                res.send({
                    code: 0,
                    msg: '删除网络组成功'
                });
            } catch (e) {
                res.send({
                    code: -1,
                    msg: '删除网络组失败' + e
                });
            }
        });
        /**
         * 修改网络组名称接口 @Admin
         */
        router.post('/update/name', async (req, res) => {
            try {
                let uid = req.body.uid;
                if (uid == null || uid == '')
                    throw new Error('uid 不能为空');

                let network_name = req.body.network_name;
                if (network_name == null || network_name == '')
                    throw new Error('network_name 不能为空');
                if (network_name.length < 5)
                    throw new Error('network_name 不能小于4位');

                let code = await this.networkDAO.changeNetworkNameByUID(uid, network_name);
                res.send({
                    code: 0,
                    msg: '修改网络组名称成功'
                });
            } catch (e) {
                res.send({
                    code: -1,
                    msg: '修改网络组名称失败' + e
                });
            }
        });
        /**
         * 修改网络组接口 @Admin
         */
        router.post('/update/networks', async (req, res) => {
            try {
                let uid = req.body.uid;
                if (uid == null || uid == '')
                    throw new Error('uid 不能为空');

                let networks = req.body.networks;
                if (networks == null || networks == '')
                    throw new Error('networks 不能为空');
                if (!Array.isArray(networks))
                    throw new Error('networks 必须是数组');
                for (let cidr of networks) {
                    this.networkDAO.isValidCIDR(cidr);
                }
                let code = await this.networkDAO.changeNetworkByUID(uid, networks);
                res.send({
                    code: 0,
                    msg: '修改网络组网络组成功'
                });
            } catch (e) {
                res.send({
                    code: -1,
                    msg: '修改网络组网络组失败' + e
                });
            }
        });
        /**
         * 查询网络组接口 @Admin
         */
        router.post('/get', async (req, res) => {
            try {
                let uid = req.body.uid;
                if (uid == null || uid == '')
                    throw new Error('uid 不能为空');
                let role = await this.networkDAO.getNetworkByUID(uid);
                res.send({
                    code: 0,
                    msg: '查询网络组成功',
                    data: role
                });
            } catch (e) {
                res.send({
                    code: -1,
                    msg: '查询网络组失败' + e
                });
            }
        });
        /**
         * 查询全部网络组接口 @Admin
         */
        router.post('/getAll', async (req, res) => {
            try {
                let roles = await this.networkDAO.getAllNetworks();
                res.send({
                    code: 0,
                    msg: '查询网络组成功',
                    data: roles
                });
            } catch (e) {
                res.send({
                    code: -1,
                    msg: '查询网络组失败' + e
                });
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