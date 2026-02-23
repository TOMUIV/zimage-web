#!/bin/bash

# Z-Image Docker 构建脚本

echo "🚀 开始构建 Z-Image Docker 镜像..."

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安装，请先安装 Docker"
    exit 1
fi

# 检查 .env 文件
if [ ! -f .env ]; then
    echo ""
    echo "📝 首次使用，需要配置模型路径"
    echo "正在创建 .env 文件..."
    cp .env.example .env
    echo "✅ 已创建 .env 文件，请编辑该文件设置 MODEL_PATH"
    echo ""
    echo "💡 提示："
    echo "   - Windows 示例: MODEL_PATH=C:/Users/TOM/.cache/huggingface"
    echo "   - Linux/Mac 示例: MODEL_PATH=/home/username/.cache/huggingface"
    echo ""
    echo "编辑完成后，请重新运行此脚本"
    exit 0
fi

# 显示当前模型路径配置
echo ""
echo "📁 当前模型路径配置:"
grep MODEL_PATH .env

# 选择构建模式
echo ""
echo "请选择构建模式:"
echo "1) GPU 模式（需要 NVIDIA GPU）"
echo "2) CPU 模式"
read -p "请输入选项 (1/2): " mode

if [ "$mode" = "1" ]; then
    echo "🔥 构建 GPU 模式镜像..."
    docker-compose build
    echo "✅ GPU 模式镜像构建完成"
    echo "启动命令: docker-compose up -d"
elif [ "$mode" = "2" ]; then
    echo "💻 构建 CPU 模式镜像..."
    docker-compose -f docker-compose.cpu.yml build
    echo "✅ CPU 模式镜像构建完成"
    echo "启动命令: docker-compose -f docker-compose.cpu.yml up -d"
else
    echo "❌ 无效的选项"
    exit 1
fi

echo ""
echo "📊 镜像信息:"
docker images | grep zimage

echo ""
echo "💡 使用提示:"
echo "  - 查看日志: docker-compose logs -f"
echo "  - 停止服务: docker-compose down"
echo "  - 重启服务: docker-compose restart"
echo "  - 进入容器: docker-compose exec zimage bash"