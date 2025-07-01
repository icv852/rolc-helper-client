import React, { useState, useEffect } from 'react';
import { Table, Select, Input } from 'antd';
import axios from 'axios';

const { Option } = Select;

export default function Tasks() {
  const [tasks, setTasks] = useState(null);
  // State for the selected time filter (e.g., "day", "evening", etc.)
  const [filterKey, setFilterKey] = useState(null);
  // State for the item name filter (free text input)
  const [itemNameFilter, setItemNameFilter] = useState("");
  // State for the DLC filter (dropdown)
  const [dlcFilter, setDlcFilter] = useState(null);

  useEffect(() => {
    const runEffect = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_BASE_URL}/tasks`
        );
        // Set the actual JSON data into state
        setTasks(response.data);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };
    runEffect();
  }, []);

  if (!tasks) {
    return <>loading...</>;
  }

  // Convert the JSON object into an array for the Table.
  const dataArr = Object.keys(tasks).map((key) => ({
    key, // unique key for each row
    ...tasks[key],
    // Ensure the time properties are booleans (if needed)
    day: tasks[key].day === true || tasks[key].day === 'true',
    dayS: tasks[key].dayS === true || tasks[key].dayS === 'true',
    evening: tasks[key].evening === true || tasks[key].evening === 'true',
    eveningS: tasks[key].eveningS === true || tasks[key].eveningS === 'true',
    night: tasks[key].night === true || tasks[key].night === 'true',
    nightS: tasks[key].nightS === true || tasks[key].nightS === 'true',
  }));

  // Dynamically generate unique DLC names for the dropdown.
  const uniqueDLC = [...new Set(dataArr.map((entry) => entry.dlcName))];

  // Update state when the time dropdown selection changes.
  const handleFilterChange = (value) => {
    setFilterKey(value);
  };

  // Filter the data based on all conditions.
  const filteredData = dataArr.filter((entry) => {
    const passesTimeFilter = filterKey ? entry[filterKey] === true : true;
    const passesItemNameFilter = itemNameFilter
      ? entry.itemName === itemNameFilter
      : true;
    const passesDLCFilter = dlcFilter ? entry.dlcName === dlcFilter : true;
    return passesTimeFilter && passesItemNameFilter && passesDLCFilter;
  });

  // Define the table columns.
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
      <h2>クエストリスト</h2>
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center' }}>
        {/* Time filter dropdown */}
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

        {/* Item name free text filter */}
        <Input
          placeholder="Filter by item name"
          style={{ width: 200, marginLeft: 16 }}
          onChange={(e) => setItemNameFilter(e.target.value)}
          allowClear
        />

        {/* DLC filter dropdown */}
        <Select
          placeholder="Select DLC filter"
          style={{ width: 200, marginLeft: 16 }}
          onChange={(value) => setDlcFilter(value)}
          allowClear
        >
          {uniqueDLC.map((dlc, index) => (
            <Option key={index} value={dlc}>
              {dlc}
            </Option>
          ))}
        </Select>
      </div>
      <Table dataSource={filteredData} columns={columns} rowKey="key" />
    </div>
  );
}