import { postApiV1ThingsProductInfoIndex } from '@/services/iThingsapi/chanpinguanli';
import { postApiV1ThingsDeviceInfoIndex } from '@/services/iThingsapi/shebeiguanli';
import {
  postApiV1ThingsDeviceMsgPropertyLatestIndex,
  postApiV1ThingsDeviceMsgPropertyLogIndex,
} from '@/services/iThingsapi/shebeixiaoxi';
import { postApiV1ThingsProductSchemaIndex } from '@/services/iThingsapi/wumoxing';
import { DashboardOutlined, UserOutlined } from '@ant-design/icons';
import { useRequest } from 'ahooks';
import { Badge, Button, Card, Col, Empty, List, Row, Select, Space, Spin } from 'antd';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import { LineChart, PieChart } from 'echarts/charts';
import {
  GridComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent,
} from 'echarts/components';
import * as echarts from 'echarts/core';
import { LabelLayout, UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';
import ExportJsonExcel from 'js-export-excel';
import moment from 'moment';
import React, { useEffect, useMemo, useState } from 'react';

import type { PieSeriesOption } from 'echarts/charts';
import type {
  GridComponentOption,
  LegendComponentOption,
  TooltipComponentOption,
} from 'echarts/components';

import type { AttrData } from '../deviceMangers/device/detail/pages/deviceCloudLog/data';

import { cloneDeep } from 'lodash';
import './index.less';

echarts.use([
  TooltipComponent,
  LegendComponent,
  PieChart,
  LineChart,
  CanvasRenderer,
  LabelLayout,
  TooltipComponent,
  GridComponent,
  UniversalTransition,
  TitleComponent,
]);

type PieEChartsOption = echarts.ComposeOption<
  TooltipComponentOption | PieSeriesOption | GridComponentOption
>;

type LineEChartsOption = echarts.ComposeOption<
  TooltipComponentOption | GridComponentOption | LegendComponentOption
>;

type deviceDataType = Partial<
  AttrData & {
    icon: React.ReactNode;
    color: string;
    unit: string;
    identifier: string;
  }
>;

type OptionDataType = {
  fileName: string;
  datas: {
    sheetData: HistoryLogType[] | number[];
    sheetName: string;
    sheetFilter: string[];
    sheetHeader: string[];
    columnWidths: number[];
  }[];
};

type HistoryLogType = {
  timestamp: string;
  dataID: string;
  value: string;
};

type OPtionType = { label: string; value: string };

const DeviceDemo: React.FC = () => {
  const [deviceData, setDeviceData] = useState<deviceDataType[]>([]);
  const [loading, setLoading] = useState(true);
  const [curTime, setCurTime] = useState('');
  const [firstTime, setFirstTime] = useState('');
  const [temPropertyHistoryData, setTemPropertyHistoryData] = useState<number[]>([]);
  const [humPropertyHistoryData, setHumPropertyHistoryData] = useState<number[]>([]);
  const [xAxisData, setXAxisData] = useState<string[]>([]);

  const [productOption, setProductOption] = useState<OPtionType[]>();
  const [deviceOption, setDeviceOption] = useState<OPtionType[]>();

  const [productID, setProductID] = useState('');
  const [deviceName, setDeviceName] = useState('');

  const page = {
    page: 1,
    size: 99999,
  };
  const pollingObj = {
    pollingInterval: 60000,
    pollingWhenHidden: false,
    pollingErrorRetryCount: 3,
  };

  const refreshDeps = [productID, deviceName];

  // 通过产品名获取产品ID
  useRequest(
    async () => {
      const res = await postApiV1ThingsProductInfoIndex({
        page,
        // productName,
      });
      return res.data.list;
    },
    {
      ...pollingObj,
      refreshDeps,
      onSuccess: (data) => {
        setProductOption(
          data?.map((item) => ({
            label: item.productName as string,
            value: item.productID as string,
          })),
        );
        if (!productID) setProductID(data?.[0].productID as string);
      },
    },
  );

  // 通过产品ID和设备名获取在线状态
  const { data: deviceDetail } = useRequest(
    async () => {
      const res = await postApiV1ThingsDeviceInfoIndex({
        page,
        productID,
      });
      return res?.data?.list;
    },
    {
      ready: !!productID,
      refreshDeps,
      ...pollingObj,
      onSuccess: (data) => {
        setDeviceOption(
          data?.map((item) => ({
            label: item.deviceName as string,
            value: item.deviceName as string,
          })),
        );
        if (!deviceName) setDeviceName(data?.[0].deviceName as string);
      },
    },
  );

  type deviceDetailType = typeof deviceDetail;
  // 获取单个id属性 - 最新属性
  const { data: attrData } = useRequest(
    async () => {
      const res = await postApiV1ThingsDeviceMsgPropertyLatestIndex({
        productID,
        deviceName,
        dataIDs: [],
      });
      return res.data;
    },
    {
      ready: !!productID && !!deviceName,
      refreshDeps,
      ...pollingObj,
    },
  );

  // 获取物模型列表
  const { data: modelList } = useRequest(
    async () => {
      const res = await postApiV1ThingsProductSchemaIndex({
        productID,
        type: 1,
      });
      return res.data;
    },
    {
      ready: !!productID && !!deviceName,
      refreshDeps,
      ...pollingObj,
    },
  );

  const getDeviceMsgPropertyLogIndex = (dataID: string) => {
    const cTime = '1678674792000';
    const fTime = '1678674773000';
    // const cTime = Date.now().toString();
    // const fTime = moment().subtract(20, 'seconds').format('x');
    setCurTime(cTime);
    setFirstTime(fTime);

    return postApiV1ThingsDeviceMsgPropertyLogIndex({
      productID: productID as string,
      deviceNames: [deviceName],
      dataID,
      timeStart: fTime,
      timeEnd: cTime,
      argFunc: 'last',
      interval: 1000,
      order: 1,
      page,
    });
  };

  // 获取单个id tem属性 历史记录
  const { data: temPropertyHistory } = useRequest(
    async () => {
      const res = await getDeviceMsgPropertyLogIndex('tem');

      return res?.data?.list || [];
    },
    {
      ready: !!productID && !!deviceName,
      refreshDeps,
      ...pollingObj,
      onBefore: () => {
        setLoading(true);
      },
      onSuccess: () => {
        setLoading(false);
      },
    },
  );
  // 获取单个id hum属性 历史记录
  const { data: humPropertyHistory } = useRequest(
    async () => {
      const res = await getDeviceMsgPropertyLogIndex('hum');
      return res?.data?.list || [];
    },
    {
      ready: !!productID && !!deviceName,
      refreshDeps,
      ...pollingObj,
      onBefore: () => {
        setLoading(true);
      },
      onSuccess: () => {
        setLoading(false);
      },
    },
  );

  // 在线状态
  const isOnline = (row: deviceDetailType) => {
    if (row?.firstLogin === '0') return '未激活';
    else if (row?.firstLogin !== '0' && row?.isOnline == 1) return '在线';
    else if (row?.firstLogin !== '0' && row?.isOnline == 2) return '离线';
    else return '-';
  };

  //采集方式
  const modelMode = (row: deviceDataType) => {
    if (!deviceDetail?.length) return '-';
    if (row?.value === 'true') return '单次采集';
    else if (row?.value === 'false') return '周期采集';
    else return '-';
  };

  const getLineOption = (): LineEChartsOption => {
    return {
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: xAxisData,
      },
      yAxis: {
        type: 'value',
        axisLine: { show: true },
        axisTick: { show: true },
        min: 0,
        max: 100,
        splitNumber: 10,
      },
      tooltip: {
        trigger: 'axis',
      },
      legend: {
        data: ['温度', '湿度'],
      },
      grid: {
        left: '2%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      series: [
        {
          name: '温度',
          type: 'line',
          data: temPropertyHistoryData,
        },
        {
          name: '湿度',
          type: 'line',
          data: humPropertyHistoryData,
        },
      ],
    };
  };

  const getPieOption = (power: number): PieEChartsOption => {
    const total = 100;
    return {
      title: {
        text: power,
        x: 'center',
        y: 'center',
        top: '38%',
        textStyle: {
          color: '#26b99a',
        },
      },
      series: [
        {
          name: '总电量',
          type: 'pie',
          radius: ['70%', '72%'],
          //环的位置
          label: {
            show: false,
            position: 'center',
          },
          data: [
            {
              value: total, //需要显示的数据
              name: '总电量',
              itemStyle: {
                color: '#26b99a',
              },
            },
          ],
        },
        {
          name: '当前电量' + power + '%',
          type: 'pie',
          radius: ['38%', '67%'],
          label: {
            show: false,
            position: 'center',
          },
          data: [
            {
              name: '当前电量' + power + '%',
              value: power,
              itemStyle: {
                color: '#26b99a',
              },
            },
            {
              value: total - power,
              itemStyle: {
                color: 'transparent',
              },
            },
          ],
        },
      ],
    };
  };

  const getDeviceValue = (item: deviceDataType) => {
    const deviceValue = {
      power: (
        <ReactEChartsCore
          echarts={echarts}
          option={getPieOption(Number(item.value))}
          lazyUpdate={true}
          style={{ height: '100px' }}
        />
      ),
      tem: `${item.value}${item.unit}`,
      signal: `${item.value}${item.unit}`,
      hum: `${item.value}${item.unit}`,
    };
    return item.value ? deviceValue[item?.dataID as string] : '-';
  };

  const handleProductChange = (val: string) => {
    setDeviceName('');
    setProductID(val);
    setLoading(true);
  };
  const handleDeviceChange = (val: string) => {
    setDeviceName(val);
    setLoading(true);
  };

  // 获取第一行的ui及数据
  const getFirstLineDeviceData = (item: deviceDataType & { key: number }) => {
    if (item?.key === 1) {
      return (
        <Select
          size="large"
          style={{ width: '150px' }}
          value={productID}
          onChange={handleProductChange}
          options={productOption}
        />
      );
    } else if (item?.key === 2) {
      return (
        <Select
          size="large"
          style={{ width: '150px' }}
          value={deviceName}
          loading={!deviceName}
          onChange={handleDeviceChange}
          options={deviceOption}
        />
      );
    } else return item.value;
  };

  const firstLineData = useMemo(
    () => [
      {
        key: 1,
        icon: <DashboardOutlined />,
        name: '所属产品名称',
        value: 'select',
      },
      {
        key: 2,
        icon: <UserOutlined />,
        name: '设备名称',
        value: 'select',
      },
      {
        key: 3,
        icon: <UserOutlined />,
        name: '通道数',
        value: '-',
      },
      {
        key: 4,
        icon: <UserOutlined />,
        name: '采集类型',
        value: '温度/湿度',
      },
      {
        key: 5,
        icon: <UserOutlined />,
        name: '采集方式',
        value: modelMode(deviceData?.find((item) => item.dataID === 'model')),
      },
      {
        key: 6,
        icon: <UserOutlined />,
        name: '状态',
        value: isOnline(
          deviceDetail?.find(
            (item) => item.productID === productID && item.deviceName === deviceName,
          ),
        ),
        // desc: 'online',
      },
    ],
    [deviceDetail, deviceName, productID, deviceData],
  );
  // const deviceData = [
  //   {
  //     key: 'hum',
  //     icon: <UserOutlined />,
  //     title: '湿度',
  //     desc: `${attrList?.[2]?.value}%RH`,
  //     color: 'blue',
  //   },
  //   {
  //     key: 'tem',
  //     icon: <UserOutlined />,
  //     title: (
  //       <div className="alarm-status">
  //         <UserOutlined />
  //         温度
  //       </div>
  //     ),
  //     desc: `${attrList?.[0]?.value}℃`,
  //     color: 'green',
  //   },
  //   {
  //     key: 'signal',
  //     icon: <UserOutlined />,
  //     title: (
  //       <div className="alarm-status">
  //         <UserOutlined />
  //         信号强度
  //       </div>
  //     ),
  //     desc: attrList?.[3]?.value ? `${attrList?.[3]?.value}dBm ` : '-',
  //     color: 'blue',
  //   },
  //   {
  //     key: 'power',
  //     icon: <UserOutlined />,
  //     title: (
  //       <div className="alarm-status">
  //         <UserOutlined />
  //         电池电量
  //       </div>
  //     ),
  //     desc: (
  //       <ReactEChartsCore
  //         echarts={echarts}
  //         option={getPieOption(Number(attrList?.[1]?.value))}
  //         lazyUpdate={true}
  //         style={{ height: '100px' }}
  //       />
  //     ),
  //     color: 'green',
  //   },
  // ];

  const alarmList = [
    {
      name: 'H',
      status: 1,
    },
    {
      name: 'T',
      status: 2,
    },
    {
      name: 'R',
      status: 1,
    },
  ];

  const handleLineChart = (_: number, e: EventTarget) => {
    e.resize();
  };

  const emptyData = new Array(20).fill(0);

  // 导出表格配置
  const handleExportCurrentExcel = () => {
    function arrToObj(arr) {
      return arr.reduce((obj, item, index: number) => {
        if (!item) return (obj[xAxisData[index]] = 0), obj;
        if (item.dataID === 'tem') return (obj[xAxisData[index]] = `${item.value}℃`), obj;
        if (item.dataID === 'hum') return (obj[xAxisData[index]] = `${item.value}%RH`), obj;
      }, {});
    }
    const columnWidths = new Array(20).fill(5);

    const temSheetData: HistoryLogType[] | number[] = [
      arrToObj(temPropertyHistory.length ? temPropertyHistory : emptyData),
    ];
    const humSheetData: HistoryLogType[] | number[] = [
      arrToObj(humPropertyHistory.length ? humPropertyHistory : emptyData),
    ];

    const option: Partial<OptionDataType> = {};
    option.fileName = `设备数据报表|${moment().format('YYYY-MM-DD HH:mm:ss')}`;
    option.datas = [
      {
        sheetData: temSheetData,
        sheetName: '温度数据曲线',
        sheetFilter: xAxisData,
        sheetHeader: xAxisData,
        columnWidths,
      },
      {
        sheetData: humSheetData,
        sheetName: '湿度数据曲线',
        sheetFilter: xAxisData,
        sheetHeader: xAxisData,
        columnWidths,
      },
    ];
    const toExcel = new ExportJsonExcel(option); //new
    toExcel.saveExcel(); //保存
  };

  // 线性插值
  const linearInterpolation = (data, firstTimestamp, currentTimestamp) => {
    const propertyHistoryData = cloneDeep(data),
      propertyData = [];
    propertyHistoryData?.sort((a, b) => Number(a.timestamp) - Number(b.timestamp));

    // 数组开始插值
    const beforeCount = Math.floor((propertyHistoryData?.[0]?.timestamp - firstTimestamp) / 1000);
    if (beforeCount >= 1) {
      const interval = Math.floor(
        (propertyHistoryData?.[0]?.timestamp - firstTimestamp) / beforeCount,
      );

      const lastTimestamp = firstTimestamp;
      for (let i = 0; i < beforeCount; i++) {
        const intervalTimestamp = Number(lastTimestamp) + interval * i;
        // 确保数组长度不超过20
        if (propertyData.length > 20) {
          propertyData.shift();
        }
        propertyData.push({
          timestamp: intervalTimestamp,
          dataID: propertyHistoryData?.[0]?.dataID,
          value: null,
        });
      }
    }

    // 遍历所有数据点,且中间插值
    for (let i = 0; i < propertyHistoryData?.length; i++) {
      const item = propertyHistoryData[i];
      const timestamp = Number(item.timestamp);
      const value = Number(item.value);

      propertyData.push({ timestamp, dataID: item.dataID, value });

      // 如果不是最后一个数据点,则插值
      if (i < propertyHistoryData?.length - 1) {
        const nextItem = propertyHistoryData[i + 1];
        const nextTimestamp = Number(nextItem.timestamp);
        const timeDiff = Math.floor((nextTimestamp - timestamp) / 1000);
        if (timeDiff > 1) {
          for (let j = 1; j < timeDiff; j++) {
            // 按照斜率计算插值
            const intervalTimestamp = timestamp + j * 1000;
            const temValue = null;
            propertyData.push({
              timestamp: intervalTimestamp,
              dataID: item.dataID,
              value: temValue,
            });
          }
        }
      }
    }

    // 判断最后一个数据点和当前时间之间是否需要插值
    if (currentTimestamp - propertyData[propertyData.length - 1].timestamp >= 1000) {
      const count = Math.min(
        Math.floor((currentTimestamp - propertyData[propertyData.length - 1].timestamp) / 1000),
        20 - temPropertyHistoryData.length,
      );
      const interval = Math.floor(
        (currentTimestamp - propertyData[propertyData.length - 1].timestamp) / count,
      );
      const lastTimestamp = propertyData[propertyData.length - 1].timestamp;
      for (let i = 1; i <= count; i++) {
        const intervalTimestamp = lastTimestamp + interval * i;
        // 确保数组长度不超过20
        if (propertyData.length > 20) {
          propertyData.shift();
        }
        propertyData.push({
          timestamp: intervalTimestamp,
          dataID: propertyData?.[0]?.dataID,
          value: null,
        });
      }
    }

    return propertyData;
  };

  useEffect(() => {
    if (!deviceDetail?.length) {
      setLoading(false);
      setTemPropertyHistoryData(Array(20).fill(null));
      setHumPropertyHistoryData(Array(20).fill(null));
    }
  }, [deviceDetail]);

  // 匹配物模型名称
  useEffect(() => {
    if (modelList && attrData) {
      const arr: deviceDataType[] = [];
      modelList?.list?.forEach((item: deviceDataType) => {
        attrData?.list?.some((list: deviceDataType, index: number) => {
          if (list?.dataID === item?.identifier) {
            arr.push({
              ...list,
              name: item?.name,
              affordance: JSON.parse(item?.affordance as string)?.define?.type,
              unit: JSON.parse(item?.affordance as string)?.define?.unit,
              icon: <UserOutlined />,
              color: index % 2 === 0 ? 'blue' : 'green',
            });
          }
          return list?.dataID === item?.identifier;
        });
      });
      if (arr.length) [arr[3], arr[1], arr[2]] = [arr[1], arr[2], arr[3]];
      setDeviceData(arr);
    }
    // if (deviceData.length) {
    //   const data: string[] = [];
    //   emptyData.forEach((item, i) => {
    //     data.push(moment().subtract(i, 'seconds').format('x'));
    //     // data.push(moment().subtract(i, 'seconds').format('HH:mm:ss'));
    //   });

    //   setXAxisData(data.reverse());
    //   setLoading(false);
    // }
  }, [attrData, deviceData.length, modelList]);

  useEffect(() => {
    const axisData = [];
    for (let i = 19; i >= 0; i--) {
      const timeStr = moment(Number(firstTime) + i * 1000).format('HH:mm:ss');
      axisData.push(timeStr);
    }
    setXAxisData(axisData.reverse());
    if (temPropertyHistory?.length && humPropertyHistory?.length) {
      if (temPropertyHistory?.length >= 1 && temPropertyHistory?.length < 20) {
        setTemPropertyHistoryData(
          linearInterpolation(temPropertyHistory, firstTime, curTime).map((item) => item.value),
        );
        setHumPropertyHistoryData(
          linearInterpolation(humPropertyHistory, firstTime, curTime).map((item) => item.value),
        );
      } else {
        setTemPropertyHistoryData(temPropertyHistory.map((item) => item.value));
        setHumPropertyHistoryData(humPropertyHistory.map((item) => item.value));
      }
    }
    if (!temPropertyHistory?.length || !humPropertyHistory?.length) {
      setTemPropertyHistoryData(Array(20).fill(null));
      setHumPropertyHistoryData(Array(20).fill(null));
    }
  }, [deviceData, temPropertyHistory, humPropertyHistory]);

  return (
    <div className="demo-wrapper">
      <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
        <List
          grid={{ column: 6 }}
          dataSource={firstLineData}
          renderItem={(item, index) => (
            <div style={{ borderRight: index < 5 ? '1px solid black' : '', paddingLeft: '20px' }}>
              <List.Item>
                <Row>
                  <Col flex={1}>
                    <div>{item.name}</div>
                  </Col>
                  <Col flex={3} />
                </Row>
                <Row>
                  <Col flex={2}>
                    <div style={{ fontSize: '24px' }}>{getFirstLineDeviceData(item)}</div>
                  </Col>
                </Row>
              </List.Item>
            </div>
          )}
        />
        <Card title="设备数据">
          <List
            grid={{ column: 4 }}
            dataSource={deviceData.slice(0, deviceData.length - 1)}
            loading={loading}
            renderItem={(item) => (
              <List.Item>
                <Row>
                  <Col flex={1}>
                    <div>{item.name}</div>
                  </Col>
                  <Col flex={3} />
                </Row>
                <Row>
                  <Col flex={2} />
                  <Col flex={2}>
                    <div style={{ color: item.color, lineHeight: '80px', fontSize: '40px' }}>
                      {deviceDetail?.length ? getDeviceValue(item) : <Empty />}
                    </div>
                  </Col>
                </Row>
              </List.Item>
            )}
          />
        </Card>
        <Row>
          <Col span={9}>
            <Card
              title="实时数据曲线"
              extra={
                <Button type="link" onClick={() => handleExportCurrentExcel()}>
                  导出
                </Button>
              }
            >
              <Spin spinning={loading}>
                <ReactEChartsCore
                  echarts={echarts}
                  option={getLineOption()}
                  style={{ height: '30vh' }}
                  onEvents={{ rendered: handleLineChart }}
                />
              </Spin>
            </Card>
          </Col>
          <Col span={9}>
            <Card
              title="实时数据曲线"
              extra={
                <Button type="link" onClick={() => handleExportCurrentExcel()}>
                  导出
                </Button>
              }
            >
              <Spin spinning={loading}>
                <div style={{ height: '30vh' }}>
                  <Empty />
                </div>
              </Spin>
            </Card>
          </Col>
          <Col span={6}>
            <Card title="实时告警">
              <div style={{ height: '30vh' }}>
                {alarmList.map((item) => (
                  <Space
                    direction="vertical"
                    size="large"
                    style={{ display: 'flex' }}
                    key={item.name}
                  >
                    <Row>
                      <Col span={6}>
                        <div className="alarm-status">
                          <Badge color={item.status == 1 ? '#26b99a' : 'red'} text={item.name} />
                        </div>
                      </Col>
                      <Col span={6}>
                        <div className="alarm-status">状态</div>
                      </Col>
                      <Col span={12}>
                        <div
                          style={{
                            color: item.status == 1 ? '#26b99a' : 'red',
                            textAlign: 'right',
                          }}
                          className="alarm-status"
                        >
                          {item.status == 1 ? '正常' : '告警'}
                        </div>
                      </Col>
                    </Row>
                  </Space>
                ))}
              </div>
            </Card>
          </Col>
        </Row>
      </Space>
    </div>
  );
};

export default DeviceDemo;
