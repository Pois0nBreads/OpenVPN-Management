# OpenVPN Management System

一个基于Node.js的OpenVPN管理系统，提供完整的VPN服务管理、用户认证、网络访问控制和Web管理接口。

## 📋 项目状态

### ✅ 已完成功能
- **核心架构**: 完整的四层架构设计
- **认证系统**: 多用户认证、角色权限管理
- **VPN管理**: OpenVPN服务启停、客户端管理
- **网络控制**: 动态IPtables规则管理
- **系统监控**: 资源使用情况监控
- **Web界面**: 基础登录和管理页面

### ⚠️ 已知问题与缺失组件

#### 🔴 关键缺失
1. **数据库Schema**: 缺少完整的SQL建表脚本
2. **前端页面**: 多个管理页面缺失（用户管理、角色管理、网络组管理等）
3. **数据库初始化**: 缺少初始数据插入脚本

#### 🟡 需要改进
1. **安全性**: 硬编码数据库密码，需要环境变量配置
2. **错误处理**: 部分组件错误处理不完善
3. **配置管理**: 缺少配置验证和动态重载
4. **测试**: 缺少单元测试和集成测试

## 🚀 功能特性

### 🔐 认证与授权
- 多用户认证系统
- 基于角色的权限控制
- 密码SHA256加密存储
- Token-based会话管理

### 🌐 网络访问控制
- 动态IPtables规则管理
- 基于角色的网络组权限
- CIDR网络段精确控制
- 实时路由下发

### 🛡️ VPN服务管理
- OpenVPN服务启动/停止
- 客户端连接管理
- 实时状态监控
- 动态配置下发

### 💻 Web管理接口
- RESTful API设计
- 用户/角色/网络组管理
- 实时防火墙规则配置
- 安全路径防护

## 🏗️ 系统架构

```
OpenVPN Management System
├── 前端界面 (public/)
│   ├── index.html - 登录页面 ✅
│   ├── admin/ - 管理界面
│   │   ├── index.html - 系统概览 ✅
│   │   ├── vpn.html - VPN状态管理 ✅
│   │   ├── vpnclient.html - 客户端管理 ✅
│   │   ├── vpnconfig.html - VPN配置 ✅
│   │   ├── usermanager.html - ❌ 缺失
│   │   ├── rolemanager.html - ❌ 缺失
│   │   ├── networkmanager.html - ❌ 缺失
│   │   └── ... 其他管理页面
│   └── user/ - 用户界面
│       └── index.html - 用户概览 ✅
├── HTTP服务层 (httpserver/)
│   ├── UserController - 用户管理 ✅
│   ├── RoleController - 角色管理 ✅
│   ├── NetworkController - 网络组管理 ✅
│   ├── VPNController - VPN服务管理 ✅
│   ├── SystemController - 系统监控 ✅
│   └── TokenManager - 会话管理 ✅
├── 核心业务层 (core/)
│   ├── openvpn/ - VPN服务管理 ✅
│   │   ├── core.js - 主控制器
│   │   ├── manager.js - 客户端管理
│   │   └── config.js - 配置管理
│   └── iptables/ - 防火墙管理 ✅
│       ├── manager.js - 规则管理器
│       ├── controller.js - 底层操作
│       └── iplearner.js - IP学习器
├── 数据访问层 (dao/)
│   ├── UserDAO - 用户数据 ✅
│   ├── RoleDAO - 角色数据 ✅
│   ├── NetworkDAO - 网络组数据 ✅
│   └── ConfigDAO - 配置数据 ✅
└── 配置层
    ├── config.js - 应用配置 ✅
    ├── env.js - 环境配置 ✅
    └── package.json - 依赖管理 ✅
```

## 📦 快速开始

### 环境要求

- **Node.js**: 推荐 v16+
- **MySQL**: 5.7+
- **OpenVPN**: 2.4+
- **IPtables**: Linux内核防火墙

### 安装步骤

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd OpenVPN-Management
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **数据库配置**
   ```sql
   -- 创建数据库
   CREATE DATABASE openvpn_management;

   -- 创建用户并授权
   CREATE USER 'ovpn'@'localhost' IDENTIFIED BY 'your_password';
   GRANT ALL PRIVILEGES ON openvpn_management.* TO 'ovpn'@'localhost';
   FLUSH PRIVILEGES;
   ```

4. **数据库Schema** ⚠️ **需要创建**

   **目前缺少完整的数据库schema文件，需要手动创建以下表结构：**

   ```sql
   -- user表
   CREATE TABLE user (
       uid INT AUTO_INCREMENT PRIMARY KEY,
       username VARCHAR(255) UNIQUE NOT NULL,
       password VARCHAR(255) NOT NULL,
       nickname VARCHAR(255),
       roles JSON,
       last_login DATETIME
   );

   -- role表
   CREATE TABLE role (
       uid INT AUTO_INCREMENT PRIMARY KEY,
       role_name VARCHAR(255) NOT NULL,
       networks JSON
   );

   -- network表
   CREATE TABLE network (
       uid INT AUTO_INCREMENT PRIMARY KEY,
       network_name VARCHAR(255) NOT NULL,
       networks JSON
   );

   -- config表
   CREATE TABLE config (
       id INT AUTO_INCREMENT PRIMARY KEY,
       ca TEXT,
       cert TEXT,
       key TEXT,
       dh TEXT,
       serverNet VARCHAR(255),
       serverPort VARCHAR(10)
   );
   ```

5. **配置文件**

   编辑 `config.js` 文件：
   ```javascript
   module.exports = {
       httpServer: {
           port: 8080
       },
       dataBase: {
           host: "localhost",
           port: 3306,
           user: "ovpn",
           password: "your_password",
           database: "openvpn_management"
       }
   }
   ```

6. **启动服务**
   ```bash
   node test.js
   ```

### 默认管理员账户

系统启动时会自动创建默认管理员账户：
- **用户名**: Administrator
- **密码**: Administrator
- **权限**: 管理员 (level 2)

## 🔧 开发与部署

### 项目依赖

```json
{
  "express": "^5.1.0",
  "mysql": "^2.18.1",
  "body-parser": "^2.2.0",
  "cookie-parser": "^1.4.7",
  "netmask": "^2.0.2",
  "systeminformation": "^5.27.11",
  "uuid": "^8.3.2"
}
```

### 文件结构说明

- `core/`: 核心业务逻辑
  - `openvpn/`: OpenVPN服务管理
  - `iptables/`: 防火墙规则管理
- `httpserver/`: HTTP API接口控制器
- `dao/`: 数据访问对象
- `public/`: 静态资源文件
  - `admin/`: 管理员界面
  - `user/`: 用户界面
  - `static/`: CSS、JS、字体等资源
- `ssl/`: SSL证书目录

### 添加新功能

1. 在对应模块创建控制器
2. 实现数据访问层
3. 配置HTTP路由
4. 更新权限验证

## 📊 API接口文档

### 用户管理

#### 用户登录
```http
POST /api/user/login
Content-Type: application/json

{
    "user": "Administrator",
    "pass": "Administrator"
}
```

#### 获取用户权限级别
```http
POST /api/user/mylevel
Authorization: <token>
```

#### 用户登出
```http
POST /api/user/logout
Authorization: <token>
```

### VPN服务管理

#### 获取VPN状态
```http
POST /api/vpn/status
Authorization: <token>
```

#### 启动VPN服务
```http
POST /api/vpn/start
Authorization: <token>
```

#### 停止VPN服务
```http
POST /api/vpn/stop
Authorization: <token>
```

#### 获取VPN日志
```http
POST /api/vpn/getLog
Authorization: <token>
```

#### 获取客户端列表
```http
POST /api/vpn/getClients
Authorization: <token>
```

#### 强制客户端下线
```http
POST /api/vpn/killClient
Authorization: <token>
Content-Type: application/json

{
    "id": "client_id"
}
```

### 系统监控

#### 获取系统信息
```http
POST /api/system/systemInfo
Authorization: <token>
```

#### 获取内存信息
```http
POST /api/system/memInfo
Authorization: <token>
```

## 🔐 权限级别

系统定义了三种权限级别：

- **0 - 匿名用户**: 仅能登录
- **1 - 普通用户**: 可以查看基本信息
- **2 - 管理员**: 完整的管理权限

## 🌐 网络访问控制

### 网络组配置

网络组用于定义可访问的网络段：
```json
{
    "name": "办公网络",
    "networks": ["192.168.1.0/24", "10.10.0.0/16"]
}
```

### 角色权限关联

角色与网络组关联，用户通过角色获得网络访问权限：
```json
{
    "name": "开发角色",
    "networks": ["network_group_id1", "network_group_id2"]
}
```

## 🛡️ 防火墙规则

系统自动管理IPtables规则：

- 为每个角色创建独立的IPtables链
- 根据用户连接动态应用规则
- 支持CIDR网络段精确控制
- 实时规则更新

## ⚠️ 安全注意事项

### 当前安全配置
- **路径遍历防护**: 防止恶意文件访问
- **输入验证**: 用户名、密码格式验证
- **会话安全**: Token过期机制
- **权限验证**: 接口级别权限控制

### 需要改进的安全问题
- **硬编码密码**: 数据库密码硬编码在配置文件中
- **缺少输入验证**: 部分API缺少完整的输入验证
- **缺少HTTPS**: 建议在生产环境启用HTTPS

## 🔍 故障排除

### 常见问题

1. **OpenVPN服务无法启动**
   - 检查OpenVPN配置文件
   - 验证端口是否被占用

2. **数据库连接失败**
   - 检查MySQL服务状态
   - 验证数据库配置
   - 确保数据库表结构已创建

3. **防火墙规则不生效**
   - 检查IPtables服务状态
   - 验证网络组配置

4. **Web界面页面缺失**
   - 检查public/admin目录下是否缺少页面文件
   - 确保所有引用的页面文件存在

### 日志查看

系统运行日志输出到控制台，包含：
- 用户认证信息
- VPN连接状态
- 防火墙规则变更
- 数据库操作

## 🎯 后续开发计划

### 高优先级
- [ ] 创建完整的数据库schema文件
- [ ] 实现缺失的管理页面（用户管理、角色管理、网络组管理）
- [ ] 改进安全性配置（环境变量、输入验证）

### 中优先级
- [ ] 添加单元测试
- [ ] 实现配置验证和动态重载
- [ ] 完善错误处理和日志记录

### 低优先级
- [ ] 添加API文档
- [ ] 实现备份恢复功能
- [ ] 添加系统服务配置

## 📄 许可证

本项目采用 ISC 许可证。

## 🤝 贡献

欢迎提交Issue和Pull Request来改进项目。

## 📞 联系方式

如有问题，请通过以下方式联系：
- 项目Issue
- 邮件联系