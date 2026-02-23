/**
 * Component for system monitoring display.
 */
import React, { useEffect, useState } from 'react';
import { Card, ProgressBar, Row, Col, Alert } from 'react-bootstrap';
import { systemAPI } from '../services/api';

const SystemMonitor = () => {
  const [systemStatus, setSystemStatus] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let intervalId;

    const fetchStatus = async () => {
      try {
        const data = await systemAPI.getSystemStatus();
        setSystemStatus(data);
        setError('');
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to fetch system status');
      }
    };

    fetchStatus();
    intervalId = setInterval(fetchStatus, 3000);

    return () => clearInterval(intervalId);
  }, []);

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  if (!systemStatus) {
    return <div>加载中...</div>;
  }

  return (
    <Card className="h-100">
      <Card.Header as="h5">📊 系统监控</Card.Header>
      <Card.Body>
        <Row className="g-3">
          {/* CPU Monitor */}
          <Col xs={12} md={4}>
            <div className="monitor-item">
              <div className="mb-2">
                <strong>💻 CPU</strong>
                <small className="d-block text-muted">
                  {systemStatus.cpu.cores} 核心 @ {systemStatus.cpu.frequency_mhz.toFixed(0)} MHz
                </small>
              </div>
              <ProgressBar
                now={systemStatus.cpu.usage_percent}
                label={`${systemStatus.cpu.usage_percent.toFixed(1)}%`}
                variant={systemStatus.cpu.usage_percent > 80 ? 'warning' : 'primary'}
              />
            </div>
          </Col>

          {/* Memory Monitor */}
          <Col xs={12} md={4}>
            <div className="monitor-item">
              <div className="mb-2">
                <strong>🧠 内存</strong>
                <small className="d-block text-muted">
                  {systemStatus.memory.used_gb.toFixed(1)} GB / {systemStatus.memory.total_gb.toFixed(1)} GB
                </small>
              </div>
              <ProgressBar
                now={systemStatus.memory.usage_percent}
                label={`${systemStatus.memory.usage_percent.toFixed(1)}%`}
                variant={systemStatus.memory.usage_percent > 80 ? 'warning' : 'primary'}
              />
            </div>
          </Col>

          {/* GPU Monitor */}
          <Col xs={12} md={4}>
            <div className="monitor-item">
              <div className="mb-2">
                <strong>🎮 GPU</strong>
                {systemStatus.gpu && systemStatus.gpu.available ? (
                  <small className="d-block text-muted">
                    {systemStatus.gpu.name}<br />
                    使用率: {systemStatus.gpu.usage_percent.toFixed(1)}%
                  </small>
                ) : (
                  <small className="d-block text-muted">不可用</small>
                )}
              </div>
              <ProgressBar
                now={systemStatus.gpu && systemStatus.gpu.available ? systemStatus.gpu.usage_percent : 0}
                label={systemStatus.gpu && systemStatus.gpu.available ? `${systemStatus.gpu.usage_percent.toFixed(1)}%` : 'N/A'}
                variant={
                  !systemStatus.gpu?.available ? 'secondary' :
                  systemStatus.gpu.usage_percent > 80 ? 'warning' :
                  'primary'
                }
              />
            </div>
          </Col>
        </Row>

        {/* GPU 显存详细监控 */}
        {systemStatus.gpu && systemStatus.gpu.available && (
          <Row className="g-3 mt-3">
            <Col xs={12}>
              <div className="monitor-item">
                <div className="mb-2">
                  <strong>💾 GPU 显存</strong>
                  <small className="d-block text-muted">
                    {systemStatus.gpu.memory_used_gb?.toFixed(1) || 0} GB / {systemStatus.gpu.memory_total_gb?.toFixed(1) || 0} GB
                  </small>
                </div>
                <ProgressBar
                  now={(systemStatus.gpu.memory_used_gb / systemStatus.gpu.memory_total_gb) * 100}
                  label={`${((systemStatus.gpu.memory_used_gb / systemStatus.gpu.memory_total_gb) * 100).toFixed(1)}%`}
                  variant={(systemStatus.gpu.memory_used_gb / systemStatus.gpu.memory_total_gb) > 0.9 ? 'danger' : 'info'}
                />
              </div>
            </Col>
          </Row>
        )}

        <div className="mt-3 text-muted small text-center">
          🕐 最后更新: {new Date(systemStatus.timestamp).toLocaleString('zh-CN')}
        </div>
      </Card.Body>
    </Card>
  );
};

export default SystemMonitor;