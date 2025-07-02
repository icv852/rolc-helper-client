import React, { useState, useEffect } from 'react';
import { Table, Select, Input } from 'antd';
import axios from 'axios';

const { Option } = Select;

export default function Items() {
  const [items, setItems] = useState(null);
  // Filter states
  const [coinTypeFilter, setCoinTypeFilter] = useState(null);
  const [nameFilter, setNameFilter] = useState("");

  useEffect(() => {
    const fetchItems = async () => {
      try {
        // Adjust the endpoint as needed (e.g., using REACT_APP_BACKEND_BASE_URL)
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_BASE_URL}/items`);
        setItems(response.data);
      } catch (error) {
        console.error('Error fetching items:', error);
      }
    };

    fetchItems();
  }, []);

  if (!items) {
    return <>loading...</>;
  }

  // Convert the JSON object to an array assuming the structure is { "0": { ... }, "1": { ... }, ... }
  const dataArr = Object.keys(items).map((key) => ({
    key, // Unique key for each row
    ...items[key],
  }));

  // Extract unique coinType values for the dropdown filter.
  const uniqueCoinTypes = [...new Set(dataArr.map((item) => item.coinType))];

  // Apply filtering for both coinType and name.
  const filteredData = dataArr.filter((item) => {
    const passesCoinFilter = coinTypeFilter ? item.coinType === coinTypeFilter : true;
    const passesNameFilter = nameFilter
      ? item.name.toLowerCase().includes(nameFilter.toLowerCase())
      : true;
    return passesCoinFilter && passesNameFilter;
  });

  // Define the table columns based on the schema.
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'DLC Name',
      dataIndex: 'dlcName',
      key: 'dlcName',
    },
    {
      title: 'Copper',
      dataIndex: 'copper',
      key: 'copper',
    },
    {
      title: 'Silver',
      dataIndex: 'silver',
      key: 'silver',
    },
    {
      title: 'Gold',
      dataIndex: 'gold',
      key: 'gold',
    },
    {
      title: 'Shadow',
      dataIndex: 'shadow',
      key: 'shadow',
    },
    {
      title: 'Huang',
      dataIndex: 'huang',
      key: 'huang',
    },
    {
      title: 'Normal',
      dataIndex: 'normal',
      key: 'normal',
    },
    {
      title: 'Coin Type',
      dataIndex: 'coinType',
      key: 'coinType',
    },
    {
      title: 'Notice',
      dataIndex: 'notice',
      key: 'notice',
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      <h2>Items List</h2>
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center' }}>
        {/* Free text filter for item name */}
        <Input
          placeholder="Filter by Item Name"
          style={{ width: 200, marginRight: 16 }}
          onChange={(e) => setNameFilter(e.target.value)}
          allowClear
        />
        {/* Coin type filter */}
        <Select
          placeholder="Filter by Coin Type"
          style={{ width: 200 }}
          onChange={(value) => setCoinTypeFilter(value)}
          allowClear
        >
          {uniqueCoinTypes.map((type, index) => (
            <Option key={index} value={type}>
              {type}
            </Option>
          ))}
        </Select>
      </div>
      <Table
        dataSource={filteredData}
        columns={columns}
        rowKey="name"
        pagination={{ pageSize: 50 }}
      />
    </div>
  );
}