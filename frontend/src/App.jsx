/**
 * Main App component.
 */
import React, { useState } from 'react';
import { Container, Row, Col, Navbar } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import GenerateForm from './components/GenerateForm';
import TaskStatus from './components/TaskStatus';
import SystemMonitor from './components/SystemMonitor';
import LatestImage from './components/LatestImage';
import ImageGallery from './components/ImageGallery';

function App() {
  const [taskId, setTaskId] = useState(null);

  const handleTaskCreated = (newTaskId) => {
    setTaskId(newTaskId);
  };

  return (
    <div className="App">
      <header>
        <Navbar expand="lg" className="navbar">
          <Container>
            <Navbar.Brand href="#">
              🎨 Z-Image 图像生成器
            </Navbar.Brand>
          </Container>
        </Navbar>
      </header>

      <Container className="main-container">
        {/* Top row: Generate form and System monitor */}
        <Row className="g-4 mb-4">
          <Col xs={12} lg={8}>
            <GenerateForm onTaskCreated={handleTaskCreated} />
          </Col>
          <Col xs={12} lg={4}>
            <SystemMonitor />
          </Col>
        </Row>

        {/* Task status row */}
        {taskId && (
          <Row className="mb-4">
            <Col xs={12}>
              <TaskStatus taskId={taskId} />
            </Col>
          </Row>
        )}

        {/* Latest image and History gallery */}
        <Row className="g-4 mb-4">
          <Col xs={12} xl={4}>
            <LatestImage />
          </Col>
          <Col xs={12} xl={8}>
            <ImageGallery />
          </Col>
        </Row>
      </Container>

      <footer>
        <Container className="text-center">
          <p className="mb-0">
            🚀 Z-Image 图像生成器 | 基于 Tongyi-MAI/Z-Image-Turbo 模型
          </p>
        </Container>
      </footer>
    </div>
  );
}

export default App;