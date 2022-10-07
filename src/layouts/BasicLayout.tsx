import RightContent from '@/components/RightContent';
import type { MenuDataItem } from '@ant-design/pro-layout';
import { ProLayout } from '@ant-design/pro-layout';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/es/locale/zh_CN';
import moment from 'moment';
import 'moment/locale/zh-cn';
import React from 'react';
// @ts-ignore
import { Link, useModel } from 'umi';
import defaultSettings from '../../config/defaultSettings';
moment.locale('zh-cn');

const BasicLayout: React.FC = (props) => {
  const { children } = props;
  const { initialState } = useModel('@@initialState');
  const menuTree = initialState?.currentUser?.menuInfo;

  return (
    <ProLayout
      siderWidth={250}
      rightContentRender={() => <RightContent />}
      disableContentMargin={false}
      footerRender={false}
      menuItemRender={(menuItemProps: any, defaultDom: any) => {
        if (menuItemProps.isUrl || menuItemProps.children || !menuItemProps.path) {
          return (
            // @ts-ignore
            <Link to={menuItemProps.path ? menuItemProps.path : '#'}>{defaultDom}</Link>
          );
        }
        if (menuItemProps.pro_layout_parentKeys.length < 2) {
          // @ts-ignore
          return <Link to={menuItemProps.path}>{defaultDom}</Link>;
        } else {
          return (
            // @ts-ignore
            <Link to={menuItemProps.path}>
              {menuItemProps.icon}
              {defaultDom}
            </Link>
          );
        }
      }}
      subMenuItemRender={(TWTProps: any, defaultDom: any) => {
        return (
          <>
            <div>{defaultDom}</div>
          </>
        );
      }}
      menuDataRender={() => menuTree as MenuDataItem[]}
      collapsedButtonRender={false}
      {...props}
      {...defaultSettings}
    >
      <div>
        <ConfigProvider locale={zhCN}>{children}</ConfigProvider>
      </div>
    </ProLayout>
  );
};

export default BasicLayout;
