# OpenVPN Management System

一个基于Node.js的OpenVPN管理系统，提供完整的VPN服务管理、用户认证、网络访问控制和Web管理接口。

## 功能特性

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

## 系统架构

```
OpenVPN Management System
├── 前端界面 (usercenter/)
├── HTTP服务层 (httpserver/)
│   ├── UserController - 用户管理
│   ├── RoleController - 角色管理
│   ├── NetworkController - 网络组管理
│   └── TokenManager - 会话管理
├── 核心业务层 (core/)
│   ├── openvpn/ - VPN服务管理
│   │   ├── core.js - 主控制器
│   │   ├── manager.js - 客户端管理
│   │   └── config.js - 配置管理
│   └── iptables/ - 防火墙管理
│       ├── manager.js - 规则管理器
│       ├── controller.js - 底层操作
│       └── iplearner.js - IP学习器
├── 数据访问层 (dao/)
│   ├── UserDAO - 用户数据
│   ├── RoleDAO - 角色数据
│   └── NetworkDAO - 网络组数据
└── 配置层
    ├── config.js - 应用配置
    └── env.js - 环境配置
```

## 快速开始

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

4. **配置文件**

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

5. **启动服务**
   ```bash
   node test.js
   ```

### 默认管理员账户

系统启动时会自动创建默认管理员账户：
- **用户名**: admin
- **密码**: admin
- **权限**: 管理员 (level 2)

## API接口文档

### 用户管理

#### 用户登录
```http
POST /user/login
Content-Type: application/json

{
    "username": "admin",
    "password": "admin"
}
```

#### 获取用户列表
```http
GET /user/list
Authorization: Bearer <token>
```

#### 创建用户
```http
POST /user/create
Authorization: Bearer <token>
Content-Type: application/json

{
    "username": "newuser",
    "password": "password123",
    "roles": ["role_id1", "role_id2"]
}
```

### 角色管理

#### 获取角色列表
```http
GET /role/list
Authorization: Bearer <token>
```

#### 创建角色
```http
POST /role/create
Authorization: Bearer <token>
Content-Type: application/json

{
    "name": "开发人员",
    "networks": ["network_id1", "network_id2"]
}
```

### 网络组管理

#### 获取网络组列表
```http
GET /network/list
Authorization: Bearer <token>
```

#### 创建网络组
```http
POST /network/create
Authorization: Bearer <token>
Content-Type: application/json

{
    "name": "内部网络",
    "networks": ["192.168.1.0/24", "10.0.0.0/8"]
}
```

## 权限级别

系统定义了三种权限级别：

- **0 - 匿名用户**: 仅能登录
- **1 - 普通用户**: 可以查看基本信息
- **2 - 管理员**: 完整的管理权限

## 网络访问控制

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

## 防火墙规则

系统自动管理IPtables规则：

- 为每个角色创建独立的IPtables链
- 根据用户连接动态应用规则
- 支持CIDR网络段精确控制
- 实时规则更新

## 安全特性

- **路径遍历防护**: 防止恶意文件访问
- **输入验证**: 用户名、密码格式验证
- **会话安全**: Token过期机制
- **权限验证**: 接口级别权限控制

## 开发指南

### 项目结构说明

- `core/`: 核心业务逻辑
- `httpserver/`: HTTP API接口
- `dao/`: 数据访问对象
- `public/`: 静态资源文件
- `ssl/`: SSL证书目录

### 添加新功能

1. 在对应模块创建控制器
2. 实现数据访问层
3. 配置HTTP路由
4. 更新权限验证

## 故障排除

### 常见问题

1. **OpenVPN服务无法启动**
   - 检查OpenVPN配置文件
   - 验证端口是否被占用

2. **数据库连接失败**
   - 检查MySQL服务状态
   - 验证数据库配置

3. **防火墙规则不生效**
   - 检查IPtables服务状态
   - 验证网络组配置

### 日志查看

系统运行日志输出到控制台，包含：
- 用户认证信息
- VPN连接状态
- 防火墙规则变更
- 数据库操作

## 许可证

本项目采用 ISC 许可证。

## 贡献

欢迎提交Issue和Pull Request来改进项目。

## 联系方式

如有问题，请通过以下方式联系：
- 项目Issue
- 邮件联系