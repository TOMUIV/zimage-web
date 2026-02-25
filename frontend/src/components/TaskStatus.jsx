/**
 * Component for displaying task status.
 */
import React, { useEffect, useState } from 'react';
import { Card, ProgressBar, Alert } from 'react-bootstrap';
import { generateAPI } from '../services/api';

const TaskStatus = ({ taskId }) => {
  const [status, setStatus] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!taskId) return;

    let intervalId;

    const fetchStatus = async () => {
      try {
        const data = await generateAPI.getTaskStatus(taskId);
        setStatus(data);

        if (data.status === 'completed' || data.status === 'failed') {
          clearInterval(intervalId);
        }
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to fetch status');
        clearInterval(intervalId);
      }
    };

    fetchStatus();
    intervalId = setInterval(fetchStatus, 2000);

    return () => clearInterval(intervalId);
  }, [taskId]);

  if (!taskId) return null;

  if (error) {
    return <Alert variant="danger" className="shadow-sm">{error}</Alert>;
  }

  if (!status) {
    return <Alert variant="info" className="shadow-sm">加载中...</Alert>;
  }

  const getStatusText = () => {
    switch (status.status) {
      case 'pending': return '⏳ 等待中';
      case 'processing': return '⚙️ 生成中';
      case 'completed': return '✅ 完成';
      case 'failed': return '❌ 失败';
      default: return status.status;
    }
  };

  return (
    <Card className="h-100">
      <Card.Header as="h5">生成状态</Card.Header>
      <Card.Body>
        <div className="mb-3">
          <span className={`task-status ${status.status}`}>
            {getStatusText()}
          </span>
        </div>

        <ProgressBar
          now={status.progress}
          label={`${status.progress}%`}
          className="mb-3"
          variant={status.status === 'failed' ? 'danger' : 'primary'}
        />

        <div className="mb-2">
          <strong>进度:</strong> {status.current_step} / {status.total_steps} 步
        </div>
        <div className="mb-2">
          <strong>消息:</strong> {status.message}
        </div>

        {status.error && (
          <Alert variant="danger" className="mt-3">
            <strong>错误:</strong> {status.error}
          </Alert>
        )}

        {status.status === 'completed' && status.result && (
          <Alert variant="success" className="mt-3">
            <strong>✅ 图片生成成功!</strong><br />
            <small>文件名: {status.result.filename}</small>
          </Alert>
        )}
      </Card.Body>
    </Card>
  );
};

export default TaskStatus;