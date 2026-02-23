# 多阶段构建 - 使用阿里云镜像加速
FROM python:3.10-slim as builder

# 设置工作目录
WORKDIR /app

# 使用阿里云镜像源
RUN sed -i 's/deb.debian.org/mirrors.aliyun.com/g' /etc/apt/sources.list.d/debian.sources && \
    sed -i 's/security.debian.org/mirrors.aliyun.com/g' /etc/apt/sources.list.d/debian.sources

# 安装系统依赖
RUN apt-get update && apt-get install -y \
    git \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# 使用清华 PyPI 镜像
RUN pip config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple

# 复制后端依赖文件
COPY backend/requirements.txt .

# 安装 Python 依赖
RUN pip install --no-cache-dir -r requirements.txt

# 复制项目文件
COPY backend ./backend
COPY data ./data

# 构建前端
FROM node:18-alpine as frontend-builder

WORKDIR /app/frontend

# 使用阿里云 npm 镜像
RUN npm config set registry https://registry.npmmirror.com

# 复制前端依赖文件
COPY frontend/package*.json ./

# 安装依赖
RUN npm ci

# 复制前端源码
COPY frontend/ ./

# 构建前端
RUN npm run build

# 最终镜像
FROM python:3.10-slim

# 设置工作目录
WORKDIR /app

# 使用阿里云镜像源
RUN sed -i 's/deb.debian.org/mirrors.aliyun.com/g' /etc/apt/sources.list.d/debian.sources && \
    sed -i 's/security.debian.org/mirrors.aliyun.com/g' /etc/apt/sources.list.d/debian.sources

# 安装运行时依赖
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# 从 builder 阶段复制 Python 环境
COPY --from=builder /usr/local/lib/python3.10/site-packages /usr/local/lib/python3.10/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# 复制项目文件
COPY --from=builder /app/backend ./backend
COPY --from=builder /app/data ./data

# 从 frontend-builder 复制构建好的前端
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# 创建必要的目录
RUN mkdir -p backend/logs /root/.cache/huggingface

# 暴露端口
EXPOSE 15000

# 设置环境变量
ENV PYTHONUNBUFFERED=1
ENV TZ=Asia/Shanghai
ENV HF_HOME=/root/.cache/huggingface

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:15000/health || exit 1

# 启动应用
CMD ["python", "-m", "uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "15000"]
