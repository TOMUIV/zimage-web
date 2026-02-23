/**
 * Component for displaying image history.
 */
import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Button, Spinner, Alert, Form, Modal } from 'react-bootstrap';
import { historyAPI } from '../services/api';

const ImageGallery = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedImages, setSelectedImages] = useState(new Set());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const pageSize = 8;

  const fetchHistory = async (currentPage = 1) => {
    try {
      setLoading(true);
      const data = await historyAPI.getHistory(currentPage, pageSize);
      setImages(data.images);
      setTotal(data.total);
      setPage(data.page);
      setError('');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(1);
  }, []);

  const handleDownload = async (image) => {
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

  const handleSelectImage = (imageId) => {
    const newSelected = new Set(selectedImages);
    if (newSelected.has(imageId)) {
      newSelected.delete(imageId);
    } else {
      newSelected.add(imageId);
    }
    setSelectedImages(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedImages.size === images.length) {
      setSelectedImages(new Set());
    } else {
      setSelectedImages(new Set(images.map(img => img.id)));
    }
  };

  const handleDeleteSelected = async () => {
    setDeleting(true);
    try {
      // 删除选中的图片
      for (const imageId of selectedImages) {
        await historyAPI.deleteImage(imageId);
      }
      setSelectedImages(new Set());
      setShowDeleteModal(false);
      fetchHistory(page);
    } catch (err) {
      alert('删除失败: ' + (err.response?.data?.detail || err.message));
    } finally {
      setDeleting(false);
    }
  };

  const handleDownloadSelected = async () => {
    try {
      // 下载选中的图片
      for (const imageId of selectedImages) {
        const image = images.find(img => img.id === imageId);
        if (image) {
          const blob = await historyAPI.downloadImage(imageId);
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = image.filename;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          // 添加小延迟避免浏览器限制
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
    } catch (err) {
      alert('下载失败: ' + (err.response?.data?.detail || err.message));
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  if (loading && images.length === 0) {
    return (
      <Card>
        <Card.Header as="h5">历史记录</Card.Header>
        <Card.Body className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
          <Spinner animation="border" />
        </Card.Body>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <Card.Header as="h5" className="d-flex justify-content-between align-items-center">
          <div>
            历史记录
            <small className="text-muted ms-2">共 {total} 张图片</small>
          </div>
          {images.length > 0 && (
            <div>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={handleSelectAll}
                className="me-2"
              >
                {selectedImages.size === images.length ? '取消全选' : '全选'}
              </Button>
              <Button
                variant="outline-primary"
                size="sm"
                onClick={handleDownloadSelected}
                disabled={selectedImages.size === 0}
                className="me-2"
              >
                下载选中 ({selectedImages.size})
              </Button>
              <Button
                variant="outline-danger"
                size="sm"
                onClick={() => setShowDeleteModal(true)}
                disabled={selectedImages.size === 0}
              >
                删除选中 ({selectedImages.size})
              </Button>
            </div>
          )}
        </Card.Header>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}

          {images.length === 0 && !loading ? (
            <Alert variant="info">还没有生成任何图片</Alert>
          ) : (
            <>
              <Row className="g-3 mb-3">
                {images.map((image) => (
                                <Col key={image.id} xs={12} sm={6} md={4} lg={3}>
                                  <Card className={`h-100 image-gallery-card ${selectedImages.has(image.id) ? 'border-primary' : ''}`}>
                                    <div className="position-relative img-container">
                                      <div className="image-checkbox">
                                        <Form.Check
                                          type="checkbox"
                                          checked={selectedImages.has(image.id)}
                                          onChange={() => handleSelectImage(image.id)}
                                        />
                                      </div>
                                      <Card.Img
                                        variant="top"
                                        src={`http://localhost:15000/static/images/${image.filename}`}
                                        alt={image.prompt}
                                        style={{ height: '200px', objectFit: 'cover' }}
                                      />
                                    </div>
                                    <Card.Body className="d-flex flex-column">
                                      <Card.Text
                                        className="flex-grow-1"
                                        style={{
                                          fontSize: '0.875rem',
                                          maxHeight: '60px',
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis',
                                        }}
                                      >
                                        {image.prompt}
                                      </Card.Text>
                                      <small className="text-muted mb-2">
                                        📐 {image.width}x{image.height} | ⚡ {image.num_inference_steps}步 | 🎲 {image.seed || '随机'}
                                      </small>
                                      <small className="text-muted mb-3 d-block">
                                        🕐 {new Date(image.created_at).toLocaleString('zh-CN')}
                                      </small>
                                      <Button
                                        variant="outline-primary"
                                        size="sm"
                                        onClick={() => handleDownload(image)}
                                        className="w-100"
                                      >
                                        📥 下载
                                      </Button>
                                    </Card.Body>
                                  </Card>
                                </Col>
                              ))}              </Row>

              {totalPages > 1 && (
                <div className="d-flex justify-content-center">
                  <Button
                    variant="outline-secondary"
                    onClick={() => fetchHistory(page - 1)}
                    disabled={page === 1}
                    className="me-2"
                  >
                    上一页
                  </Button>
                  <span className="align-self-center">
                    第 {page} / {totalPages} 页
                  </span>
                  <Button
                    variant="outline-secondary"
                    onClick={() => fetchHistory(page + 1)}
                    disabled={page === totalPages}
                    className="ms-2"
                  >
                    下一页
                  </Button>
                </div>
              )}
            </>
          )}
        </Card.Body>
      </Card>

      {/* 删除确认对话框 */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>确认删除</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          确定要删除选中的 {selectedImages.size} 张图片吗？此操作不可恢复。
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            取消
          </Button>
          <Button variant="danger" onClick={handleDeleteSelected} disabled={deleting}>
            {deleting ? '删除中...' : '确认删除'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ImageGallery;