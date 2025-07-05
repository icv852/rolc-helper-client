import React, { useState, useEffect } from 'react';
import { Table, Select, Input, Switch } from 'antd';
import axios from 'axios';

const { Option } = Select;

// Utility function to determine if a given rarity qualifies as "S or above"
// (adjust this logic based on your actual rarity system)
function isRaritySOrAbove(rarity) {
  return rarity && rarity.startsWith('S');
}

/**
 * Recursively add all ancestors (bases) for a given weapon.
 * @param {object} weapon - The weapon record.
 * @param {object} weaponIndex - An object mapping weapon names to their records.
 * @param {Set} chainSet - A Set in which to add the found base names.
 */
function getAncestors(weapon, weaponIndex, chainSet) {
  if (!weapon.base) return;
  // Skip special markers
  if (weapon.base === "(基点)" || weapon.base === "(合成)") return;
  
  // The Base field may contain more than one weapon name separated by spaces.
  const baseNames = weapon.base.split(' ').filter(name => name.trim() !== '');
  baseNames.forEach(baseName => {
    if (!chainSet.has(baseName)) {
      chainSet.add(baseName);
      if (weaponIndex[baseName]) {
        getAncestors(weaponIndex[baseName], weaponIndex, chainSet);
      }
    }
  });
}

export default function Weapons() {
  const [weapons, setWeapons] = useState(null);
  
  // Filters:
  const [nameFilter, setNameFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState(null);
  const [rarityFilterEnabled, setRarityFilterEnabled] = useState(false);

  useEffect(() => {
    const fetchWeapons = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_BASE_URL}/weapons`
        );
        setWeapons(response.data);
      } catch (error) {
        console.error("Error fetching weapons:", error);
      }
    };

    fetchWeapons();
  }, []);

  if (!weapons) {
    return <>loading...</>;
  }

  // Convert the JSON object into an array for the Table.
  const dataArr = Object.keys(weapons).map((key) => ({
    key, // unique key for each row
    ...weapons[key],
  }));

  // Build an index mapping weapon names to their records for quick lookup.
  const weaponIndex = dataArr.reduce((acc, weapon) => {
    acc[weapon.name] = weapon;
    return acc;
  }, {});

  // Dynamically generate unique weapon types for the dropdown filter.
  const uniqueTypes = [...new Set(dataArr.map((weapon) => weapon.type))];

  // Build the chain of names when a name filter is entered.
  let nameChainSet = null;
  if (nameFilter) {
    nameChainSet = new Set();
    dataArr
      .filter(w => w.name === nameFilter)
      .forEach(w => {
        nameChainSet.add(w.name);
        getAncestors(w, weaponIndex, nameChainSet);
      });
  }

  // Apply filtering.
  const filteredData = dataArr.filter((weapon) => {
    const passesNameFilter = nameFilter ? nameChainSet.has(weapon.name) : true;
    const passesTypeFilter = typeFilter ? weapon.type === typeFilter : true;
    const passesRarityFilter = rarityFilterEnabled ? isRaritySOrAbove(weapon.rare) : true;
    return passesNameFilter && passesTypeFilter && passesRarityFilter;
  });

  // Sort by ascending level and then by ascending rank.
  const sortedData = [...filteredData].sort((a, b) => {
    if (a.level !== b.level) {
      return a.level - b.level;
    }
    return a.rank - b.rank;
  });

  // Define the table columns.
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Rank',
      dataIndex: 'rank',
      key: 'rank',
    },
    {
      title: 'Rarity',
      dataIndex: 'rare',
      key: 'rare',
    },
    {
      title: 'Attribute',
      dataIndex: 'attribute',
      key: 'attribute',
    },
    {
      title: 'Left Hand?',
      dataIndex: 'leftHand',
      key: 'leftHand',
      render: (leftHand) => (leftHand ? "Yes" : "No"),
    },
    {
      title: 'Level',
      dataIndex: 'level',
      key: 'level',
    },
    {
      title: 'Physical Attack',
      dataIndex: 'phyAtk',
      key: 'phyAtk',
    },
    {
      title: 'Magic Attack',
      dataIndex: 'magAtk',
      key: 'magAtk',
    },
    {
      title: 'Crit',
      dataIndex: 'crit',
      key: 'crit',
    },
    {
      title: 'Skills',
      key: 'skills',
      render: (text, record) => {
        const skills = [
          record.skill1,
          record.skill2,
          record.skill3,
          record.skill4,
          record.skill5,
          record.skill6,
        ].filter(skill => skill && skill.trim() !== '');
        return skills.join(", ");
      },
    },
    {
      title: 'Raw Materials',
      dataIndex: 'rawMaterials',
      key: 'rawMaterials',
    },
    {
      title: 'Base',
      dataIndex: 'base',
      key: 'base',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      <h2>Weapons</h2>
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center' }}>
        {/* Weapon name filter */}
        <Input
          placeholder="Filter by weapon name"
          style={{ width: 200 }}
          onChange={(e) => setNameFilter(e.target.value)}
          allowClear
        />
        {/* Weapon type filter */}
        <Select
          placeholder="Select weapon type"
          style={{ width: 200, marginLeft: 16 }}
          onChange={(value) => setTypeFilter(value)}
          allowClear
        >
          {uniqueTypes.map((type, index) => (
            <Option key={index} value={type}>
              {type}
            </Option>
          ))}
        </Select>
        {/* Rarity filter toggle */}
        <div style={{ marginLeft: 16, display: 'flex', alignItems: 'center' }}>
          <Switch
            checked={rarityFilterEnabled}
            onChange={(checked) => setRarityFilterEnabled(checked)}
          />
          <span style={{ marginLeft: 8 }}>
            Show only weapons with rarity S or above
          </span>
        </div>
      </div>
      <Table
        dataSource={sortedData}
        columns={columns}
        rowKey="key"
        pagination={{ pageSize: 50 }}
      />
    </div>
  );
}