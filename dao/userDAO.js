/**
 * package dao/userDAO.js
 * Struct User {
 *      int uid,                    //用户id
 *      varchar(255) username,      //用户名
 *      varchar(255) password,      //密码
 *      varchar(255) nickname,      //昵称
 *      varchar(255) roles,         //拥有角色
 *      int(255) last_login,        //最后登陆时间
 * }
 * 
 */
const mysql = require('mysql');
const crypto = require('crypto');
const util = require('util');

const USER_TABLE_NAME = "user";

function sha256Hash(str) {
    const hash = crypto.createHash('sha256');
    hash.update(str);
    return hash.digest('hex');
}

class UserDAO {
    constructor(options) {
        this.pool = mysql.createPool({
            host: options.host,
            port: options.port,
            user: options.user,
            password: options.password,
            database: options.database,
            connectionLimit: 10,
            acquireTimeout: 10000
        });
        
        // 将 pool.query 转换为 Promise 版本
        this.pool.query = util.promisify(this.pool.query);
    }

    async initAdministrator() {
        const sql1 = `SELECT * FROM ${USER_TABLE_NAME} where username = 'Administrator'`;
        const data1 = await this.pool.query(sql1);
        if (data1.length > 0)
            return null;
        const defaultPass = '88888888';
        console.log(`Administrator not found, Create Administrator Pass is ${defaultPass}`);
        const sql2 = `INSERT INTO ${USER_TABLE_NAME} (username, password) VALUES ('Administrator', '${sha256Hash(defaultPass)}')`;
        const data2 = await this.pool.query(sql2);
        return data2;
    }

    /**
     * 获取全部用户
     * @returns {Promise<Array>} 用户列表
     */
    async getAllUsers(getPass = false) {
        try {
            const sql = `SELECT * FROM ${USER_TABLE_NAME}`;
            const data = await this.pool.query(sql);
            
            // 处理 roles 字段
            for (let i = 0; i < data.length; i++) {
                data[i].roles = data[i].roles.split(',').filter(Boolean);
                if (!getPass)
                    delete data[i].password;
            }
            
            return data;
        } catch (err) {
            throw err;
        }
    }

    /**
     * 根据用户名获取信息
     * @param {string} name 用户名
     * @returns {Promise<Object|null>} 用户信息或null
     */
    async getUserByName(name, getPass = false) {
        try {
            const sql = `SELECT * FROM ${USER_TABLE_NAME} WHERE username = ?`;
            const result = await this.pool.query(sql, [name]);
            
            if (result.length === 0) {
                return null;
            }
            
            const data = result[0];
            data.roles = data.roles.split(',').filter(Boolean);
            if (!getPass)
                delete data.password;
            return data;
        } catch (err) {
            throw err;
        }
    }

    /**
     * 验证用户登录, 如果成功记录登录时间
     * @param {string} user 用户名
     * @param {string} pass 密码
     * @returns {Promise<number>} 结果代码 (-1:Error, 0:Ok, 1:Fail)
     */
    async authLogin(user, pass) {
        try {
            const result = await this.getUserByName(user, true);
            
            if (!result) {
                return 1; // 用户不存在
            }
            
            const passSha256 = result.password;
            if (passSha256 !== sha256Hash(pass)) {
                return 2; // 密码错误
            }
            
            // 更新最后登录时间（不等待完成）
            const updateSql = `UPDATE ${USER_TABLE_NAME} SET last_login = ? WHERE username = ?`;
            this.pool.query(updateSql, [new Date().getTime(), user])
                .catch(err => console.error('更新登录时间失败:', err));
            
            return 0; // 登录成功
        } catch (err) {
            throw err;
        }
    }

    /**
     * 创建用户
     * @param {string} name 用户名
     * @param {string} pass 密码
     * @returns {Promise<Object>} 插入结果
     */
    async addUser(name, pass) {
        if (name == 'Administrator')
            throw new Error("Failed to add user. User already exists!");
        try {
            const existingUser = await this.getUserByName(name);
            
            if (existingUser) {
                throw new Error("Failed to add user. User already exists!");
            }
            
            const sql = `INSERT INTO ${USER_TABLE_NAME} (username, password) VALUES (?, ?)`;
            const result = await this.pool.query(sql, [name, sha256Hash(pass)]);
            return result;
        } catch (err) {
            throw err;
        }
    }

    /**
     * 根据用户名删除用户
     * @param {string} name 用户名
     * @returns {Promise<Object>} 删除结果
     */
    async delUserByName(name) {
        if (name == 'Administrator')
            throw new Error("Failed to del user. Administrator cannot delete!");
        try {
            const existingUser = await this.getUserByName(name);
            
            if (!existingUser) {
                throw new Error("Failed to delete user. User does not exist!");
            }
            
            const sql = `DELETE FROM ${USER_TABLE_NAME} WHERE username = ?`;
            const result = await this.pool.query(sql, [name]);
            return result;
        } catch (err) {
            throw err;
        }
    }

    /**
     * 根据用户名修改密码
     * @param {string} name 用户名
     * @param {string} newpass 新密码
     * @returns {Promise<Object>} 更新结果
     */
    async changePassByName(name, newpass) {
        try {
            const existingUser = await this.getUserByName(name);
            
            if (!existingUser) {
                throw new Error("Failed to modify user. User does not exist!");
            }
            
            const sql = `UPDATE ${USER_TABLE_NAME} SET password = ? WHERE username = ?`;
            const result = await this.pool.query(sql, [sha256Hash(newpass), name]);
            return result;
        } catch (err) {
            throw err;
        }
    }

    /**
     * 根据用户名修改昵称
     * @param {string} name 用户名
     * @param {string} nickname 新昵称
     * @returns {Promise<Object>} 更新结果
     */
    async changeNicknameByName(name, nickname) {
        try {
            const existingUser = await this.getUserByName(name);
            
            if (!existingUser) {
                throw new Error("Failed to modify user. User does not exist!");
            }
            
            const sql = `UPDATE ${USER_TABLE_NAME} SET nickname = ? WHERE username = ?`;
            const result = await this.pool.query(sql, [nickname, name]);
            return result;
        } catch (err) {
            throw err;
        }
    }

    /**
     * 根据用户名修改所拥有角色组
     * @param {string} name 用户名
     * @param {Array} roles 角色数组
     * @returns {Promise<Object>} 更新结果
     */
    async changeRolesByName(name, roles) {
        try {
            const existingUser = await this.getUserByName(name);
            
            if (!existingUser) {
                throw new Error("Failed to modify user. User does not exist!");
            }
            
            const rolestr = roles.join(',');
            const sql = `UPDATE ${USER_TABLE_NAME} SET roles = ? WHERE username = ?`;
            const result = await this.pool.query(sql, [rolestr, name]);
            return result;
        } catch (err) {
            throw err;
        }
    }
}

module.exports = UserDAO;