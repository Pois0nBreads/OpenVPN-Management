-- OpenVPN Management System Initial Data
-- 初始数据插入脚本

USE openvpn_management;

-- 插入默认角色
INSERT IGNORE INTO `role` (`uid`, `role_name`, `networks`, `description`) VALUES
(1, '管理员', '1,2', '系统管理员，拥有所有权限'),
(2, '普通用户', '2', '普通用户，拥有基本网络访问权限');

-- 插入默认网络组
INSERT IGNORE INTO `network` (`uid`, `network_name`, `networks`, `description`) VALUES
(1, '管理网络', '192.168.0.0/16,10.0.0.0/8', '内部管理网络段'),
(2, '互联网访问', '0.0.0.0/0', '允许访问所有互联网资源');

-- 插入默认管理员用户 (密码: 88888888)
-- 注意：密码使用SHA256加密存储
INSERT IGNORE INTO `user` (`uid`, `username`, `password`, `nickname`, `roles`) VALUES
(1, 'Administrator', 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3', '系统管理员', '1');

-- 插入默认配置
INSERT IGNORE INTO `config` (`id`, `ca`, `cert`, `key`, `dh`, `serverNet`, `serverPort`) VALUES
(1, NULL, NULL, NULL, NULL, '10.8.0.0/24', '1194');

-- 插入示例普通用户 (密码: 123456)
INSERT IGNORE INTO `user` (`uid`, `username`, `password`, `nickname`, `roles`) VALUES
(2, 'user1', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', '示例用户1', '2'),
(3, 'user2', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', '示例用户2', '2');

-- 显示插入结果
SELECT '角色表数据:' AS '检查结果';
SELECT * FROM `role`;

SELECT '网络组表数据:' AS '检查结果';
SELECT * FROM `network`;

SELECT '用户表数据:' AS '检查结果';
SELECT uid, username, nickname, roles FROM `user`;

SELECT '配置表数据:' AS '检查结果';
SELECT * FROM `config`;