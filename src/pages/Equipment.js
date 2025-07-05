// Equipment.js
import React, { useState, useEffect } from 'react';
import { Table, Input, Select, Switch } from 'antd';
import axios from 'axios';

const { Option } = Select;

/**
 * Recursively add all ancestors (bases) for a given equipment.
 * @param {object} equipment - The equipment record.
 * @param {object} equipmentIndex - An object mapping equipment names to their records.
 * @param {Set} chainSet - A Set in which to add the found base names.
 */
function getAncestors(equipment, equipmentIndex, chainSet) {
  if (!equipment.base) return;
  // Skip special markers
  if (equipment.base === "(基点)" || equipment.base === "(合成)") return;
  
  // The Base field may contain more than one equipment name separated by spaces.
  const baseNames = equipment.base.split(' ').filter(name => name.trim() !== '');
  baseNames.forEach(baseName => {
    if (!chainSet.has(baseName)) {
      chainSet.add(baseName);
      if (equipmentIndex[baseName]) {
        getAncestors(equipmentIndex[baseName], equipmentIndex, chainSet);
      }
    }
  });
}

// Utility function to check if a given rarity qualifies as "A or above".
function isRarityAOrAbove(rarity) {
  return rarity && (rarity[0] === 'S' || rarity[0] === 'A');
}

// Utility function to check if inscription contains "追撃" or "加撃"
function hasSpecialInscription(inscription) {
  return inscription && (inscription.includes("追撃") || inscription.includes("加撃"));
}

export default function Equipments() {
  const [equipments, setEquipments] = useState(null);
  // Filter states
  const [nameFilter, setNameFilter] = useState("");
  const [partFilter, setPartFilter] = useState(null);
  const [typeFilter, setTypeFilter] = useState(null);
  const [proFilter, setProFilter] = useState(null);
  const [rarityAFilterEnabled, setRarityAFilterEnabled] = useState(false);
  const [inscriptionFilterEnabled, setInscriptionFilterEnabled] = useState(false);

  useEffect(() => {
    const fetchEquipments = async () => {
      try {
        // Adjust the endpoint as needed (e.g., REACT_APP_BACKEND_BASE_URL can be set in your .env file)
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_BASE_URL}/equipments`);
        // The expected JSON structure is similar to { "0": {..}, "1": {..}, ... }
        setEquipments(response.data);
      } catch (error) {
        console.error("Error fetching equipments:", error);
      }
    };

    fetchEquipments();
  }, []);

  if (!equipments) {
    return <>loading...</>;
  }

  // Convert the JSON object into an array
  const dataArr = Object.keys(equipments).map((key) => ({
    key, // Unique key for each row
    ...equipments[key],
  }));

  // Build an index mapping equipment names to their records for quick lookup.
  const equipmentIndex = dataArr.reduce((acc, equipment) => {
    acc[equipment.name] = equipment;
    return acc;
  }, {});

  // Get unique values for dropdown filters
  const uniqueParts = [...new Set(dataArr.map((equip) => equip.part))].filter(Boolean);
  const uniqueTypes = [...new Set(dataArr.map((equip) => equip.type))].filter(Boolean);
  const uniquePros = [...new Set(dataArr.map((equip) => equip.pro))].filter(Boolean);

  // Build the chain of names when a name filter is entered.
  let nameChainSet = null;
  if (nameFilter) {
    nameChainSet = new Set();
    dataArr
      .filter(e => e.name === nameFilter)
      .forEach(e => {
        nameChainSet.add(e.name);
        getAncestors(e, equipmentIndex, nameChainSet);
      });
  }

  // Apply all filters
  const filteredData = dataArr.filter((equip) => {
    const passesNameFilter = nameFilter ? nameChainSet.has(equip.name) : true;
    const passesPartFilter = partFilter ? equip.part === partFilter : true;
    const passesTypeFilter = typeFilter ? equip.type === typeFilter : true;
    const passesProFilter = proFilter ? equip.pro === proFilter : true;
    const passesRarityFilter = rarityAFilterEnabled ? isRarityAOrAbove(equip.rare) : true;
    const passesInscriptionFilter = inscriptionFilterEnabled ? hasSpecialInscription(equip.inscription) : true;
    
    return passesNameFilter && passesPartFilter && passesTypeFilter && 
           passesProFilter && passesRarityFilter && passesInscriptionFilter;
  });

  // Always sort by ascending level and then by ascending rank.
  const sortedData = [...filteredData].sort((a, b) => {
    if (a.level !== b.level) {
      return a.level - b.level;
    }
    return a.rank - b.rank;
  });

  // Define table columns based on your CSV columns
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
      title: 'Rare',
      dataIndex: 'rare',
      key: 'rare',
    },
    {
      title: 'Level',
      dataIndex: 'level',
      key: 'level',
    },    
    {
      title: 'Part',
      dataIndex: 'part',
      key: 'part',
    },
    {
      title: 'Physical Def',
      dataIndex: 'phyDef',
      key: 'phyDef',
    },
    {
      title: 'Magical Def',
      dataIndex: 'magDef',
      key: 'magDef',
    },
    {
      title: 'Inscription',
      dataIndex: 'inscription',
      key: 'inscription',
    },
    {
      title: 'Base',
      dataIndex: 'base',
      key: 'base',
    },
    {
      title: 'Raw Materials',
      dataIndex: 'rawMaterials',
      key: 'rawMaterials',
    },
    {
      title: 'Notice',
      dataIndex: 'notice',
      key: 'notice',
    },    
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Pro',
      dataIndex: 'pro',
      key: 'pro',
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      <h2>Equipments</h2>
      <div style={{ marginBottom: 16 }}>
        {/* First row of filters */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
          {/* Equipment name filter */}
          <Input
            placeholder="Filter by equipment name"
            style={{ width: 200, marginRight: 16 }}
            onChange={(e) => setNameFilter(e.target.value)}
            allowClear
          />
          {/* Part filter */}
          <Select
            placeholder="Filter by Part"
            style={{ width: 150, marginRight: 16 }}
            onChange={(value) => setPartFilter(value)}
            allowClear
          >
            {uniqueParts.map((part, index) => (
              <Option key={index} value={part}>
                {part}
              </Option>
            ))}
          </Select>
          {/* Type filter */}
          <Select
            placeholder="Filter by Type"
            style={{ width: 150, marginRight: 16 }}
            onChange={(value) => setTypeFilter(value)}
            allowClear
          >
            {uniqueTypes.map((type, index) => (
              <Option key={index} value={type}>
                {type}
              </Option>
            ))}
          </Select>
          {/* Pro filter */}
          <Select
            placeholder="Filter by Pro"
            style={{ width: 150 }}
            onChange={(value) => setProFilter(value)}
            allowClear
          >
            {uniquePros.map((pro, index) => (
              <Option key={index} value={pro}>
                {pro}
              </Option>
            ))}
          </Select>
        </div>
        
        {/* Second row of filters - toggles */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {/* Rarity A or above toggle */}
          <div style={{ display: 'flex', alignItems: 'center', marginRight: 24 }}>
            <Switch
              checked={rarityAFilterEnabled}
              onChange={(checked) => setRarityAFilterEnabled(checked)}
            />
            <span style={{ marginLeft: 8 }}>
              Show only equipments with rarity A or above
            </span>
          </div>
          
          {/* Special inscription toggle */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Switch
              checked={inscriptionFilterEnabled}
              onChange={(checked) => setInscriptionFilterEnabled(checked)}
            />
            <span style={{ marginLeft: 8 }}>
              Show only equipments with "追撃" or "加撃" inscription
            </span>
          </div>
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