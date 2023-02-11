import { PROTABLE_OPTIONS, SEARCH_CONFIGURE } from '@/utils/const';

import { timestampToDateStr } from '@/utils/date';
import { ProDescriptions, ProTable } from '@ant-design/pro-components';
import { PageContainer } from '@ant-design/pro-layout';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import { Button, Modal, Space, Tag } from 'antd';
import React, { useRef, useState } from 'react';
//import type { MenuListItem } from './types';

const OperationLog: React.FC = () => {
  // const { queryPage } = useGetTableList();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recordList, setRecordList] = useState('');
  const actionRef = useRef<ActionType>();
  // type QueryProp = typeof postSystemMenuIndex;

  const statusValueEnum = {
    1: { text: '成功', status: 'Success' },
    2: { text: '失败', status: 'Error' },
  };

  //mock
  const operationLogList = [
    {
      id: '1',
      systemModule: '用户管理',
      type: [
        {
          name: '新增',
          color: 'blue',
        },
      ],
      requestMethod: 'post',
      operator: 'xxx',
      ip: '192.168.0.1',
      status: '1',
      operationTime: '182736176313',
    },
  ];

  const onOpen = () => {
    setIsModalOpen(true);
  };
  const onClose = () => {
    setIsModalOpen(false);
  };

  const columns: ProColumns<MenuListItem>[] = [
    {
      title: '用户id',
      dataIndex: 'uid',
      hideInSearch: true,
    },
    {
      title: '操作名称',
      dataIndex: 'operName',
    },
    {
      title: '业务类型',
      dataIndex: 'businessType',
      valueType: 'select',
      hideInTable: true,
      valueEnum: {
        1: { text: '新增' },
        2: { text: '删除' },
        3: { text: '修改' },
        4: { text: '查询' },
      },
    },
    {
      title: '业务类型',
      dataIndex: 'businessType',
      valueType: 'select',
      hideInSearch: true,
      render: (_, record) => (
        <Space>
          {record.type.map(({ name, color }) => (
            <Tag color={color} key={name}>
              {name}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: '操作人员',
      dataIndex: 'operator',
      defaultSortOrder: 'ascend',
      sorter: (a, b) => a.order - b.order,
    },
    {
      title: '操作主机ip地址',
      dataIndex: 'operIpAddr',
      hideInSearch: true,
    },
    {
      title: '操作地点',
      dataIndex: 'operLocation',
      hideInSearch: true,
    },
    {
      title: '操作状态',
      dataIndex: 'status',
      filters: true,
      onFilter: true,
      valueType: 'select',
      hideInSearch: true,
      valueEnum: statusValueEnum,
    },

    {
      title: '操作时间',
      dataIndex: 'operationTime',
      valueType: 'dateTime',
      sorter: true,
      hideInSearch: true,
      renderText: (text: string) => timestampToDateStr(Number(text)),
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => (
        <Button
          type="primary"
          onClick={() => {
            setRecordList(record);
            onOpen();
          }}
        >
          查看详情
        </Button>
      ),
    },
  ];

  const queryPageHandler = async () =>
    // params: ParamsType & {
    //   pageSize?: number | undefined;
    //   current?: number | undefined;
    //   keyword?: string | undefined;
    // },
    {
      return Promise.resolve({
        data: operationLogList,
        success: true,
      });
    };
  console.log(statusValueEnum?.[recordList?.status]);
  return (
    // TODO: 菜单目前只支持单条搜索结果
    <PageContainer>
      <ProTable<MenuListItem>
        headerTitle="操作日志"
        actionRef={actionRef}
        rowKey="id"
        search={SEARCH_CONFIGURE}
        options={PROTABLE_OPTIONS}
        request={(params) => queryPageHandler(params)}
        columns={columns}
        pagination={false}
        size={'middle'}
      />
      <Modal title="操作日志详情" visible={isModalOpen} onOk={onOpen} onCancel={onClose}>
        <ProDescriptions column={2}>
          <ProDescriptions.Item valueType="text" ellipsis label="操作模块">
            {recordList?.systemModule}/{recordList?.type?.[0].name}
          </ProDescriptions.Item>
          <ProDescriptions.Item valueType="text" ellipsis label="请求地址">
            {recordList?.systemModule}/{recordList?.type?.[0].name}
          </ProDescriptions.Item>
          <ProDescriptions.Item valueType="text" ellipsis label="登录信息">
            {recordList?.operator}/{recordList?.ip}
          </ProDescriptions.Item>
          <ProDescriptions.Item valueType="text" ellipsis label="请求方式">
            {recordList?.requestMethod}
          </ProDescriptions.Item>
          <ProDescriptions.Item span={2} valueType="code" ellipsis label="操作方法">
            {recordList?.requestMethod}
          </ProDescriptions.Item>
          <ProDescriptions.Item span={2} valueType="code" ellipsis label="请求参数">
            {recordList?.requestMethod}
          </ProDescriptions.Item>
          <ProDescriptions.Item span={2} valueType="code" ellipsis label="返回参数">
            {recordList?.requestMethod}
          </ProDescriptions.Item>
          <ProDescriptions.Item valueType="text" ellipsis label="操作状态">
            {statusValueEnum?.[recordList?.status]?.text}
          </ProDescriptions.Item>
          <ProDescriptions.Item valueType="dateTime" ellipsis label="操作时间">
            {recordList?.operationTime}
          </ProDescriptions.Item>
        </ProDescriptions>
      </Modal>
    </PageContainer>
  );
};

export default OperationLog;
