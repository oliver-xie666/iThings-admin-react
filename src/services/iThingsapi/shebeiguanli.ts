// @ts-ignore
/* eslint-disable */
import request from '@/utils/request';

/** 设备统计详情 POST /api/v1/things/device/info/count */
export async function postApiV1ThingsDeviceInfoCount(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.postApiV1ThingsDeviceInfoCountParams,
  body: {
    endTime: number;
    startTime: number;
  },
  options?: { [key: string]: any },
) {
  return request<{
    code: number;
    msg: string;
    data: {
      deviceCount: { online?: number; offline?: number; inactive?: number; unknown?: number };
      deviceTypeCount: { device?: number; gateway?: number; subset?: number; unknown?: number };
    };
  }>('/api/v1/things/device/info/count', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    params: {
      ...params,
    },
    data: body,
    ...(options || {}),
  });
}

/** 新增设备 POST /api/v1/things/device/info/create */
export async function postApiV1ThingsDeviceInfoCreate(
  body: {
    /** 不可修改 */
    productID: string;
    /** 不可修改 */
    deviceName: string;
    /** 1)关闭 2)错误 3)告警 4)信息 5)调试  */
    logLevel?: number;
    tags?: { key?: string; value?: string }[];
    /** 设备所在地址 */
    address?: string;
    /** 设备点坐标，,默认百度坐标系 */
    position?: { longitude?: number; latitude?: number };
  },
  options?: { [key: string]: any },
) {
  return request<{ code: number; msg: string }>('/api/v1/things/device/info/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 删除设备 POST /api/v1/things/device/info/delete */
export async function postApiV1ThingsDeviceInfo__openAPI__delete(
  body: {
    /** 不可修改 */
    productID: string;
    /** 不可修改 */
    deviceName: string;
  },
  options?: { [key: string]: any },
) {
  return request<{ code: number; msg: string }>('/api/v1/things/device/info/delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 获取设备列表 POST /api/v1/things/device/info/index */
export async function postApiV1ThingsDeviceInfoIndex(
  body: {
    page?: { page?: number; size?: number };
    /** 为空时获取所有产品 */
    productID?: string;
    deviceName?: string;
    /** 非模糊查询 为tag的名,value为tag对应的值 */
    tags?: { key?: string; value?: string }[];
    /** 过滤条件:距离坐标点固定范围内的设备 单位：米 */
    range?: number;
    /** 设备定位,默认百度坐标系，用于获取以该点为中心，Range范围内的设备列表，与Range连用 */
    position?: { longitude?: number; latitude?: number };
  },
  options?: { [key: string]: any },
) {
  return request<{
    code: number;
    msg: string;
    data: {
      list?: {
        productID?: string;
        deviceName?: string;
        createdTime?: string;
        secret?: string;
        firstLogin?: string;
        lastLogin?: string;
        version?: string;
        logLevel?: number;
        tags?: { key?: string; value?: string }[];
        isOnline?: number;
        address?: string;
        position: { longitude?: number; latitude?: number };
      }[];
      total?: number;
      num?: number;
    };
  }>('/api/v1/things/device/info/index', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 批量导入设备 #### 前端处理逻辑建议：
- UI text 显示 导入成功 设备数：total - len(errdata)
- UI text 显示 导入失败 设备数：len(errdata)
- UI table 显示 导入失败设备清单明细 POST /api/v1/things/device/info/multi-import */
export async function postApiV1ThingsDeviceInfoMultiImport(
  body: {},
  file?: File,
  options?: { [key: string]: any },
) {
  const formData = new FormData();

  if (file) {
    formData.append('file', file);
  }

  Object.keys(body).forEach((ele) => {
    const item = (body as any)[ele];

    if (item !== undefined && item !== null) {
      formData.append(
        ele,
        typeof item === 'object' && !(item instanceof File) ? JSON.stringify(item) : item,
      );
    }
  });

  return request<{
    code: number;
    msg: string;
    data: {
      total?: number;
      errdata?: {
        row?: number;
        productName?: string;
        deviceName?: string;
        logLevel?: string;
        tags?: string;
        position?: string;
        address?: string;
        tips?: string;
      }[];
      headers: {
        row?: number;
        productName?: string;
        deviceName?: string;
        logLevel?: string;
        tags?: string;
        position?: string;
        address?: string;
        tips?: string;
      };
    };
  }>('/api/v1/things/device/info/multi-import', {
    method: 'POST',
    data: formData,
    requestType: 'form',
    ...(options || {}),
  });
}

/** 获取设备详情 POST /api/v1/things/device/info/read */
export async function postApiV1ThingsDeviceInfoRead(
  body: {
    /** 为空时获取所有产品 */
    productID: string;
    deviceName: string;
  },
  options?: { [key: string]: any },
) {
  return request<{
    code: number;
    msg: string;
    data: {
      productID?: string;
      deviceName?: string;
      createdTime?: string;
      secret?: string;
      firstLogin?: string;
      lastLogin?: string;
      version?: string;
      logLevel?: number;
      imei?: string;
      mac?: string;
      hardInfo?: string;
      softInfo?: string;
      tags?: { key?: string; value?: string }[];
      isOnline?: number;
      address?: string;
      position: { longitude?: number; latitude?: number };
    };
  }>('/api/v1/things/device/info/read', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 更新设备 POST /api/v1/things/device/info/update */
export async function postApiV1ThingsDeviceInfoUpdate(
  body: {
    /** 不可修改 */
    productID: string;
    /** 不可修改 */
    deviceName: string;
    /** 1)关闭 2)错误 3)告警 4)信息 5)调试  */
    logLevel?: number;
    tags?: { key?: string; value?: string }[];
    /** 设备所在地址 */
    address?: string;
    /** 设备坐标点,默认百度坐标系 */
    position?: { longitude?: number; latitude?: number };
  },
  options?: { [key: string]: any },
) {
  return request<{ code: number; msg: string }>('/api/v1/things/device/info/update', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
