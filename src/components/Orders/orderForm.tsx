import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createOrder, fetchProducts } from '../../services/api';
import { Form, Input, Checkbox, Button, Spin, message } from 'antd';

interface Product {
  id: number;
  productName: string;
  description: string;
}

interface OrderFormProps {
  onClose: () => void;
}

const OrderForm: React.FC<OrderFormProps> = ({ onClose }) => {
  const [description, setDescription] = useState('');
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const queryClient = useQueryClient();

  const { data: products, isLoading, isError } = useQuery({
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

  const createMutation = useMutation({
    mutationFn: async (newOrder: { orderData: { description: string }; productIds: number[] }) => {
      try {
        const response = await createOrder(newOrder);
        return response.data;
      } catch (error) {
        console.error('Error creating order:', error);
        throw error;
      }
    },
    onSuccess: () => {
      setDescription('');
      setSelectedProductIds([]);
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      message.success('Order created successfully');
      onClose(); 
    },
    onError: (error: any) => {
      message.error(`Error creating order: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      message.warning('Description is required');
      return;
    }

    createMutation.mutate({ orderData: { description }, productIds: selectedProductIds });
  };

 

  if (isLoading) return <Spin tip="Loading products..." />;
  if (isError) return <p>Error fetching products.</p>;

  return (
    <Form onSubmitCapture={handleSubmit} className="p-4">
      <Form.Item label="Order Description" required>
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter order description"
        />
      </Form.Item>

      <Form.Item label="Select Products">
        <Checkbox.Group value={selectedProductIds} onChange={setSelectedProductIds}>
          <div>
            {products==undefined||products.length==0?[]:products.map((product) => (
              <Checkbox key={product.id} value={product.id} className="flex items-center">
                {product.productName} - {product.description}
              </Checkbox>
            ))}
          </div>
        </Checkbox.Group>
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={createMutation.isPending}>
          Create Order
        </Button>
      </Form.Item>
    </Form>
  );
};

export default OrderForm;