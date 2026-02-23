/**
 * Component for displaying the latest generated image.
 */
import React, { useEffect, useState } from 'react';
import { Card, Button, Spinner, Alert } from 'react-bootstrap';
import { historyAPI } from '../services/api';

const LatestImage = () => {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchLatestImage = async () => {
    try {
      setLoading(true);
      const data = await historyAPI.getLatestImage();
      setImage(data);
      setError('');
    } catch (err) {
      if (err.response?.status === 404) {
        setError('还没有生成任何图片');
      } else {
        setError(err.response?.data?.detail || 'Failed to fetch latest image');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLatestImage();
  }, []);

  const handleDownload = async () => {
    try {
      const blob = await historyAPI.downloadImage(image.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = image.filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert('下载失败: ' + (err.response?.data?.detail || err.message));
    }
  };

  if (loading) {
    return (
      <Card className="h-100">
        <Card.Header as="h5">最新图片</Card.Header>
        <Card.Body className="d-flex justify-content-center align-items-center">
          <Spinner animation="border" />
        </Card.Body>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-100">
        <Card.Header as="h5">最新图片</Card.Header>
        <Card.Body>
          <Alert variant="info">{error}</Alert>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="h-100">
      <Card.Header as="h5">🖼️ 最新图片</Card.Header>
      <Card.Body>
        <div className="text-center mb-3 img-container">
          <img
            src={`http://localhost:15000/static/images/${image.filename}`}
            alt={image.prompt}
            style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain', borderRadius: '12px' }}
          />
        </div>
        <div className="mb-3">
          <strong>💬 提示词:</strong>
          <p className="mb-1 text-muted mt-1">{image.prompt}</p>
        </div>
        {image.negative_prompt && (
          <div className="mb-3">
            <strong>🚫 反向提示词:</strong>
            <p className="mb-1 text-muted mt-1">{image.negative_prompt}</p>
          </div>
        )}
        <div className="mb-3">
          <small className="text-muted d-block">
            📐 分辨率: {image.width}x{image.height} | ⚡ 步数: {image.num_inference_steps}
          </small>
          <small className="text-muted d-block">
            ⏱️ 耗时: {image.generation_time_ms ? `${(image.generation_time_ms / 1000).toFixed(1)}秒` : '未知'} | 🎲 种子: {image.seed || '随机'}
          </small>
        </div>
        <Button variant="primary" onClick={handleDownload} className="w-100">
          📥 下载图片
        </Button>
      </Card.Body>
    </Card>
  );
};

export default LatestImage;