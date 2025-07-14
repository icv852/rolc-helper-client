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

  function getTimes(task) {
    const isDay = task.day === true || task.day === 'true';
    const isDayS = task.dayS === true || task.dayS === 'true';
    const isEvening = task.evening === true || task.evening === 'true';
    const isEveningS = task.eveningS === true || task.eveningS === 'true';
    const isNight = task.night === true || task.night === 'true';
    const isNightS = task.nightS === true || task.nightS === 'true';

    const isDayAll = isDay && isDayS;
    const isEveningAll = isEvening && isEveningS;
    const isNightAll = isNight && isNightS;

    if (isDayAll && isEveningAll && isNightAll) {
      return "常時";
    }

    const dayString = isDayAll ? "昼 " : isDay ? "昼(平常) " : isDayS ? "昼(特殊) " : "";
    const eveningString = isEveningAll ? "朝夕 " : isEvening ? "朝夕(平常) " : isEveningS ? "朝夕(特殊) " : "";
    const nightString = isNightAll ? "夜 " : isNight ? "夜(平常) " : isNightS ? "夜(特殊) " : "";

    return `${dayString}${eveningString}${nightString}`;
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
    times: getTimes(tasks[key]),
    rank: tasks[key].map.rank,
    level: tasks[key].map.maxLv,
    notBoss: tasks[key].notBoss ? "yes" : "",
    notice: tasks[key].notice,
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

  // Always sort the data by rank and level in ascending order.
  const sortedData = filteredData.slice().sort((a, b) => {
    if (a.rank !== b.rank) {
      return a.rank - b.rank;
    }
    return a.level - b.level;
  });

  // Define the table columns.
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
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
    {
      title: "Times",
      dataIndex: "times",
      key: "times"
    },
    {
      title: "Rank",
      dataIndex: "rank",
      key: "rank"
    },
    {
      title: "Level",
      dataIndex: "level",
      key: "level"
    },
    {
      title: "Not final boss",
      dataIndex: "notBoss",
      key: "notBoss"
    },
    {
      title: "Notice",
      dataIndex: "notice",
      key: "notice"
    }
  ];

  return (
    <div style={{ padding: 20 }}>
      <h2>Tasks</h2>
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
      <Table dataSource={sortedData} columns={columns} rowKey="key" />
    </div>
  );
}