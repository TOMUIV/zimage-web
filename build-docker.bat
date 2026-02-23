@echo off
REM Z-Image Docker 镜像构建脚本

echo ========================================
echo Z-Image Docker 镜像构建
echo ========================================
echo.

REM 检查 Docker 是否运行
docker info >nul 2>&1
if errorlevel 1 (
    echo [错误] Docker 未运行，请先启动 Docker Desktop
    pause
    exit /b 1
)

REM 检查 .env 文件
if not exist .env (
    echo [警告] .env 文件不存在，正在创建...
    copy .env.example .env >nul
    echo [提示] 请编辑 .env 文件，设置 MODEL_PATH
    echo.
)

REM 显示当前配置
echo 当前配置:
echo.
for /f "tokens=1,2 delims==" %%a in (.env) do (
    if not "%%a"=="" echo   %%a=%%b
)
echo.

REM 构建镜像
echo ========================================
echo 正在构建 Docker 镜像...
echo ========================================
echo.
docker-compose build

if errorlevel 1 (
    echo.
    echo [错误] 镜像构建失败
    pause
    exit /b 1
)

echo.
echo ========================================
echo 镜像构建成功！
echo ========================================
echo.
echo 使用方法:
echo   - GPU 模式: 运行 start_gpu.bat
echo   - CPU 模式: 运行 start_cpu.bat
echo   - 或直接使用: docker-compose up -d
echo.
pause
