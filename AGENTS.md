# Z-Image 项目上下文文档

## 项目概述

Z-Image 是一个基于阿里通义千问团队开源的高效图像生成基础模型的 Web 应用。该项目集成了 Z-Image-Turbo 模型（6B 参数，仅需 8 步推理），提供了完整的 Web 界面和后端 API，用于生成高质量图像。

### 核心特性

- **模型**：Tongyi-MAI/Z-Image-Turbo（6B 参数扩散 Transformer 模型）
- **架构**：采用 S3-DiT（可扩展单流 DiT）架构
- **推理速度**：8 步推理，亚秒级延迟
- **功能**：高质量图像生成、中英文双语文本渲染、指令遵循
- **平台**：支持 16G 显存消费级设备
- **性能**：在 Artificial Analysis Text-to-Image Leaderboard 上排名第 8，开源模型排名第 1

### Z-Image 模型家族

Z-Image 模型家族包含 4 个模型变体，所有模型均为 **6B 参数**（60 亿参数）：

| 模型 | 参数量 | 训练阶段 | 推理步数 | 任务类型 | 发布状态 |
|------|--------|----------|----------|----------|----------|
| **Z-Image-Omni-Base** | 6B | 仅预训练 | 50 | 生成/编辑 | 待发布 |
| **Z-Image** | 6B | 预训练 + SFT | 50 | 生成 | 已发布 |
| **Z-Image-Turbo** | 6B | 预训练 + SFT + RL | 8 | 生成 | 已发布 |
| **Z-Image-Edit** | 6B | 预训练 + SFT | 50 | 编辑 | 待发布 |

**当前项目集成**：Z-Image-Turbo 模型

- **Z-Image-Turbo**：蒸馏版本，仅需 8 步推理，提供亚秒级推理延迟，适合快速生成
- **Z-Image**：基础模型，专注于高质量生成、丰富美学和强多样性，支持负向提示词
- **Z-Image-Omni-Base**：多功能基础模型，支持生成和编辑任务
- **Z-Image-Edit**：专门用于图像编辑任务的变体，支持基于自然语言提示的精确编辑

### 技术栈

#### 后端
- **框架**：FastAPI 0.115.0 + Uvicorn 0.32.0
- **AI 框架**：PyTorch 2.5+, Diffusers 0.31+, Transformers 4.51+
- **监控**：psutil 6.0.0 (系统监控), GPUtil 1.4.0 (GPU 监控)
- **配置**：Pydantic 2.9.0 (数据验证)
- **图像处理**：Pillow 10.0+
- **其他**：accelerate 1.0+, python-multipart 0.0.9

#### 前端
- **框架**：React 19.2.0 + React DOM 19.2.0
- **构建工具**：Vite 7.3.1
- **UI 库**：Bootstrap 5.3.8 + React-Bootstrap 2.10.10
- **HTTP 客户端**：Axios 1.13.5
- **开发工具**：ESLint 9.39.1, @eslint/js 9.39.1
- **其他**：@vitejs/plugin-react 5.1.1, globals 16.5.0

#### Z-Image 核心库
- 项目包含完整的 Z-Image 开源库（Z-Image 目录）
- 支持 PyTorch 原生推理和 Diffusers 推理
- 依赖：torch>=2.5.0, transformers>=4.51.0, safetensors, loguru, pillow, accelerate, huggingface_hub>=0.25.0

## 项目结构

```
zimage/
├── backend/                    # FastAPI 后端服务
│   ├── api/                   # API 路由
│   │   ├── generate.py        # 图像生成 API
│   │   ├── history.py         # 历史记录 API（含图像下载）
│   │   └── system.py          # 系统监控 API
│   ├── models/                # 数据模型
│   │   ├── config.py          # 应用配置
│   │   └── schemas.py         # Pydantic 模式定义
│   ├── services/              # 业务逻辑
│   │   ├── generator.py       # 图像生成服务
│   │   ├── monitor.py         # 系统监控服务
│   │   └── task_manager.py    # 任务管理器
│   ├── utils/                 # 工具函数
│   └── main.py                # FastAPI 应用入口
├── frontend/                  # React 前端应用
│   ├── src/
│   │   ├── components/        # React 组件
│   │   │   ├── GenerateForm.jsx    # 生成表单
│   │   │   ├── TaskStatus.jsx      # 任务状态
│   │   │   ├── SystemMonitor.jsx   # 系统监控
│   │   │   ├── LatestImage.jsx     # 最新图像
│   │   │   └── ImageGallery.jsx    # 图像画廊
│   │   ├── services/          # API 服务
│   │   │   └── api.js         # Axios API 客户端
│   │   ├── App.jsx            # 主应用组件
│   │   ├── App.css            # 应用样式
│   │   ├── main.jsx           # 应用入口
│   │   └── index.css          # 全局样式
│   ├── public/                # 静态资源
│   ├── index.html             # HTML 入口
│   ├── package.json           # 前端依赖配置
│   ├── vite.config.js         # Vite 配置
│   └── eslint.config.js       # ESLint 配置
├── data/                      # 数据目录
│   ├── history.json           # 生成历史记录
│   └── images/                # 生成的图像存储
├── Z-Image/                   # Z-Image 开源库
│   ├── src/                   # 核心源代码
│   │   ├── zimage/           # 模型实现
│   │   │   ├── autoencoder.py
│   │   │   ├── pipeline.py
│   │   │   ├── scheduler.py
│   │   │   └── transformer.py
│   │   ├── config/           # 配置文件
│   │   │   ├── inference.py
│   │   │   ├── model.py
│   │   │   └── manifests/    # 模型清单
│   │   ├── utils/            # 工具函数
│   │   │   ├── attention.py
│   │   │   ├── helpers.py
│   │   │   ├── import_utils.py
│   │   │   └── loader.py
│   │   └── tools/            # 工具脚本
│   ├── inference.py           # 推理示例
│   ├── batch_inference.py     # 批量推理
│   ├── README.md              # Z-Image 说明文档
│   ├── LICENSE                # 许可证
│   └── pyproject.toml         # 项目配置
├── start.bat                  # 启动脚本（完整服务）
├── start_backend.bat          # 后端启动脚本
├── start_frontend.bat         # 前端启动脚本
├── test_api.py                # API 测试脚本
├── test_backend_direct.py     # 后端直接测试脚本
├── zimage_demo.py             # Python 推理演示
├── zimage_demo_cpu.py         # CPU 推理演示
└── AGENTS.md                  # 本文档
```

## 构建和运行

### 环境要求

- Python 3.10+
- Node.js 18+
- CUDA 11.8+（GPU 推理，可选）
- Conda 环境：`zimage`

### 快速启动

#### 方式一：一键启动（推荐）

```batch
start.bat
```

这将同时启动后端和前端服务：
- 后端：http://localhost:15000
- 前端：http://localhost:15001
- API 文档：http://localhost:15000/docs

#### 方式二：分别启动

**启动后端：**
```batch
start_backend.bat
```

或手动启动：
```bash
conda activate zimage
python -m uvicorn backend.main:app --host 0.0.0.0 --port 15000
```

**启动前端：**
```batch
start_frontend.bat
```

或手动启动：
```bash
conda activate zimage
cd frontend
npm run dev -- --port 15001
```

### 依赖安装

**后端依赖：**
```bash
conda activate zimage
pip install -r backend/requirements.txt
```

**前端依赖：**
```bash
cd frontend
npm install
```

**Z-Image 库：**
```bash
cd Z-Image
pip install -e .
```

### 测试

**后端测试（使用 test_api.py）：**
```bash
# 确保后端服务已启动
python test_api.py
```

**手动测试：**
```bash
# 测试健康检查端点
curl http://localhost:15000/health

# 测试生成端点
curl -X POST http://localhost:15000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "A beautiful sunset", "height": 1024, "width": 1024}'

# 测试任务状态
curl http://localhost:15000/api/generate/{task_id}
```

**前端测试：**
```bash
cd frontend
npm run lint
npm run build
npm run preview
```

## 开发约定

### 后端开发

#### 项目结构约定
- **API 路由**：所有 API 路由定义在 `backend/api/` 目录
- **业务逻辑**：业务逻辑封装在 `backend/services/` 目录
- **数据模型**：使用 Pydantic 定义请求/响应模型在 `backend/models/schemas.py`
- **配置管理**：所有配置集中在 `backend/models/config.py`
- **工具函数**：通用工具函数放在 `backend/utils/` 目录

#### API 设计规范
- RESTful API 设计
- 统一前缀：`/api`
- 错误处理：使用 HTTP 状态码和详细错误消息
- 任务管理：使用异步任务队列，通过 `task_id` 跟踪
- 文档：自动生成 OpenAPI 文档，访问 `/docs` 查看

#### 代码风格
- 遵循 PEP 8 规范
- 使用类型提示（Type Hints）
- 文档字符串采用 Google 风格
- 异步函数优先使用 `async/await`
- 使用单例模式管理模型实例

#### 模型配置
- 默认模型：`Tongyi-MAI/Z-Image-Turbo`
- 默认分辨率：1024×1024
- 默认推理步数：9（实际 8 步 DiT 前向传播）
- 默认引导系数：0.0（Turbo 模型无需 CFG）
- GPU 模式：使用 `torch.bfloat16` 精度
- CPU 模式：使用 `torch.float32` 精度，自动调整分辨率至 512×512

### 前端开发

#### 组件结构
- 组件按功能划分在 `frontend/src/components/` 目录
- 组件名使用 PascalCase
- 文件名与组件名一致
- 使用函数组件和 React Hooks

#### 状态管理
- 使用 React Hooks（useState, useEffect）
- 父子组件通过 props 传递数据
- 使用回调函数处理子组件事件
- API 调用集中管理在 `services/api.js`

#### 样式约定
- 使用 Bootstrap 5 组件和工具类
- 自定义样式在 `App.css` 中定义
- 响应式设计优先（xs, sm, md, lg, xl）
- 使用 React-Bootstrap 组件库

#### API 调用
- 使用 Axios 进行 HTTP 请求
- API 配置集中在 `frontend/src/services/api.js`
- 统一错误处理和加载状态
- 设置 5 分钟超时（300000ms）

### 通用约定

#### 文件命名
- Python 文件：小写字母 + 下划线（snake_case）
- React 组件：PascalCase.jsx
- 配置文件：小写字母 + 下划线
- 样式文件：与组件同名，.css 扩展名

#### 提交信息
- 使用清晰的提交信息
- 格式：`<type>: <description>`
  - `feat`: 新功能
  - `fix`: 修复 bug
  - `docs`: 文档更新
  - `refactor`: 代码重构
  - `style`: 代码格式调整
  - `test`: 测试相关
  - `chore`: 构建/工具相关

#### 日志规范
- 使用 Python logging 模块
- 日志级别：DEBUG, INFO, WARNING, ERROR, CRITICAL
- 关键操作必须记录日志
- 使用 FastAPI 的 lifespan 管理启动/关闭

## 核心功能模块

### 后端服务

#### 1. 图像生成服务（generator.py）
- 单例模式管理 Z-Image-Turbo 模型
- 懒加载模型，支持 GPU/CPU 切换
- 支持自定义分辨率、推理步数、随机种子
- 异步任务处理，支持进度回调
- 自动保存生成的图像到 `data/images/` 目录
- 记录生成时间统计
- 使用 `local_files_only=True` 避免网络检查

#### 2. 任务管理器（task_manager.py）
- 管理生成任务队列
- 任务状态跟踪（pending, processing, completed, failed）
- 任务进度跟踪（当前步数/总步数）
- 任务超时处理（默认 10 分钟）
- 并发控制
- 自动保存任务结果到历史记录

#### 3. 系统监控（monitor.py）
- CPU 使用率监控（核心数、频率）
- 内存使用监控（总量、已用、可用）
- GPU 使用率和显存监控（可用时）
- 磁盘空间监控
- 实时性能指标

### 前端组件

#### 1. GenerateForm
- 图像生成表单
- 支持提示词输入（多行文本）
- 可配置分辨率（512×512 到 1536×1536）
- 可配置推理步数（1-50 步，滑动条控制）
- GPU/CPU 切换开关
- 可选随机种子输入
- 错误提示和加载状态

#### 2. TaskStatus
- 任务状态显示
- 实时进度更新（百分比和步数）
- 任务完成通知
- 错误信息展示
- 自动轮询任务状态

#### 3. SystemMonitor
- 实时系统监控面板
- CPU/内存/GPU 指标显示
- 磁盘空间监控
- 自动刷新（每 5 秒）
- GPU 不可用时隐藏 GPU 信息

#### 4. LatestImage
- 显示最新生成的图像
- 显示图像元数据（提示词、分辨率、生成时间）
- 支持图像下载
- 无图像时显示提示信息

#### 5. ImageGallery
- 历史图像画廊
- 分页显示（每页 20 张）
- 图像预览
- 图像下载
- 显示图像元数据
- 按时间倒序排列

## API 端点

### 健康检查
```
GET /health
Response: {
  "status": "healthy",
  "service": "Z-Image API"
}
```

### 根端点
```
GET /
Response: {
  "message": "Z-Image API",
  "version": "1.0.0",
  "docs": "/docs",
  "health": "/health"
}
```

### 图像生成
```
POST /api/generate
Body: {
  "prompt": "string (required, min_length=1)",
  "height": 1024 (default, range: 256-2048),
  "width": 1024 (default, range: 256-2048),
  "num_inference_steps": 9 (default, range: 1-50),
  "use_gpu": true (default),
  "seed": 42 (optional)
}
Response: {
  "task_id": "string"
}
```

### 任务状态
```
GET /api/generate/{task_id}
Response: {
  "task_id": "string",
  "status": "pending|processing|completed|failed",
  "progress": 0 (0-100),
  "total_steps": 9,
  "current_step": 0,
  "message": "string",
  "result": {
    "id": "string",
    "filename": "string",
    "prompt": "string",
    "width": 1024,
    "height": 1024,
    "num_inference_steps": 9,
    "use_gpu": true,
    "size_bytes": 123456,
    "created_at": "ISO 8601 datetime",
    "generation_time_ms": 1234.56
  } | null,
  "error": "string" | null
}
```

### 历史记录
```
GET /api/history?page=1&page_size=20
Response: {
  "images": [ImageInfo],
  "total": 100,
  "page": 1,
  "page_size": 20
}
```

### 图像下载
```
GET /api/download/{image_id}
Response: Binary image file (PNG)
```

### 最新图像
```
GET /api/images/latest
Response: ImageInfo with download_url
```

### 系统监控
```
GET /api/system/status
Response: {
  "cpu": {
    "usage_percent": 0.0,
    "cores": 8,
    "frequency_mhz": 3200.0
  },
  "memory": {
    "total_gb": 16.0,
    "used_gb": 8.0,
    "available_gb": 8.0,
    "usage_percent": 50.0
  },
  "gpu": {
    "available": true,
    "name": "string" | null,
    "memory_total_gb": 24.0 | null,
    "memory_used_gb": 8.0 | null,
    "usage_percent": 33.3 | null,
    "temperature": 65.0 | null
  } | null,
  "disk": {
    "path": "string",
    "total_gb": 500.0,
    "used_gb": 250.0,
    "free_gb": 250.0,
    "usage_percent": 50.0
  },
  "timestamp": "ISO 8601 datetime"
}
```

## 配置说明

### 后端配置（backend/models/config.py）

- **BASE_DIR**: 项目根目录
- **DATA_DIR**: 数据目录路径
- **IMAGES_DIR**: 图像存储目录
- **HISTORY_FILE**: 历史记录文件路径
- **MODEL_NAME**: 模型名称（`Tongyi-MAI/Z-Image-Turbo`）
- **DEFAULT_HEIGHT**: 默认图像高度（1024）
- **DEFAULT_WIDTH**: 默认图像宽度（1024）
- **DEFAULT_NUM_INFERENCE_STEPS**: 默认推理步数（9）
- **DEFAULT_GUIDANCE_SCALE**: 默认引导系数（0.0）
- **DEFAULT_SEED**: 默认随机种子（42）
- **API_PREFIX**: API 前缀（`/api`）
- **CORS_ORIGINS**: 允许的跨域来源列表（包括 localhost:15001, 5173, 3000）
- **TASK_TIMEOUT**: 任务超时时间（600 秒）

### 前端配置（frontend/src/services/api.js）

- **API_BASE_URL**: 后端 API 地址（`http://localhost:15000/api`）
- **timeout**: 请求超时时间（300000ms，5 分钟）

## 常见问题

### 1. 模型加载失败
- 检查网络连接（模型会自动从 Hugging Face 下载）
- 确保有足够的磁盘空间（模型约 12GB）
- 验证 CUDA 版本兼容性（如使用 GPU）
- 检查 Python 版本（需要 3.10+）
- 确认所有依赖已正确安装

### 2. 内存不足
- 降低图像分辨率（CPU 模式会自动调整至 512×512）
- 减少 `batch_size`（当前版本不使用批量生成）
- 启用 CPU 卸载：`pipe.enable_model_cpu_offload()`
- 关闭其他占用内存的程序
- 使用 CPU 模式而非 GPU 模式

### 3. 前端无法连接后端
- 检查后端服务是否运行在 15000 端口
- 检查 CORS 配置（`backend/models/config.py`）
- 验证防火墙设置
- 确认后端已正确启动且无错误
- 检查网络连接

### 4. GPU 不可用
- 检查 CUDA 驱动是否正确安装
- 验证 PyTorch CUDA 版本：`python -c "import torch; print(torch.cuda.is_available())"`
- 检查 GPU 是否被其他程序占用
- 可以使用 CPU 模式（速度较慢）
- 确认安装了 GPU 版本的 PyTorch

### 5. 图像生成速度慢
- 确保使用 GPU 模式
- 减少推理步数（8 步是 Turbo 模型的最优配置）
- 降低图像分辨率
- 检查 GPU 利用率
- 使用 Flash Attention 加速：`pipe.transformer.set_attention_backend("flash")`

### 6. 前端构建错误
- 确认 Node.js 版本（需要 18+）
- 删除 `node_modules` 和 `package-lock.json`，重新运行 `npm install`
- 检查 ESLint 配置
- 清除 Vite 缓存：`npm run build -- --force`

## 性能优化建议

### 后端优化

**模型加载优化：**
- 使用单例模式避免重复加载模型
- 支持懒加载，按需加载模型
- GPU/CPU 模式自动切换
- 使用 `local_files_only=True` 避免网络检查

**推理加速：**
- 使用 Flash Attention 加速：`pipe.transformer.set_attention_backend("flash")`
- 编译模型：`pipe.transformer.compile()`
- 启用半精度：GPU 模式使用 `torch.bfloat16`
- CPU 模式自动降低分辨率

**内存优化：**
- 启用 CPU 卸载：`pipe.enable_model_cpu_offload()`
- 使用 `low_cpu_mem_usage=True` 参数
- 及时释放不再使用的张量

### 前端优化

**构建优化：**
- 使用 Vite 的生产构建：`npm run build`
- 启用代码分割（Vite 默认支持）
- 压缩和混淆代码

**运行时优化：**
- 使用 React DevTools Profiler 分析性能
- 优化图像加载（懒加载、缩略图）
- 使用防抖和节流减少 API 调用
- 合理设置轮询间隔

**用户体验优化：**
- 显示加载状态和进度
- 提供错误提示和恢复机制
- 支持取消长时间运行的任务
- 本地缓存部分数据

## 部署建议

### 开发环境
- 使用 `start.bat` 一键启动
- 前端使用 Vite 开发服务器
- 后端使用 Uvicorn 的 reload 模式
- 启用详细日志输出

### 生产环境

**后端部署：**
- 使用生产级 ASGI 服务器（如 Gunicorn + Uvicorn）
- 禁用 debug 模式和 reload
- 配置反向代理（Nginx）
- 启用 HTTPS
- 配置 CORS 白名单
- 设置适当的超时时间
- 使用进程管理器（如 Supervisor）

**前端部署：**
- 构建生产版本：`npm run build`
- 部署到静态文件服务器（Nginx、Apache）
- 启用 gzip 压缩
- 配置缓存策略
- 使用 CDN 加速静态资源

**Docker 部署：**
- 使用多阶段构建减少镜像大小
- 优化依赖安装
- 配置健康检查
- 设置资源限制
- 使用持久化卷存储图像和历史记录

## 贡献指南

### 开发流程
1. 创建功能分支：`git checkout -b feature/your-feature`
2. 编写代码并遵循项目约定
3. 运行测试：`npm run lint`（前端）
4. 测试后端 API 和前端功能
5. 提交代码：`git commit -m "feat: add new feature"`
6. 推送分支：`git push origin feature/your-feature`
7. 创建 Pull Request

### 代码审查要点
- 代码风格符合约定
- 添加必要的文档字符串
- 测试覆盖关键功能
- 无明显的性能问题
- 安全检查（无敏感信息泄露）
- 兼容性检查

### 文档更新
- 更新 API 文档（自动生成）
- 更新配置说明
- 添加新功能的使用示例
- 更新常见问题解答

## 参考资源

### 官方资源
- [Z-Image 官方仓库](https://github.com/Tongyi-MAI/Z-Image)
- [Z-Image 技术报告](https://arxiv.org/abs/2511.22699)
- [Hugging Face 模型 - Z-Image](https://huggingface.co/Tongyi-MAI/Z-Image)
- [Hugging Face 模型 - Z-Image-Turbo](https://huggingface.co/Tongyi-MAI/Z-Image-Turbo)
- [在线演示 - Z-Image](https://huggingface.co/spaces/Tongyi-MAI/Z-Image)
- [在线演示 - Z-Image-Turbo](https://huggingface.co/spaces/Tongyi-MAI/Z-Image-Turbo)
- [Artificial Analysis Leaderboard](https://artificialanalysis.ai/image/leaderboard/text-to-image)

### 技术文档
- [Diffusers 文档](https://huggingface.co/docs/diffusers)
- [FastAPI 文档](https://fastapi.tiangolo.com/)
- [React 文档](https://react.dev/)
- [Vite 文档](https://vite.dev/)
- [Bootstrap 文档](https://getbootstrap.com/)
- [React-Bootstrap 文档](https://react-bootstrap.github.io/)

### 相关论文
- [Z-Image: An Efficient Image Generation Foundation Model with Single-Stream Diffusion Transformer](https://arxiv.org/abs/2511.22699)
- [Decoupled DMD: CFG Augmentation as the Spear, Distribution Matching as the Shield](https://arxiv.org/abs/2511.22677)
- [Distribution Matching Distillation Meets Reinforcement Learning](https://arxiv.org/abs/2511.13649)

### 社区资源
- [Cache-DiT - Z-Image 推理加速](https://github.com/vipshop/cache-dit)
- [stable-diffusion.cpp - C++ 推理引擎](https://github.com/leejet/stable-diffusion.cpp)
- [LeMiCa - 训练免费加速方法](https://github.com/UnicomAI/LeMiCa)
- [ComfyUI ZImageLatent](https://github.com/HellerCommaA/ComfyUI-ZImageLatent)
- [DiffSynth-Studio](https://github.com/modelscope/DiffSynth-Studio)

## 许可证

本项目遵循 Z-Image 开源项目的许可证。详见 [Z-Image/LICENSE](Z-Image/LICENSE)。

## 联系方式

如有问题或建议，请通过以下方式联系：
- 提交 GitHub Issue
- 查看 Z-Image 官方文档
- 访问 Hugging Face 讨论区
- 阿里巴巴通义千问团队招聘：jingpeng.gp@alibaba-inc.com

## 版本历史

### v1.0.0 (当前版本)
- 初始版本发布
- 集成 Z-Image-Turbo 模型
- 完整的 Web 界面
- 异步任务管理
- 系统监控功能
- 历史记录和图像画廊
- 支持 GPU/CPU 推理
- API 测试脚本（test_api.py）