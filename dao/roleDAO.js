/**
 * package dao/roleDAO.js
 * Struct Role {
 *      int uid,                    //角色唯一ID
 *      varchar(255) role_name,     //角色名称
 *      varchar(255) networks,      //角色所有网络组
 * }
 * 
 */
const mysql = require('mysql');
const util = require('util');

const ROLE_TABLE_NAME = "role";

class RoleDAO {
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

    /**
     * 获取全部角色
     * @returns {Promise<Array>} 角色列表
     */
    async getAllRoles() {
        try {
            const sql = `SELECT * FROM ${ROLE_TABLE_NAME}`;
            const data = await this.pool.query(sql);
            
            // 处理 networks 字段
            for (let i = 0; i < data.length; i++) {
                data[i].networks = data[i].networks.split(',').filter(Boolean);
            }
            
            return data;
        } catch (err) {
            throw err;
        }
    }

    /**
     * 根据角色ID获取信息
     * @param {number} uid 角色UID
     * @returns {Promise<Object|null>} 角色信息或null
     */
    async getRoleByUID(uid) {
        try {
            const sql = `SELECT * FROM ${ROLE_TABLE_NAME} WHERE uid = ?`;
            const result = await this.pool.query(sql, [uid]);
            
            if (result.length === 0) {
                return null;
            }
            
            const data = result[0];
            data.networks = data.networks.split(',').filter(Boolean);
            return data;
        } catch (err) {
            throw err;
        }
    }

    /**
     * 创建角色
     * @param {string} roleName 角色名
     * @param {Array} networks 网络组数组
     * @returns {Promise<Object>} 插入结果
     */
    async addRole(roleName, networks) {
        try {
            const networkstr = networks.join(',');
            const sql = `INSERT INTO ${ROLE_TABLE_NAME} (role_name, networks) VALUES (?, ?)`;
            const result = await this.pool.query(sql, [roleName, networkstr]);
            return result;
        } catch (err) {
            throw err;
        }
    }

    /**
     * 根据角色UID删除
     * @param {number} uid 角色UID
     * @returns {Promise<Object>} 删除结果
     */
    async delRoleByUId(uid) {
        try {
            const existingRole = await this.getRoleByUID(uid);
            
            if (!existingRole) {
                throw new Error("Failed to delete role. Role does not exist!");
            }
            
            const sql = `DELETE FROM ${ROLE_TABLE_NAME} WHERE uid = ?`;
            const result = await this.pool.query(sql, [uid]);
            return result;
        } catch (err) {
            throw err;
        }
    }

    /**
     * 根据UID修改角色名称
     * @param {number} uid 角色UID
     * @param {string} roleName 角色名
     * @returns {Promise<Object>} 更新结果
     */
    async changeRolenameByUID(uid, roleName) {
        try {
            const existingRole = await this.getRoleByUID(uid);
            
            if (!existingRole) {
                throw new Error("Failed to modify role. Role does not exist!");
            }
            
            const sql = `UPDATE ${ROLE_TABLE_NAME} SET role_name = ? WHERE uid = ?`;
            const result = await this.pool.query(sql, [roleName, uid]);
            return result;
        } catch (err) {
            throw err;
        }
    }

    /**
     * 根据UID修改所拥有网络组
     * @param {number} uid 角色UID
     * @param {Array} networks 网络组数组
     * @returns {Promise<Object>} 更新结果
     */
    async changeRoleByUID(uid, networks) {
        try {
            const existingRole = await this.getRoleByUID(uid);
            
            if (!existingRole) {
                throw new Error("Failed to modify role. Role does not exist!");
            }
            
            const networkstr = networks.join(',');
            const sql = `UPDATE ${ROLE_TABLE_NAME} SET networks = ? WHERE uid = ?`;
            const result = await this.pool.query(sql, [networkstr, uid]);
            return result;
        } catch (err) {
            throw err;
        }
    }

    /**
     * 根据角色名称获取信息
     * @param {string} roleName 角色名称
     * @returns {Promise<Object|null>} 角色信息或null
     */
    async getRoleByName(roleName) {
        try {
            const sql = `SELECT * FROM ${ROLE_TABLE_NAME} WHERE role_name = ?`;
            const result = await this.pool.query(sql, [roleName]);
            
            if (result.length === 0) {
                return null;
            }
            
            const data = result[0];
            data.networks = data.networks.split(',').filter(Boolean);
            return data;
        } catch (err) {
            throw err;
        }
    }

    /**
     * 检查角色是否存在
     * @param {number} uid 角色UID
     * @returns {Promise<boolean>} 是否存在
     */
    async roleExists(uid) {
        try {
            const role = await this.getRoleByUID(uid);
            return role !== null;
        } catch (err) {
            throw err;
        }
    }
}

module.exports = RoleDAO;