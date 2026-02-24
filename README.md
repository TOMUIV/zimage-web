# Z-Image Web Interface

A modern web interface based on the Z-Image-Turbo model, providing complete image generation, history management, and system monitoring features. Supports both GPU and CPU inference modes with built-in Docker deployment support.

[English](#english) | [中文](#中文)

---

<a name="中文"></a>
## 中文

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

#### 方法 1：使用预构建镜像

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

3. **使用 Docker Compose：**

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
- Docker Hub：https://hub.docker.com/r/tomuiv/zimage-web

---

<a name="english"></a>
## English

# Z-Image Web Interface

A modern web interface based on the Z-Image-Turbo model, providing complete image generation, history management, and system monitoring features. Supports both GPU and CPU inference modes with built-in Docker deployment support.

## ✨ Features

- 🎨 **Modern UI**: Beautiful interface based on React + Bootstrap 5
- 🚀 **Fast Generation**: Supports Z-Image-Turbo 8-step fast inference
- 📸 **History Management**: Complete image generation history and gallery
- 📊 **System Monitoring**: Real-time monitoring of CPU, memory, and GPU usage
- 🎯 **Batch Management**: Support for batch download and deletion of historical images
- 🔄 **Dual Mode**: Supports both GPU and CPU inference modes
- 🐳 **Docker Support**: One-click Docker deployment
- 🌐 **Bilingual**: Complete Chinese and English interface

## 🚀 Quick Start

### Local Development

**Start full service (backend + frontend):**
```bash
start.bat
```

**Start separately:**
```bash
# Start backend
start_backend.bat

# Start frontend
start_frontend.bat
```

### Docker Deployment

#### Method 1: Use Pre-built Image

**GPU Mode:**
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

**CPU Mode:**
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

#### Method 2: Build from Source

**Windows:**
```bash
# Build image
build-docker.bat

# Start container
docker-compose up -d
```

**Linux/Mac:**
```bash
# Build image
docker build -t tomuiv/zimage-web:latest .

# Start container
docker-compose up -d
```

#### Parameter Explanation

**Required Parameters:**
- `-p 15000:15000`: Map port, access at http://localhost:15000

**Optional Parameters:**
- `--gpus all`: Enable GPU support (GPU mode only)
- `-v $(pwd)/data:/app/data`: Mount data directory (save generated images)
- `-v $(pwd)/backend/logs:/app/backend/logs`: Mount log directory
- `-v ~/.cache/huggingface:/root/.cache/huggingface`: **Mount model file directory (important!)**
- `-e USE_GPU=true`: Enable GPU mode (true/false)
- `-e TZ=Asia/Shanghai`: Set timezone

**About Model File Mounting:**

To avoid repeatedly downloading model files, it's recommended to pre-download and mount them to the container:

1. **Download model files:**
```bash
# Download using Hugging Face CLI
pip install huggingface_hub
huggingface-cli download Tongyi-MAI/Z-Image-Turbo --local-dir ~/.cache/huggingface/hub/models--Tongyi-MAI--Z-Image-Turbo
```

2. **Mount to container:**
```bash
docker run -d \
  --name zimage-app \
  -p 15000:15000 \
  -v /path/to/your/models:/root/.cache/huggingface \
  tomuiv/zimage-web:latest
```

3. **Use Docker Compose:**

Modify `docker-compose.yml`:
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
      - /path/to/your/models:/root/.cache/huggingface  # Change to your model path
    environment:
      - TZ=Asia/Shanghai
      - USE_GPU=true
    restart: unless-stopped
```

**Model File Location:**
- **Windows**: `C:\Users\<username>\.cache\huggingface`
- **Linux/Mac**: `~/.cache/huggingface`
- **Default download size**: ~12GB (auto-downloaded on first run)

**Note:**
- If model directory is not mounted, it will auto-download from Hugging Face on first run (requires access to foreign network or proxy configuration)
- Mounting existing model files avoids repeated downloads, saving time and bandwidth
- Model files include Z-Image-Turbo and its dependencies

## 📸 Usage

1. **Enter Prompt**: Input your desired image description in the form
2. **Select Parameters**:
   - Aspect Ratio: 1:1, 4:3, 3:4, 16:9, 9:16
   - Generation Quality: Fast (4 steps), Balanced (6 steps), High Quality (8 steps)
   - Random Seed (optional): For reproducible image generation
3. **Click Generate**: Click "Generate Image" button to start generation
4. **View Results**: View generated images in "Latest Image" and "History"
5. **Download Images**: Download individually or in batch

## 📋 System Requirements

### Local Development
- Python 3.10+
- Node.js 18+
- Conda Environment: `zimage`
- GPU: NVIDIA GPU (16GB+ VRAM recommended)
- Memory: 16GB+

### Docker Deployment
- Docker Desktop
- GPU: NVIDIA GPU (16GB+ VRAM recommended)
- Memory: 8GB+
- Disk: 40GB+ (including models)

## 🎨 Features

### Image Generation
- Supports positive and negative prompts
- Multiple aspect ratio options
- Three quality modes (Fast/Balanced/High Quality)
- Random seed support

### History Management
- Image gallery display
- Metadata display (resolution, steps, seed, time)
- Batch selection and deletion
- Batch download
- Auto-cleanup (keep last 500 images or 30 days)

### System Monitoring
- CPU usage monitoring
- Memory usage monitoring
- GPU usage and VRAM monitoring
- Auto-refresh (every 5 seconds)
- Color warning (>80% shows warning color)

## 🔧 Tech Stack

### Backend
- **Framework**: FastAPI 0.115.0 + Uvicorn 0.32.0
- **AI Model**: Tongyi-MAI/Z-Image-Turbo (6B parameters)
- **Python**: 3.10+
- **Dependencies**: PyTorch, Diffusers, Transformers

### Frontend
- **Framework**: React 19.2.0
- **Build Tool**: Vite 7.3.1
- **UI Library**: Bootstrap 5.3.8 + React-Bootstrap 2.10.10
- **HTTP Client**: Axios 1.13.5

### Docker
- **Image Size**: ~12.1 GB
- **Base Image**: Python 3.10-slim + Node 18-alpine
- **Deployment Mode**: GPU/CPU dual mode

## 📊 Performance

### GPU Mode
- **Inference Steps**: 8 steps
- **Inference Time**: ~10 seconds (depends on GPU)
- **Recommended GPU**: 16GB+ VRAM

### CPU Mode
- **Inference Steps**: 8 steps
- **Inference Time**: ~2-5 minutes
- **Recommended Config**: 8-core+ CPU

## 📝 API Documentation

After starting the service, visit:
- **API Docs**: http://localhost:15000/docs
- **Frontend**: http://localhost:15000

## 🤝 Acknowledgments

This project is developed based on [Z-Image](https://github.com/Tongyi-MAI/Z-Image) and open-sourced by Alibaba Tongyi-MAI team.

**Original Z-Image Project Info:**
- Project URL: https://github.com/Tongyi-MAI/Z-Image
- License: Apache License 2.0
- Hugging Face: https://huggingface.co/Tongyi-MAI/Z-Image-Turbo
- Technical Report: https://arxiv.org/abs/2511.22699

## 📄 License

This project is licensed under the Apache License 2.0.

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

## 📮 Contact

- GitHub: https://github.com/TOMUIV/zimage-web
- Docker Hub: https://hub.docker.com/r/tomuiv/zimage-web

---

**Made with ❤️ by TOMUIV**

---

**Made with ❤️ by TOMUIV**