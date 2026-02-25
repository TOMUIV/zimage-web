/**
 * Component for image generation form.
 */
import React, { useState } from 'react';
import { Form, Button, Card, Row, Col, Alert, Accordion } from 'react-bootstrap';
import { generateAPI } from '../services/api';

const GenerateForm = ({ onTaskCreated }) => {
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [quality, setQuality] = useState('high');
  const [seed, setSeed] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // 高级设置状态
  const [useGPU, setUseGPU] = useState(true);
  const [batchSize, setBatchSize] = useState(1);
  const [gpuId, setGpuId] = useState(0);
  const [guidanceScale, setGuidanceScale] = useState(0.0);
  const [maxConcurrentTasks, setMaxConcurrentTasks] = useState(1);

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
        use_gpu: useGPU,
        batch_size: batchSize,
        gpu_id: parseInt(gpuId),
        guidance_scale: parseFloat(guidanceScale),
        max_concurrent_tasks: parseInt(maxConcurrentTasks),
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

          {/* 高级设置折叠面板 */}
          <Accordion className="mb-3">
            <Accordion.Item eventKey="0">
              <Accordion.Header>
                ⚙️ 高级设置
              </Accordion.Header>
              <Accordion.Body>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>🖥️ 运行模式</Form.Label>
                      <Form.Select 
                        value={useGPU ? 'gpu' : 'cpu'} 
                        onChange={(e) => setUseGPU(e.target.value === 'gpu')}
                      >
                        <option value="gpu">GPU 模式（推荐）</option>
                        <option value="cpu">CPU 模式</option>
                      </Form.Select>
                      <Form.Text className="text-muted">
                        GPU 模式速度更快，CPU 模式兼容性更好
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>📊 批量大小</Form.Label>
                      <Form.Select 
                        value={batchSize} 
                        onChange={(e) => setBatchSize(parseInt(e.target.value))}
                      >
                        <option value={1}>1 张图片</option>
                        <option value={2}>2 张图片</option>
                        <option value={4}>4 张图片</option>
                        <option value={8}>8 张图片</option>
                      </Form.Select>
                      <Form.Text className="text-muted">
                        一次生成的图片数量（需要更多显存）
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>🎮 GPU 设备 ID</Form.Label>
                      <Form.Select 
                        value={gpuId} 
                        onChange={(e) => setGpuId(parseInt(e.target.value))}
                      >
                        {[0, 1, 2, 3, 4, 5, 6, 7].map(id => (
                          <option key={id} value={id}>GPU {id}</option>
                        ))}
                      </Form.Select>
                      <Form.Text className="text-muted">
                        选择使用的 GPU 设备（多 GPU 场景）
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>🎯 引导系数 (CFG)</Form.Label>
                      <Form.Range
                        min={0}
                        max={20}
                        step={0.5}
                        value={guidanceScale}
                        onChange={(e) => setGuidanceScale(e.target.value)}
                      />
                      <div className="d-flex justify-content-between">
                        <small>0.0</small>
                        <span className="badge bg-primary">{guidanceScale}</span>
                        <small>20.0</small>
                      </div>
                      <Form.Text className="text-muted">
                        控制生成图片与提示词的符合度（0.0=不使用CFG）
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>🔄 最大并发任务数</Form.Label>
                  <Form.Select 
                    value={maxConcurrentTasks} 
                    onChange={(e) => setMaxConcurrentTasks(parseInt(e.target.value))}
                  >
                    <option value={1}>1 个任务（推荐）</option>
                    <option value={2}>2 个任务</option>
                    <option value={4}>4 个任务</option>
                  </Form.Select>
                  <Form.Text className="text-muted">
                    同时运行的最大任务数（需要更多计算资源）
                  </Form.Text>
                </Form.Group>

                <Alert variant="info" className="mb-0">
                  <small>
                    ⚠️ <strong>注意：</strong>
                    <ul className="mb-0 mt-2">
                      <li>批量大小 大于 1 需要 2 倍以上的显存</li>
                      <li>GPU 模式推荐使用引导系数 0.0（Turbo 模型特性）</li>
                      <li>CPU 模式建议批量大小设为 1</li>
                      <li>并发任务过多可能导致显存不足</li>
                    </ul>
                  </small>
                </Alert>
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>

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