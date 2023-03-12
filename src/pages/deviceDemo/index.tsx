import { postApiV1ThingsProductInfoIndex } from '@/services/iThingsapi/chanpinguanli';
import { postApiV1ThingsDeviceInfoIndex } from '@/services/iThingsapi/shebeiguanli';
import {
  postApiV1ThingsDeviceMsgPropertyLatestIndex,
  postApiV1ThingsDeviceMsgPropertyLogIndex,
} from '@/services/iThingsapi/shebeixiaoxi';
import { postApiV1ThingsProductSchemaIndex } from '@/services/iThingsapi/wumoxing';
import { DashboardOutlined, UserOutlined } from '@ant-design/icons';
import { useRequest } from 'ahooks';
import { Badge, Button, Card, Col, List, Row, Space, Spin, Statistic } from 'antd';
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

const DeviceDemo: React.FC<{
  productName: string;
  deviceName: string;
}> = ({ productName = '温湿度传感器', deviceName = 'EC800M' }) => {
  const [deviceData, setDeviceData] = useState<deviceDataType[]>([]);
  const [loading, setLoading] = useState(true);
  const [temPropertyHistoryData, setTemPropertyHistoryData] = useState<number[]>([]);
  const [humPropertyHistoryData, setHumPropertyHistoryData] = useState<number[]>([]);
  const [xAxisData, setXAxisData] = useState<string[]>([]);

  const page = {
    page: 1,
    size: 99999,
  };
  // 通过产品名获取产品ID
  const { data: productDetail } = useRequest(async () => {
    const res = await postApiV1ThingsProductInfoIndex({
      page,
      productName,
    });
    return res.data.list?.[0];
  });

  // 通过产品ID和设备名获取在线状态
  const { data: deviceDetail } = useRequest(
    async () => {
      const res = await postApiV1ThingsDeviceInfoIndex({
        page,
        productID: productDetail?.productID as string,
        deviceName,
      });
      return res.data.list?.[0];
    },
    {
      ready: Boolean(productDetail?.productID),
    },
  );

  type deviceDetailType = typeof deviceDetail;
  // 获取单个id属性 - 最新属性
  const { data: attrData } = useRequest(
    async () => {
      const res = await postApiV1ThingsDeviceMsgPropertyLatestIndex({
        productID: productDetail?.productID as string,
        deviceName,
        dataIDs: [],
      });
      return res.data;
    },
    {
      ready: Boolean(productDetail?.productID),
    },
  );

  // 获取物模型列表
  const { data: modelList } = useRequest(
    async () => {
      const res = await postApiV1ThingsProductSchemaIndex({
        productID: productDetail?.productID as string,
        type: 1,
      });
      return res.data;
    },
    {
      ready: Boolean(productDetail?.productID),
    },
  );

  const getDeviceMsgPropertyLogIndex = (dataID: string) => {
    const subtractTime = moment().subtract(10, 'seconds').format('x');
    const curTime = moment().subtract(5, 'seconds').format('x');
    return postApiV1ThingsDeviceMsgPropertyLogIndex(
      {
        productID: productDetail?.productID as string,
        deviceNames: [deviceName],
        dataID,
        timeStart: subtractTime,
        timeEnd: curTime,
        argFunc: 'avg',
        interval: 1000,
        order: 1,
        page,
      },
      // {
      //   productID: '25RKSGsdAZi',
      //   deviceNames: ['yl_test'],
      //   dataID: 'tem',
      //   timeStart: '1678540241000',
      //   timeEnd: '1678543841000',
      //   argFunc: 'avg',
      //   interval: 1000,
      // },
    );
  };

  // 获取单个id tem属性 历史记录
  const { data: temPropertyHistory } = useRequest(
    async () => {
      const res = await getDeviceMsgPropertyLogIndex('tem');
      return res.data.list;
    },
    {
      ready: Boolean(productDetail?.productID),
    },
  );
  // 获取单个id hum属性 历史记录
  const { data: humPropertyHistory } = useRequest(
    async () => {
      const res = await getDeviceMsgPropertyLogIndex('tem');
      return res.data.list;
    },
    {
      ready: Boolean(productDetail?.productID),
    },
  );

  const isOnline = (row: deviceDetailType) => {
    if (row?.firstLogin === '0') return '未激活';
    else if (row?.firstLogin !== '0' && row?.isOnline == 1) return '在线';
    else return '离线';
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

  const firstLineData = useMemo(
    () => [
      {
        key: 1,
        icon: <UserOutlined />,
        title: '设备名称',
        desc: deviceName,
      },
      {
        key: 2,
        icon: <DashboardOutlined />,
        title: '所属产品名称',
        desc: productName,
      },
      {
        key: 3,
        icon: <UserOutlined />,
        title: '通道数',
        desc: '-',
      },
      {
        key: 4,
        icon: <UserOutlined />,
        title: '采集类型',
        desc: '温度/湿度',
      },
      {
        key: 5,
        icon: <UserOutlined />,
        title: '采集方式',
        desc: deviceData?.[4]?.value === 'true' ? '单次采集' : '周期采集',
      },
      {
        key: 6,
        icon: <UserOutlined />,
        title: '状态',
        desc: isOnline(deviceDetail),
        // desc: 'online',
      },
    ],
    [deviceDetail, deviceName, productName, deviceData],
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

  const emptyData = [0, 0, 0, 0, 0];

  const handleExportCurrentExcel = () => {
    function arrToObj(arr) {
      return arr.reduce((obj, item, index: number) => {
        if (!item) return (obj[xAxisData[index]] = 0), obj;
        return (obj[xAxisData[index]] = item.value), obj;
      }, {});
    }
    const columnWidths = [5, 5, 5, 5, 5];

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

  // 匹配物模型名称
  useEffect(() => {
    if (modelList && attrData) {
      const arr: deviceDataType[] = [];
      modelList?.list?.forEach((item: deviceDataType) => {
        attrData.list?.some((list: deviceDataType, index: number) => {
          if (list.dataID === item.identifier) {
            arr.push({
              ...list,
              name: item.name,
              affordance: JSON.parse(item.affordance as string).define.type,
              unit: JSON.parse(item.affordance as string).define.unit,
              icon: <UserOutlined />,
              color: index % 2 === 0 ? 'blue' : 'green',
            });
          }
          return list.dataID === item.identifier;
        });
      });
      [arr[3], arr[1], arr[2]] = [arr[1], arr[2], arr[3]];
      setDeviceData(arr);
    }
    if (deviceData.length) {
      const data: string[] = [];
      deviceData.forEach((item, i) => {
        data.push(moment().subtract(i, 'seconds').format('HH:mm:ss'));
      });

      setXAxisData(data.reverse());
      setLoading(false);
    }
  }, [attrData, deviceData.length, modelList]);

  useEffect(() => {
    if (temPropertyHistory?.length) {
      const arr: number[] = [];
      temPropertyHistory.forEach((temItem: HistoryLogType) => {
        arr.push(Number(temItem.value));
      });
      setTemPropertyHistoryData(arr);
    } else {
      setTemPropertyHistoryData(emptyData);
    }
  }, [temPropertyHistory]);

  useEffect(() => {
    if (humPropertyHistory?.length) {
      const arr: number[] = [];
      humPropertyHistory.forEach((temItem: HistoryLogType) => {
        arr.push(Number(temItem.value));
      });
      setHumPropertyHistoryData(arr);
    } else {
      setHumPropertyHistoryData(emptyData);
    }
  }, [humPropertyHistory]);

  return (
    <div className="demo-wrapper">
      <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
        <List
          grid={{ column: 6 }}
          dataSource={firstLineData}
          renderItem={(item, index) => (
            <div style={{ borderRight: index < 5 ? '1px solid black' : '', paddingLeft: '20px' }}>
              <List.Item>
                <Statistic
                  title={
                    <>
                      <>{item.icon}</>
                      <>{item.title}</>
                    </>
                  }
                  value={item.desc}
                />
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
                      {getDeviceValue(item)}
                    </div>
                  </Col>
                </Row>
              </List.Item>
            )}
          />
        </Card>
        <Row>
          <Col span={16}>
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
          <Col span={8}>
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
