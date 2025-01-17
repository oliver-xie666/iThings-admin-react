/**
 * request 网络请求工具
 * 更详细的 api 文档: https://github.com/umijs/umi-request
 */
import { history } from '@umijs/max';
import { notification } from 'antd';
import { stringify } from 'querystring';
import { extend } from 'umi-request';
import { GUIDKEY, iThingsSetToken, TOKENKEY } from './const';
import { getTimestamp, getToken, setToken, setUID } from './utils';

// const codeMessage = {
//   200: '服务器成功返回请求的数据。',
//   201: '新建或修改数据成功。',
//   202: '一个请求已经进入后台排队（异步任务）。',
//   204: '删除数据成功。',
//   400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
//   401: '用户没有权限（令牌、用户名、密码错误）。',
//   403: '用户得到授权，但是访问是被禁止的。',
//   404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
//   406: '请求的格式不可得。',
//   410: '请求的资源被永久删除，且不会再得到的。',
//   422: '当创建一个对象时，发生一个验证错误。',
//   500: '服务器发生错误，请检查服务器。',
//   502: '网关错误。',
//   503: '服务不可用，服务器暂时过载或维护。',
//   504: '网关超时。',
// };

/**
 * 异常处理程序
 */
const errorHandler = (error: { response: Response }): Response => {
  const { response } = error;

  if (response && response.status) {
    response
      .clone()
      .text()
      .then((v) => {
        try {
          const data = JSON.parse(v);
          notification.error({
            message: `请求错误, 错误码:${data.code}`,
            description: data.message || data.msg,
          });
        } catch {
          notification.error({
            message: `请求错误, 错误码:${response.status}`,
            description: v,
          });
        }
      });
  } else if (!response) {
    notification.error({
      description: '您的网络发生异常，无法连接服务器',
      message: '网络异常',
    });
  }

  return response;
};

const redirectLoginPage = () => {
  const queryString = stringify({
    redirect: window.location.href,
  });
  history.push(`/user/login?${queryString}`);
};

// 请求拦截
const authInterceptor = (url: string, options: any) => {
  const token = getToken();
  options.headers[GUIDKEY] = getTimestamp();

  if (token && options.headers) {
    options.headers[TOKENKEY] = token;
  }
  const IThingsSetTokenValue = localStorage.getItem('iThingsSetToken');

  if (IThingsSetTokenValue) {
    options.headers[TOKENKEY] = IThingsSetTokenValue;
  }
  return {
    url,
    options: { ...options },
  };
};

//响应拦截器
const responseInterceptors = (response: any) => {
  const IThingsSetTokenValue = response.headers.get(iThingsSetToken);
  if (IThingsSetTokenValue) {
    setToken(IThingsSetTokenValue);
    localStorage.setItem('iThingsSetToken', IThingsSetTokenValue);
  } else {
    localStorage.setItem('iThingsSetToken', '');
  }

  if (response.status === 401 && window.location.pathname !== '/user/login') {
    setToken('');
    setUID('');
    return redirectLoginPage();
  }
  return response;
};

/**
 * 配置request请求时的默认参数
 */
const request = extend({
  errorHandler, // 默认错误处理
  credentials: 'include', // 默认请求是否带上cookie
  timeout: 200000,
});

export const stream = extend({
  credentials: 'include',
  parseResponse: false,
});

request.interceptors.request.use(authInterceptor, { global: false });

stream.interceptors.request.use(authInterceptor, { global: false });

request.interceptors.response.use(responseInterceptors, { global: false });

export default request;
