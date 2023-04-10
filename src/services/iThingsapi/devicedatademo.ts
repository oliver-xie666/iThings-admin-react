import request from '@/utils/request';

// 设备大屏静态图
export async function postApiV1Fw2ef(options?: { [key: string]: any }) {
  return request<{
    code: number;
    msg: string;
    data: {
      productID: string;
      type: 1 | 2;
      identifier: string;
      name: string;
      desc: string;
      required: number;
      value: number[][];
      length: string;
    };
  }>('/api/v1/app/123/fw2ef', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    ...(options || {}),
  });
}
