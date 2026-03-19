import { Table, Input, Row, Col } from "antd";
import { useState, useMemo } from "react";

const { Search } = Input;

function CommonTable({
  columns,
  dataSource,
  rowKey = "id",
  searchFields = [], // field yg mau di-search
  placeholder = "Search...",
  pagination = true,
  rowClassName = {},
}) {
  const [searchText, setSearchText] = useState("");

  // 🔥 FILTER DATA (GENERIC)
  const filteredData = useMemo(() => {
    if (!searchText) return dataSource;

    return dataSource.filter((item) =>
      searchFields.some((field) => {
        const value = field.split(".").reduce((obj, key) => obj?.[key], item);

        return value
          ?.toString()
          .toLowerCase()
          .includes(searchText.toLowerCase());
      }),
    );
  }, [searchText, dataSource, searchFields]);

  return (
    <>
      {/* 🔥 SEARCH POJOK KANAN */}
      <Row justify="end" style={{ marginBottom: 16 }}>
        <Col>
          <Search
            placeholder={placeholder}
            allowClear
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 250 }}
          />
        </Col>
      </Row>

      {/* 🔥 TABLE */}
      <Table
        columns={columns}
        dataSource={filteredData}
        rowKey={rowKey}
        scroll={{ x: true }}
        pagination={pagination}
        rowClassName={rowClassName}
      />
    </>
  );
}

export default CommonTable;
