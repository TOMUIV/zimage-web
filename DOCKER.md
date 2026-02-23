# Z-Image Docker 部署指南

## 📦 镜像信息

- **镜像名称**: zimage-zimage
- **镜像大小**: ~12.1 GB
- **基础镜像**: Python 3.10-slim + Node 18-alpine
- **特点**: 单一镜像，支持 GPU/CPU 双模式

## 🚀 快速开始

### 1. 构建镜像

`ash
# Windows
build-docker.bat

# Linux/Mac
chmod +x build-docker.sh
./build-docker.sh
`

### 2. 配置环境变量

复制 .env.example 为 .env 并配置：

`env
# 模型文件路径（必需）
MODEL_PATH=~/.cache/huggingface

# 运行模式（可选，默认：GPU）
USE_GPU=true
`

### 3. 启动容器

**GPU 模式（默认）:**
`ash
# Windows
start_gpu.bat

# Linux/Mac
USE_GPU=true docker-compose up -d
`

**CPU 模式:**
`ash
# Windows
start_cpu.bat

# Linux/Mac
USE_GPU=false docker-compose up -d
`

### 4. 访问应用

- **后端 API**: http://localhost:15000
- **API 文档**: http://localhost:15000/docs
- **前端界面**: http://localhost:15000

## 📋 详细说明

### 环境变量

| 变量名 | 必需 | 默认值 | 说明 |
|--------|------|--------|------|
| MODEL_PATH | ✅ | - | 模型文件存储路径 |
| USE_GPU | ❌ | 	rue | 是否使用 GPU |
| TZ | ❌ | Asia/Shanghai | 时区设置 |
| HF_HOME | ❌ | /root/.cache/huggingface | Hugging Face 缓存目录 |

### 模型管理

- **首次启动**: 自动从 Hugging Face 下载模型（约 30 GB）
- **模型位置**: 由 MODEL_PATH 指定
- **模型复用**: 多容器可共享同一模型目录
- **模型更新**: 删除模型目录后重启即可重新下载

### GPU/CPU 切换

通过 USE_GPU 环境变量控制：

`ash
# GPU 模式
USE_GPU=true docker-compose up -d

# CPU 模式
USE_GPU=false docker-compose up -d
`

### 常用命令

`ash
# 启动容器
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止容器
docker-compose down

# 重启容器
docker-compose restart

# 进入容器
docker-compose exec zimage bash

# 查看容器状态
docker-compose ps
`

## 🔧 故障排查

### 1. 模型下载失败

**问题**: 首次启动时模型下载失败

**解决方案**:
- 检查网络连接
- 确保代理配置正确
- 手动下载模型到 MODEL_PATH 目录

### 2. GPU 不可用

**问题**: 启动时提示 GPU 不可用

**解决方案**:
- 检查 NVIDIA 驱动是否安装
- 检查 Docker 是否支持 GPU
- 切换到 CPU 模式：USE_GPU=false

### 3. 端口冲突

**问题**: 端口 15000 被占用

**解决方案**:
- 修改 docker-compose.yml 中的端口映射
- 停止占用端口的服务

### 4. 权限问题

**问题**: 容器无法访问挂载目录

**解决方案**:
- 检查目录权限
- 确保用户有读写权限

## 📊 性能优化

### GPU 模式

- **推荐**: 使用 NVIDIA GPU（16GB+ 显存）
- **推理步数**: 8 步（Z-Image-Turbo）
- **推理时间**: ~10 秒（取决于 GPU）

### CPU 模式

- **推荐**: 多核 CPU（8 核+）
- **推理步数**: 8 步
- **推理时间**: ~2-5 分钟
- **分辨率**: 自动调整为 512x512

## 🔒 安全建议

1. **不要暴露到公网**: 仅在本地网络使用
2. **使用防火墙**: 限制访问端口
3. **定期更新**: 及时更新 Docker 镜像
4. **备份数据**: 定期备份 data 目录

## 📝 注意事项

1. **首次启动**: 需要下载模型（约 30 GB），请耐心等待
2. **磁盘空间**: 确保有足够的磁盘空间（至少 40 GB）
3. **网络连接**: 首次启动需要访问 Hugging Face
4. **GPU 要求**: GPU 模式需要 NVIDIA 显卡和驱动
5. **资源限制**: CPU 模式需要较多内存和 CPU 资源

## 🤝 贡献

如有问题或建议，请提交 Issue 或 Pull Request。

## 📄 许可证

本项目遵循 Z-Image 开源项目的许可证。
