/**
*	package httpserver/roleController.js
**/
const express = require('express');
const bodyParser = require('body-parser');

function isValidRoleName(name) {
    const regex = /^[A-Za-z0-9~!@#$%^&*()_=+-]+$/;
    return regex.test(name);
}

class RoleController {
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
            console.debug(`RoleController: path - ${req.path}, user - ${user}, level - ${level}`);
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
         * 增加角色接口 @Admin
         */
        router.post('/add', async (req, res) => {
            try {
                let role_name = req.body.role_name;
                if (role_name == null || role_name == '')
                    throw new Error('role_name 不能为空');
                if (role_name.length < 5)
                    throw new Error('role_name 不能小于4位');
                
                let networks = req.body.networks;
                if (networks == null || networks == '')
                    throw new Error('networks 不能为空');
                if (!Array.isArray(networks))
                    throw new Error('networks 必须是数组');
                for (let networkID of networks) {
                    if (!await this.networkDAO.networkExists(networkID))
                        throw new Error(`networkID:${networkID} 网络组不存在`);
                }
                let code = await this.roleDAO.addRole(role_name, networks);
                res.send({
                    code: 0,
                    msg: '创建角色成功'
                });
            } catch (e) {
                res.send({
                    code: -1,
                    msg: '创建角色失败' + e
                });
            }
        });
        /**
         * 删除角色接口 @Admin
         */
        router.post('/delete', async (req, res) => {
            try {
                let uid = req.body.uid;
                if (uid == null || uid == '')
                    throw new Error('uid 不能为空');
                let users = await this.userDAO.getAllUsers();
                let usingUser = [];
                for (let user of users) {
                    for (let roleID of user.roles) {
                        if (roleID == uid) {
                            usingUser.push(user.username);
                            continue;
                        }
                    }
                }
                if (usingUser.length > 0)
                    throw new Error(`不能删除正在使用的角色, 占用对象Users: ${usingUser}`);

                let code = await this.roleDAO.delRoleByUId(uid);
                res.send({
                    code: 0,
                    msg: '删除角色成功'
                });
            } catch (e) {
                res.send({
                    code: -1,
                    msg: '删除角色失败' + e
                });
            }
        });
        /**
         * 修改角色名称接口 @Admin
         */
        router.post('/update/name', async (req, res) => {
            try {
                let uid = req.body.uid;
                if (uid == null || uid == '')
                    throw new Error('uid 不能为空');

                let role_name = req.body.role_name;
                if (role_name == null || role_name == '')
                    throw new Error('role_name 不能为空');
                if (role_name.length < 5)
                    throw new Error('role_name 不能小于4位');

                let code = await this.roleDAO.changeRolenameByUID(uid, role_name);
                res.send({
                    code: 0,
                    msg: '修改角色名称成功'
                });
            } catch (e) {
                res.send({
                    code: -1,
                    msg: '修改角色名称失败' + e
                });
            }
        });
        /**
         * 修改角色网络组接口 @Admin
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
                for (let networkID of networks) {
                    if (!await this.networkDAO.networkExists(networkID))
                        throw new Error(`networkID:${networkID} 网络组不存在`);
                }
                let code = await this.roleDAO.changeRoleByUID(uid, networks);
                res.send({
                    code: 0,
                    msg: '修改角色网络组成功'
                });
            } catch (e) {
                res.send({
                    code: -1,
                    msg: '修改角色网络组失败' + e
                });
            }
        });
        /**
         * 查询角色接口 @Admin
         */
        router.post('/get', async (req, res) => {
            try {
                let uid = req.body.uid;
                if (uid == null || uid == '')
                    throw new Error('uid 不能为空');
                let role = await this.roleDAO.getRoleByUID(uid);
                res.send({
                    code: 0,
                    msg: '查询角色成功',
                    data: role
                });
            } catch (e) {
                res.send({
                    code: -1,
                    msg: '查询角色失败' + e
                });
            }
        });
        /**
         * 查询全部角色接口 @Admin
         */
        router.post('/getAll', async (req, res) => {
            try {
                let roles = await this.roleDAO.getAllRoles();
                res.send({
                    code: 0,
                    msg: '查询角色成功',
                    data: roles
                });
            } catch (e) {
                res.send({
                    code: -1,
                    msg: '查询角色失败' + e
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
module.exports = RoleController;