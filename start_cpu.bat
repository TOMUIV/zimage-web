@echo off
REM Z-Image Docker 启动脚本 - CPU 模式

echo ========================================
echo Z-Image Docker 启动 (CPU 模式)
echo ========================================
echo.

REM 检查 .env 文件
if not exist .env (
    echo [警告] .env 文件不存在，正在创建...
    copy .env.example .env >nul
    echo [提示] 请编辑 .env 文件，设置 MODEL_PATH
    echo.
)

REM 显示当前配置
echo 当前配置:
for /f "tokens=1,2 delims==" %%a in (.env) do (
    if not "%%a"=="" echo   %%a=%%b
)
echo.

REM 设置使用 CPU
set USE_GPU=false

REM 启动容器
echo 正在启动容器...
docker-compose -f docker-compose.yml up -d

echo.
echo ========================================
echo 容器启动完成！
echo ========================================
echo.
echo 访问地址: http://localhost:15000
echo.
echo 查看日志: docker-compose logs -f
echo 停止容器: docker-compose down
echo.
pause
