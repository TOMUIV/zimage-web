/**
 * Component for image generation form.
 */
import React, { useState } from 'react';
import { Form, Button, Card, Row, Col, Alert } from 'react-bootstrap';
import { generateAPI } from '../services/api';

const GenerateForm = ({ onTaskCreated }) => {
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [quality, setQuality] = useState('high');
  const [seed, setSeed] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 画幅比例配置
  const aspectRatios = {
    '1:1': { width: 1024, height: 1024, label: '1:1 (方形)' },
    '4:3': { width: 1024, height: 768, label: '4:3 (横向)' },
    '3:4': { width: 768, height: 1024, label: '3:4 (竖向)' },
    '16:9': { width: 1024, height: 576, label: '16:9 (宽屏)' },
    '9:16': { width: 576, height: 1024, label: '9:16 (竖屏)' },
  };

  // 质量配置（推理步数）
  const qualityOptions = {
    'fast': { steps: 4, label: '快速 (4步)' },
    'balanced': { steps: 6, label: '平衡 (6步)' },
    'high': { steps: 8, label: '高质量 (8步)' },
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const selectedRatio = aspectRatios[aspectRatio];
      const selectedQuality = qualityOptions[quality];

      const params = {
        prompt: prompt.trim(),
        negative_prompt: negativePrompt.trim() || null,
        height: selectedRatio.height,
        width: selectedRatio.width,
        num_inference_steps: selectedQuality.steps,
        seed: seed ? parseInt(seed) : null,
      };

      const response = await generateAPI.createTask(params);
      onTaskCreated(response.task_id);
      setPrompt('');
      setNegativePrompt('');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="h-100">
      <Card.Header as="h5">🎨 图片生成</Card.Header>
      <Card.Body>
        {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>💬 正向提示词</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="输入描述你想要生成的图片..."
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>🚫 反向提示词（可选）</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
              placeholder="输入你不希望出现在图片中的内容..."
            />
          </Form.Group>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>📐 画幅比例</Form.Label>
                <Form.Select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)}>
                  {Object.entries(aspectRatios).map(([key, ratio]) => (
                    <option key={key} value={key}>{ratio.label}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>✨ 生成质量</Form.Label>
                <Form.Select value={quality} onChange={(e) => setQuality(e.target.value)}>
                  {Object.entries(qualityOptions).map(([key, option]) => (
                    <option key={key} value={key}>{option.label}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>🎲 随机种子（可选）</Form.Label>
            <Form.Control
              type="number"
              value={seed}
              onChange={(e) => setSeed(e.target.value)}
              placeholder="留空则随机"
            />
            <Form.Text className="text-muted">
              💡 使用相同的种子可以生成相同的图片
            </Form.Text>
          </Form.Group>

          <Button
            variant="primary"
            type="submit"
            className="w-100"
            disabled={loading}
          >
            {loading ? '⏳ 提交中...' : '🚀 生成图片'}
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default GenerateForm;