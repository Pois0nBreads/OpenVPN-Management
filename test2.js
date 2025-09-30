#!/usr/bin/env node

require('./env.js');
const config = require('./config.js');
//导入DAO包
const UserDAO = require('./dao/userDAO.js');
const RoleDAO = require('./dao/roleDAO.js');


let userDao = new UserDAO(config.dataBase);
let roleDAO = new RoleDAO(config.dataBase);





function cidrToIpAndMask(cidr) {
    const [ip, prefix] = cidr.split('/');
    if (!ip || !prefix) throw new Error('Invalid CIDR format');
    
    const prefixLength = parseInt(prefix, 10);
    if (prefixLength < 0 || prefixLength > 32) throw new Error('Invalid prefix length');

    // 计算子网掩码
    let mask = 0xFFFFFFFF << (32 - prefixLength);
    mask = mask >>> 0; // 转换为无符号32位整数
    
    // 将掩码转为IP格式
    const maskOctets = [
        (mask >>> 24) & 0xFF,
        (mask >>> 16) & 0xFF,
        (mask >>> 8) & 0xFF,
        mask & 0xFF
    ].join('.');

    return `${ip} ${maskOctets}`;
}

// 示例使用
const result = cidrToIpAndMask('192.168.60.0/24');
console.log(result); // 输出: 192.168.60.0 255.255.255.0




// roleDAO.addRole('test', [1,3,0], (err, result) => {
//     if (err)
//         console.error(err);
//     else
//         console.log(result);  
// });

// roleDAO.getAllRoles((err, result) => {
//   	if (err)
// 		console.error(err);
// 	else
// 		console.log(result);  
// })

// userDao.addUser("admini2", "23333", (err, result) => {
// 	if (err)
// 		console.error(err);
// 	else
// 		console.log(result);
// })

// userDao.getUserByName('admin2', (err, result) => {
// 	console.log(result);
// });

// userDao.getAllUsers((err, result) => {
// 	console.log(result);
// });

// userDao.delUserByName('test', (err, result) => {
// 	if (err)
// 		console.error(err);
// 	else
// 		console.log(result);
// });

// userDao.changePassByName('admin', 'ppppp', (err, result) => {
// 	if (err)
// 		console.error(err);
// 	else
// 		console.log(result);
// });

// userDao.getUserByName('admin', (err, result) => {
// 	console.log(result);
// });

// userDao.authLogin('admin', 'ppppp', (err, state, msg) => {
// 	if (err)
// 		console.log(err.message)
// 	console.log(state);
// });

// userDao.changeNicknameByName('admin', '你妈妈买的', (err, result) => {
// 	console.log(result);
// });

// let roles = [1, 99, 2342];

// userDao.changeRolesByName('admin', roles, (err, result) => {
// 	console.log(result);
// });

// userDao.getUserByName('admin', (err, result) => {
// 	console.log(result);
// });