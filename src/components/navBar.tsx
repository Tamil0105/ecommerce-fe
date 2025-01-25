import React from 'react';
import { Button, Col, Row } from 'antd';

interface NavbarProps {
  onOpenOrderForm: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onOpenOrderForm }) => {
  return (
    <nav className="flex justify-between items-center p-4 bg-blue-500 text-white">
    
      <Row justify="space-between" align="middle" className="mb-4">
        <Col>
        <h1 className="text-xl font-bold">E-commerce Orders</h1>

        </Col>
        <Col>
        <Button type="primary" onClick={onOpenOrderForm}>
          Create Order
        </Button>
        </Col>
      </Row>
    </nav>
  );
};

export default Navbar;