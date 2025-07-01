import React, { useState, useEffect } from 'react';
import { Table, Input, Switch } from 'antd';
import axios from 'axios';

// Utility function to check if a given rarity qualifies as "A or above".
// This function considers rarities that start with "S" or "A"
function isRarityAOrAbove(rarity) {
  return rarity && (rarity[0] === 'S' || rarity[0] === 'A');
}

// Utility function to check if any of the ring's skills contains the substring "複".
function hasFuku(ring) {
  const skills = [
    ring.skill1,
    ring.skill2,
    ring.skill3,
    ring.skill4,
    ring.skill5,
    ring.skill6,
  ];
  return skills.some((skill) => skill && skill.includes("複"));
}

/**
 * Recursively add all ancestors (bases) for a given ring.
 * @param {object} ring - The ring record.
 * @param {object} ringIndex - An object mapping ring names to their records.
 * @param {Set} chainSet - A Set in which to add the found base ring names.
 */
function getAncestors(ring, ringIndex, chainSet) {
  if (!ring.base) return;
  // Skip special markers.
  if (ring.base === "(基点)" || ring.base === "(合成)") return;
  
  // The base field may contain more than one ring name separated by spaces.
  const baseNames = ring.base.split(' ').filter((name) => name.trim() !== '');
  baseNames.forEach((baseName) => {
    if (!chainSet.has(baseName)) {
      chainSet.add(baseName);
      if (ringIndex[baseName]) {
        getAncestors(ringIndex[baseName], ringIndex, chainSet);
      }
    }
  });
}

export default function Rings() {
  const [rings, setRings] = useState(null);
  
  // Filter states:
  // Free text filter for the ring name.
  const [nameFilter, setNameFilter] = useState("");
  // Toggle to show only rings with rarity A or above.
  const [rarityAFilterEnabled, setRarityAFilterEnabled] = useState(false);
  // Toggle to show only rings containing the word "複" in any skill.
  const [fukuFilterEnabled, setFukuFilterEnabled] = useState(false);

  useEffect(() => {
    const fetchRings = async () => {
      try {
        // Adjust the URL as needed to point to your CSV/JSON endpoint.
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_BASE_URL}/rings`
        );
        // Expecting the JSON to follow a similar structure such as { "0": {...}, "1": {...}, ... }
        setRings(response.data);
      } catch (error) {
        console.error("Error fetching rings:", error);
      }
    };

    fetchRings();
  }, []);

  if (!rings) {
    return <>loading...</>;
  }

  // Convert the JSON object into an array for the Table.
  const dataArr = Object.keys(rings).map((key) => ({
    key, // Unique identifier for each row.
    ...rings[key],
  }));

  // Build an index mapping ring names to their records for quick lookup.
  const ringIndex = dataArr.reduce((acc, ring) => {
    acc[ring.name] = ring;
    return acc;
  }, {});

  // If a ring name filter is entered, build the full chain of names (including recursive bases).
  let nameChainSet = null;
  if (nameFilter) {
    nameChainSet = new Set();
    dataArr
      .filter((ring) => ring.name === nameFilter)
      .forEach((ring) => {
        nameChainSet.add(ring.name);
        getAncestors(ring, ringIndex, nameChainSet);
      });
  }

  // Apply filtering based on ring name, rarity A filter, and the skill "複" filter.
  const filteredData = dataArr.filter((ring) => {
    const passesNameFilter = nameFilter ? nameChainSet.has(ring.name) : true;
    const passesRarityAFilter = rarityAFilterEnabled ? isRarityAOrAbove(ring.rare) : true;
    const passesFukuFilter = fukuFilterEnabled ? hasFuku(ring) : true;
    return passesNameFilter && passesRarityAFilter && passesFukuFilter;
  });

  // Always sort by ascending level and then by ascending rank.
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
        ].filter((skill) => skill && skill.trim() !== '');
        return skills.join(", ");
      },
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
  ];

  return (
    <div style={{ padding: 20 }}>
      <h2>リングリスト</h2>
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center' }}>
        {/* Ring name filter */}
        <Input
          placeholder="Filter by ring name"
          style={{ width: 200 }}
          onChange={(e) => setNameFilter(e.target.value)}
          allowClear
        />

        {/* Rarity A or above toggle */}
        <div style={{ marginLeft: 16, display: 'flex', alignItems: 'center' }}>
          <Switch
            checked={rarityAFilterEnabled}
            onChange={(checked) => setRarityAFilterEnabled(checked)}
          />
          <span style={{ marginLeft: 8 }}>
            Show only rings with rarity A or above
          </span>
        </div>

        {/* Skill "複" toggle */}
        <div style={{ marginLeft: 16, display: 'flex', alignItems: 'center' }}>
          <Switch
            checked={fukuFilterEnabled}
            onChange={(checked) => setFukuFilterEnabled(checked)}
          />
          <span style={{ marginLeft: 8 }}>
            Show only rings with "複" in skills
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