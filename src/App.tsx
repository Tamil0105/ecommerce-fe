import './App.css';
import { useState } from 'react';
import OrderForm from './components/Orders/orderForm';
import OrdersList from './components/Orders/otderList';
import { Modal } from 'antd';
import Navbar from './components/navBar';

function App() {
  const [isOrderFormVisible, setIsOrderFormVisible] = useState(false);

  const handleOpenOrderForm = () => {
    setIsOrderFormVisible(true);
  };

  const handleCloseOrderForm = () => {
    setIsOrderFormVisible(false);
  };

  return (
    <>
      <Navbar onOpenOrderForm={handleOpenOrderForm} />
      <div className="container mx-auto p-8">
        <div className="mt-8">
          <OrdersList />
        </div>
      </div>
      <Modal
        title="Create Order"
        visible={isOrderFormVisible}
        onCancel={handleCloseOrderForm}
        footer={null}
      >
        <OrderForm onClose={handleCloseOrderForm} />
      </Modal>
    </>
  );
}

export default App;