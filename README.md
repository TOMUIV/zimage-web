# Z-Image Web 界面

基于 Z-Image-Turbo 模型的现代化 Web 界面，提供完整的图像生成、历史记录管理和系统监控功能。支持 GPU/CPU 双模式推理，内置 Docker 部署支持。

## ✨ 特性

- 🎨 **现代化 UI**：基于 React + Bootstrap 5 的美观界面
- 🚀 **快速生成**：支持 Z-Image-Turbo 8 步快速推理
- 📸 **历史记录**：完整的图像生成历史和画廊
- 📊 **系统监控**：实时监控 CPU、内存、GPU 使用情况
- 🎯 **批量管理**：支持批量下载和删除历史图像
- 🔄 **双模式**：支持 GPU 和 CPU 推理模式
- 🐳 **Docker 支持**：一键 Docker 部署
- 🌐 **中英文支持**：完整的中英文界面

## 🚀 快速开始

### 本地运行

**启动完整服务（后端 + 前端）：**
```bash
start.bat
```

**分别启动：**
```bash
# 启动后端
start_backend.bat

# 启动前端
start_frontend.bat
```

### Docker 部署

#### 方法 1：使用预构建镜像（推荐）

**GPU 模式：**
```bash
docker run -d \
  --name zimage-app \
  --gpus all \
  -p 15000:15000 \
  -v $(pwd)/data:/app/data \
  -v $(pwd)/backend/logs:/app/backend/logs \
  -v ~/.cache/huggingface:/root/.cache/huggingface \
  -e USE_GPU=true \
  -e TZ=Asia/Shanghai \
  --restart unless-stopped \
  tomuiv/zimage-web:latest
```

**CPU 模式：**
```bash
docker run -d \
  --name zimage-app \
  -p 15000:15000 \
  -v $(pwd)/data:/app/data \
  -v $(pwd)/backend/logs:/app/backend/logs \
  -v ~/.cache/huggingface:/root/.cache/huggingface \
  -e USE_GPU=false \
  -e TZ=Asia/Shanghai \
  --restart unless-stopped \
  tomuiv/zimage-web:latest
```

**使用 Docker Compose（推荐）：**
```bash
# 修改 docker-compose.yml 中的 MODEL_PATH 指向你的模型文件目录
docker-compose up -d
```

#### 方法 2：手动构建镜像

**Windows：**
```bash
# 构建镜像
build-docker.bat

# 启动容器
docker-compose up -d
```

**Linux/Mac：**
```bash
# 构建镜像
docker build -t tomuiv/zimage-web:latest .

# 启动容器
docker-compose up -d
```

#### 参数说明

**必需参数：**
- `-p 15000:15000`：映射端口，访问 http://localhost:15000

**可选参数：**
- `--gpus all`：启用 GPU 支持（仅 GPU 模式）
- `-v $(pwd)/data:/app/data`：挂载数据目录（保存生成的图像）
- `-v $(pwd)/backend/logs:/app/backend/logs`：挂载日志目录
- `-v ~/.cache/huggingface:/root/.cache/huggingface`：**挂载模型文件目录（重要！）**
- `-e USE_GPU=true`：启用 GPU 模式（true/false）
- `-e TZ=Asia/Shanghai`：设置时区

**关于模型文件挂载：**

为了避免重复下载模型文件，建议预先下载好模型文件并挂载到容器中：

1. **下载模型文件：**
```bash
# 使用 Hugging Face CLI 下载
pip install huggingface_hub
huggingface-cli download Tongyi-MAI/Z-Image-Turbo --local-dir ~/.cache/huggingface/hub/models--Tongyi-MAI--Z-Image-Turbo
```

2. **挂载到容器：**
```bash
docker run -d \
  --name zimage-app \
  -p 15000:15000 \
  -v /path/to/your/models:/root/.cache/huggingface \
  tomuiv/zimage-web:latest
```

3. **使用 Docker Compose（推荐）：**

修改 `docker-compose.yml`：
```yaml
services:
  zimage:
    image: tomuiv/zimage-web:latest
    container_name: zimage-app
    ports:
      - "15000:15000"
    volumes:
      - ./data:/app/data
      - ./backend/logs:/app/backend/logs
      - /path/to/your/models:/root/.cache/huggingface  # 修改为你的模型路径
    environment:
      - TZ=Asia/Shanghai
      - USE_GPU=true
    restart: unless-stopped
```

**模型文件位置说明：**

- **Windows**: `C:\Users\<用户名>\.cache\huggingface`
- **Linux/Mac**: `~/.cache/huggingface`
- **默认下载大小**: 约 12GB（首次运行会自动下载）

**注意：**
- 如果不挂载模型目录，首次运行时会自动从 Hugging Face 下载（需要访问国外网络或配置代理）
- 挂载已有模型文件可以避免重复下载，节省时间和带宽
- 模型文件包括 Z-Image-Turbo 及其依赖

## 📸 使用方法

1. **输入提示词**：在表单中输入你想要生成的图像描述
2. **选择参数**：
   - 画幅比例：1:1、4:3、3:4、16:9、9:16
   - 生成质量：快速（4步）、平衡（6步）、高质量（8步）
   - 随机种子（可选）：用于生成可复现的图像
3. **点击生成**：点击"生成图片"按钮开始生成
4. **查看结果**：在"最新图片"和"历史记录"中查看生成的图像
5. **下载图像**：可以单独下载或批量下载

## 📋 系统要求

### 本地运行
- Python 3.10+
- Node.js 18+
- Conda 环境：`zimage`
- GPU：NVIDIA 显卡（推荐 16GB+ 显存）
- 内存：16GB+

### Docker 运行
- Docker Desktop
- GPU：NVIDIA 显卡（推荐 16GB+ 显存）
- 内存：8GB+
- 磁盘：40GB+（包含模型）

## 🎨 功能说明

### 图像生成
- 支持正向提示词和反向提示词
- 多种画幅比例选择
- 三种质量模式（快速/平衡/高质量）
- 随机种子支持

### 历史记录
- 图像画廊展示
- 元数据显示（分辨率、步数、种子、时间）
- 批量选择和删除
- 批量下载
- 自动清理（保留最近 500 张或 30 天）

### 系统监控
- CPU 使用率监控
- 内存使用监控
- GPU 使用率和显存监控
- 自动刷新（每 5 秒）
- 颜色警告（>80% 显示警告色）

## 🔧 技术栈

### 后端
- **框架**：FastAPI 0.115.0 + Uvicorn 0.32.0
- **AI 模型**：Tongyi-MAI/Z-Image-Turbo (6B 参数)
- **Python**：3.10+
- **依赖**：PyTorch, Diffusers, Transformers

### 前端
- **框架**：React 19.2.0
- **构建工具**：Vite 7.3.1
- **UI 库**：Bootstrap 5.3.8 + React-Bootstrap 2.10.10
- **HTTP 客户端**：Axios 1.13.5

### Docker
- **镜像大小**：~12.1 GB
- **基础镜像**：Python 3.10-slim + Node 18-alpine
- **部署模式**：GPU/CPU 双模式

## 📊 性能

### GPU 模式
- **推理步数**：8 步
- **推理时间**：~10 秒（取决于 GPU）
- **推荐 GPU**：16GB+ 显存

### CPU 模式
- **推理步数**：8 步
- **推理时间**：~2-5 分钟
- **推荐配置**：8 核+ CPU

## 📝 API 文档

启动服务后访问：
- **API 文档**：http://localhost:15000/docs
- **前端界面**：http://localhost:15000

## 🤝 Acknowledgments

本项目基于 [Z-Image](https://github.com/Tongyi-MAI/Z-Image) 开发，由阿里巴巴通义千问团队开源。

**Z-Image 原项目信息：**
- 项目地址：https://github.com/Tongyi-MAI/Z-Image
- 许可证：Apache License 2.0
- Hugging Face：https://huggingface.co/Tongyi-MAI/Z-Image-Turbo
- 技术报告：https://arxiv.org/abs/2511.22699

## 📄 许可证

本项目采用 Apache License 2.0 许可证。

```
Copyright 2025 TOMUIV

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

================================================================================

This project includes modifications to Z-Image by Tongyi-MAI Team
Original Project: https://github.com/Tongyi-MAI/Z-Image
Original License: Apache License 2.0
```

## 📮 联系方式

- GitHub：https://github.com/TOMUIV/zimage-web
- Docker Hub：TOMUIV/zimage-web

---

**Made with ❤️ by TOMUIV**