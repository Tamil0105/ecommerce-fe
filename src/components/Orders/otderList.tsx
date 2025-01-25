import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchOrders, deleteOrder, updateOrder, fetchProducts } from '../../services/api';
import { Table, Button, Modal, Spin, message, Input, Row, Col, Checkbox } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

interface Product {
  id: number;
  productName: string;
  description: string;
}

interface Order {
  id: number; 
  description: string;
  orderedProducts: { id: number; product: Product }[];
  date: Date; 
}

const OrdersList: React.FC = () => {
  const queryClient = useQueryClient();
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [newDescription, setNewDescription] = useState('');
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: products, isLoading: loadingProducts } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      try {
        const res = await fetchProducts();
        return res as Product[];
      } catch (error) {
        console.error('Error fetching products:', error);
        throw error;
      }
    },
    staleTime: 30000,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      try {
        const res = await fetchOrders();
        return res as Order[];
      } catch (error) {
        console.error('Error fetching orders:', error);
        throw error;
      }
    },
    staleTime: 30000,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      message.success('Order deleted successfully');
    },
    onError: (error: any) => {
      console.error('Error deleting order:', error);
      message.error('Error deleting order');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (order: { orderData: { id:number,description: string }; productIds: number[] }) => updateOrder(order),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setEditingOrder(null); 
      setNewDescription(''); 
      setSelectedProductIds([]); // Reset selected product IDs
      message.success('Order updated successfully');
    },
    onError: (error: any) => {
      console.error('Error updating order:', error);
      message.error('Error updating order');
    },
  });

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this order?',
      onOk: () => deleteMutation.mutate(id),
    });
  };

  const handleEdit = (order: Order) => {
    setEditingOrder(order);
    setNewDescription(order.description);
    setSelectedProductIds(order.orderedProducts.map(p => p.product.id)); // Set selected product IDs for editing
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDescription.trim()) {
      message.warning('Description is required');
      return;
    }

    if (editingOrder) {
      const orderPayload = {
        orderData: {
           id:editingOrder.id,
          description: newDescription,
        },
        productIds: selectedProductIds,
      };
      updateMutation.mutate(orderPayload); // Pass the order ID and the payload
    }
  };

  const handleCheckboxChange = (id: number) => {
    setSelectedProductIds(prev =>
      prev.includes(id) ? prev.filter(productId => productId !== id) : [...prev, id]
    );
  };

  if (isLoading || loadingProducts) return <Spin tip="Loading..." />;

  const filteredData = data?.filter(order =>
    order.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = [
    {
      title: 'Order Id',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Ordered Products',
      dataIndex: 'orderedProducts',
      key: 'orderedProducts',
      render: (orderedProducts: { id: number; product: Product }[]) => (
        <ul>
          {orderedProducts.map((product) => (
            <li key={product.id}>{product.product.productName}</li>
          ))}
        </ul>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date: Date) => {
        return new Date(date).toDateString();
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (order: Order) => (
        <>
          <Button type="link" onClick={() => handleEdit(order)} icon={<EditOutlined />}>
            Edit
          </Button>
          <Button type="link" danger onClick={() => handleDelete(order.id!)} icon={<DeleteOutlined />}>
            Delete
          </Button>
        </>
      ),
    },
  ];

  return (
    <div className="p-4">
      <Row justify="space-between" align="middle" className="mb-4">
        <Col>
          <h2 className="text-lg font-bold">Ordered List</h2>
        </Col>
        <Col>
          <Input
            placeholder="Search by description"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: 200 }} 
          />
        </Col>
      </Row>
      <Table dataSource={filteredData} columns={columns} rowKey="id" pagination={false} />

      <Modal
        title="Edit Order"
        visible={!!editingOrder}
        onCancel={() => setEditingOrder(null)}
        footer={null}
      >
        <form onSubmit={handleUpdate}>
          <Input
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            placeholder="New order description"
            className="mb-2"
          />
          <h4>Available Products</h4>
          {products?.map(product => (
            <Checkbox
              key={product.id}
              checked={selectedProductIds.includes(product.id)}
              onChange={() => handleCheckboxChange(product.id)}
            >
              {product.productName}
            </Checkbox>
          ))}
          <Row style={{ marginTop: '8px' }}>
            <Col>
              <Button type="primary" htmlType="submit" loading={updateMutation.isPending}>
                Update
              </Button>
            </Col>
            <Col style={{ marginLeft: '8px' }}>
              <Button type="default" onClick={() => setEditingOrder(null)}>
                Cancel
              </Button>
            </Col>
          </Row>
        </form>
        {updateMutation.isError && (
          <div className="mt-2 text-red-600">
            Error updating order: {updateMutation.error.message}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OrdersList;