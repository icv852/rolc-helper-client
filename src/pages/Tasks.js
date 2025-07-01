import React, { useState, useEffect } from 'react';
import { Table, Select, Input } from 'antd';
import axios from "axios";

const { Option } = Select;

export default function Tasks() {
  const [tasks, setTasks] = useState(null);
  // State for the selected time filter (e.g., "day", "evening", etc.)
  const [filterKey, setFilterKey] = useState(null);
  // State for the item name filter input
  const [itemNameFilter, setItemNameFilter] = useState("");

  useEffect(() => {
    const runEffect = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_BASE_URL}/tasks`);
        setTasks(response.data); // response.data should contain your JSON data
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };
    runEffect();
  }, []);

  if (!tasks) {
    return <>loading...</>;
  }

  // Convert the JSON object into an array suitable for the Table.
  const dataArr = Object.keys(tasks).map((key) => ({
    key, // Unique key for each row
    ...tasks[key],
    // Optionally ensure time values are booleans
    day: tasks[key].day === true || tasks[key].day === 'true',
    dayS: tasks[key].dayS === true || tasks[key].dayS === 'true',
    evening: tasks[key].evening === true || tasks[key].evening === 'true',
    eveningS: tasks[key].eveningS === true || tasks[key].eveningS === 'true',
    night: tasks[key].night === true || tasks[key].night === 'true',
    nightS: tasks[key].nightS === true || tasks[key].nightS === 'true',
  }));

  // Handle dropdown change for time filtering.
  const handleFilterChange = (value) => {
    setFilterKey(value);
  };

  // Apply filtering based on time and item name.
  const filteredData = dataArr.filter((entry) => {
    const passesTimeFilter = filterKey ? entry[filterKey] === true : true;
    const passesItemNameFilter = itemNameFilter ? entry.itemName === itemNameFilter : true;
    return passesTimeFilter && passesItemNameFilter;
  });

  // Table columns definition.
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Difficulty',
      dataIndex: 'difficulty',
      key: 'difficulty',
    },
    {
      title: 'Map Name',
      dataIndex: 'mapName',
      key: 'mapName',
    },
    {
      title: 'DLC Name',
      dataIndex: 'dlcName',
      key: 'dlcName',
    },
    {
      title: 'Item Name',
      dataIndex: 'itemName',
      key: 'itemName',
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      <h2>Tasks</h2>
      <div style={{ marginBottom: 16, display: "flex", alignItems: "center" }}>
        <Select
          placeholder="Select time filter"
          style={{ width: 200 }}
          onChange={handleFilterChange}
          allowClear
        >
          <Option value="day">Day</Option>
          <Option value="dayS">Day S</Option>
          <Option value="evening">Evening</Option>
          <Option value="eveningS">Evening S</Option>
          <Option value="night">Night</Option>
          <Option value="nightS">Night S</Option>
        </Select>
        <Input
          placeholder="Filter by item name"
          style={{ width: 200, marginLeft: 16 }}
          onChange={(e) => setItemNameFilter(e.target.value)}
          allowClear
        />
      </div>
      <Table dataSource={filteredData} columns={columns} rowKey="key" />
    </div>
  );
}