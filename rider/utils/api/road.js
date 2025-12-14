/**
 * 道路/路线相关 API
 * 提供取货地与目的地经纬度查询
 */

import { request } from '../api.js';

// 后端接口路径
const ROAD_API = {
  PICKUP: '/riderRoad/pickup',
  TARGET: '/riderRoad/target'
};

/**
 * 获取取货地经纬度
 */
export async function getPickupCoords() {
  return request({
    url: ROAD_API.PICKUP,
    method: 'GET'
  });
}

/**
 * 获取目的地经纬度
 */
export async function getTargetCoords() {
  return request({
    url: ROAD_API.TARGET,
    method: 'GET'
  });
}

export default {
  getPickupCoords,
  getTargetCoords
};