import React from 'react';
import { observer } from 'mobx-react-lite';
import { Form, Input, Button } from 'antd';

import { useStore } from 'src/store';

interface Fields {
  email: string;
  password: string;
}

export const LoginForm: React.FC = observer(() => {
  const [form] = Form.useForm<Fields>();
  const store = useStore();

  const onSubmit = async (values: Fields) => {
    try {
      await store.login(values);
      form.resetFields();
    } catch (e) {
      form.setFields([
        { name: 'error', errors: [e.response?.data?.message] },
      ]);
    }
  };
  return (
    <Form
      form={form}
      name="basic"
      labelCol={{ span: 8 }}
      wrapperCol={{ span: 16 }}
      initialValues={{ remember: true }}
      onFinish={onSubmit}
    >
      <Form.Item
        label="E-mail"
        name="email"
        rules={[{ required: true, message: 'Please input your username!' }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label="Password"
        name="password"
        rules={[{ required: true, message: 'Please input your password!' }]}
      >
        <Input.Password />
      </Form.Item>

      <Form.Item name="error">
        <Button type="primary" htmlType="submit">Login</Button>
      </Form.Item>
    </Form>
  );
});
