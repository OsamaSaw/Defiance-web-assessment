import { useState, useEffect, useCallback } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  Tag,
  Space,
  Popconfirm,
  Row,
  Col,
  Card,
  Statistic,
  message
} from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faPenToSquare, faTrash } from '@fortawesome/free-solid-svg-icons';
import dayjs from 'dayjs';

import ContentPanel from '../components/core/layout/ContentPanel';
import Api from '../helpers/core/Api';

const TYPE_OPTIONS = [
  { value: 'income', label: 'Income' },
  { value: 'expense', label: 'Expense' }
];

const Home = () => {
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null); // transaction being edited, or null when adding
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  // Load the list from the API
  const fetchTransactions = useCallback(() => {
    setLoading(true);
    Api.get('/transactions')
      .then(({ data }) => setTransactions(data))
      .catch(err => err?.globalHandler?.())
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const openAdd = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ type: 'expense', date: dayjs() });
    setModalOpen(true);
  };

  const openEdit = record => {
    setEditing(record);
    form.setFieldsValue({ ...record, date: dayjs(record.date) });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  const handleSubmit = values => {
    const payload = { ...values, date: values.date.toISOString() };
    setSaving(true);

    const request = editing ? Api.patch(`/transactions/${editing._id}`, payload) : Api.post('/transactions', payload);

    request
      .then(() => {
        message.success(editing ? 'Entry updated' : 'Entry added');
        closeModal();
        fetchTransactions();
      })
      .catch(err => err?.globalHandler?.())
      .finally(() => setSaving(false));
  };

  const handleDelete = id =>
    Api.delete(`/transactions/${id}`)
      .then(() => {
        message.success('Entry deleted');
        fetchTransactions();
      })
      .catch(err => err?.globalHandler?.());

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpense;

  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: date => dayjs(date).format('DD/MM/YYYY'),
      sorter: (a, b) => new Date(a.date) - new Date(b.date),
      defaultSortOrder: 'descend'
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: type => <Tag color={type === 'income' ? 'green' : 'red'}>{type.toUpperCase()}</Tag>,
      filters: TYPE_OPTIONS.map(o => ({ text: o.label, value: o.value })),
      onFilter: (value, record) => record.type === value
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      sorter: (a, b) => a.category.localeCompare(b.category)
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      align: 'right',
      sorter: (a, b) => a.amount - b.amount,
      render: (amount, record) => (
        <span style={{ color: record.type === 'income' ? '#3f8600' : '#cf1322' }}>
          {record.type === 'income' ? '+' : '-'}
          {amount.toFixed(2)}
        </span>
      )
    },
    { title: 'Note', dataIndex: 'note', key: 'note', ellipsis: true },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button size="small" onClick={() => openEdit(record)} icon={<FontAwesomeIcon icon={faPenToSquare} />} />
          <Popconfirm
            title="Delete this entry?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button size="small" danger icon={<FontAwesomeIcon icon={faTrash} />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  const addButton = (
    <Button type="primary" icon={<FontAwesomeIcon icon={faPlus} />} onClick={openAdd}>
      Add entry
    </Button>
  );

  return (
    <ContentPanel title="Expense & Income Diary" titleAction={addButton} loading={loading}>
      <Row gutter={16} className="mb-4">
        <Col xs={24} sm={8}>
          <Card>
            <Statistic title="Total Income" value={totalIncome} precision={2} valueStyle={{ color: '#3f8600' }} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic title="Total Expense" value={totalExpense} precision={2} valueStyle={{ color: '#cf1322' }} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Balance"
              value={balance}
              precision={2}
              valueStyle={{ color: balance >= 0 ? '#3f8600' : '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      <Table rowKey="_id" columns={columns} dataSource={transactions} pagination={{ pageSize: 10 }} />

      <Modal
        title={editing ? 'Edit entry' : 'Add entry'}
        open={modalOpen}
        onCancel={closeModal}
        onOk={() => form.submit()}
        confirmLoading={saving}
        okText="Save"
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} requiredMark={false}>
          <Form.Item name="type" label="Type" rules={[{ required: true }]}>
            <Select options={TYPE_OPTIONS} />
          </Form.Item>
          <Form.Item name="amount" label="Amount" rules={[{ required: true, message: 'Amount is required' }]}>
            <InputNumber min={0.01} step={0.01} style={{ width: '100%' }} placeholder="0.00" />
          </Form.Item>
          <Form.Item name="category" label="Category" rules={[{ required: true, message: 'Category is required' }]}>
            <Input placeholder="e.g. Groceries, Salary" />
          </Form.Item>
          <Form.Item name="date" label="Date" rules={[{ required: true, message: 'Date is required' }]}>
            <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="note" label="Note">
            <Input.TextArea rows={2} placeholder="Optional note" />
          </Form.Item>
        </Form>
      </Modal>
    </ContentPanel>
  );
};

export default Home;
